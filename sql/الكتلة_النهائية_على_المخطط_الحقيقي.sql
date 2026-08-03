-- ============================================================================
-- أرفا — الكتلة الأخيرة، مكتوبة على المخطط الحقيقي المؤكَّد من قاعدتك
--
-- ما تأكّد بالفحص المباشر:
--   • policies: question / answer / source ∈ (manual, auto_learned) — وُسّع، والبحث العربي يعمل
--   • pending_followups: status ∈ (pending, resolved) · gap_type بخمس قيم — وُسّع
--   • products:  name, description, price, stock, counts_against_limit, category
--   • services:  name, description, price, available, counts_against_limit, category
--   • RLS مفعّل على كل شيء عدا plans، وبصفر سياسات — و n8n يعمل بـ service_role
--
-- شغّل الكتل بالترتيب. كلها idempotent.
-- ============================================================================


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ ١٤ — عمود الإظهار على الكتالوج                                           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- لا يوجد في products ولا services أي عمود إظهار: products فيه stock (مخزون)
-- و services فيه available (متاح للحجز) — وكلاهما مفهوم تجاري مختلف عن
-- «مخفي عن الكتالوج». بدون هذا العمود لا يستطيع صاحب المتجر تحرير خانة
-- إلا بالحذف، والحذف غير متاح له.
alter table public.products add column if not exists is_active boolean not null default true;
alter table public.services add column if not exists is_active boolean not null default true;

-- ⚠️ يستلزم تعديلاً في n8n: أدوات البحث عن المنتجات والخدمات يجب أن تضيف
--    and is_active إلى شرطها، وإلا عرض البوت عناصر أخفاها صاحب المتجر.

-- توسيع status ليقبل الإهمال. القيد الحالي يسمح بـ pending / resolved فقط،
-- والإضافة لا تكسر أي صف قائم ولا أي كتابة من n8n.
do $$ begin
  alter table public.pending_followups drop constraint if exists pending_followups_status_check;
  alter table public.pending_followups add constraint pending_followups_status_check
    check (status in ('pending','resolved','dismissed'));
end $$;

-- تحقّق:
select conname, pg_get_constraintdef(oid) from pg_constraint
where conname = 'pending_followups_status_check';


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ ١٥ — دوال الحدود و triggers الفرض                                        ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create or replace function public.arpha_effective_limit(p_store_id uuid, p_kind text)
returns int language plpgsql stable security definer
set search_path = public, pg_temp
as $$
declare v int;
begin
  select case p_kind
    when 'catalog'  then coalesce(s.max_catalog_items_override, p.max_catalog_items, 50)
    when 'rules'    then coalesce(s.max_bot_rules_override,     p.max_bot_rules,     10)
    when 'policies' then coalesce(s.max_policies_override,      p.max_policies,      30)
  end into v
  from public.stores s
  left join public.plans p on p.id = s.plan_id
  where s.id = p_store_id;
  return coalesce(v, 0);
end $$;

-- حد واحد يجمع المنتجات والخدمات: «١٠٠ منتج» = ١٠٠ عنصر أياً كان نوعه.
-- counts_against_limit = false يُستثنى، وهو قرار الأدمن لا صاحب المتجر.
create or replace function public.arpha_count_catalog(p_store_id uuid)
returns int language sql stable security definer
set search_path = public, pg_temp
as $$
  select (
    (select count(*) from public.products
      where store_id = p_store_id and coalesce(counts_against_limit,true) and coalesce(is_active,true))
  + (select count(*) from public.services
      where store_id = p_store_id and coalesce(counts_against_limit,true) and coalesce(is_active,true))
  )::int;
$$;

create or replace function public.arpha_enforce_catalog_limit()
returns trigger language plpgsql security definer
set search_path = public, pg_temp
as $$
declare v_limit int; v_used int;
begin
  if coalesce(new.counts_against_limit, true) = false then
    return new;
  end if;

  v_limit := public.arpha_effective_limit(new.store_id, 'catalog');
  v_used  := public.arpha_count_catalog(new.store_id);

  if v_used >= v_limit then
    raise exception 'ARPHA_LIMIT:catalog:%:%', v_used, v_limit
      using hint = 'حد الباقة للكتالوج ممتلئ. أخفِ عنصراً أو راجع الإدارة.';
  end if;
  return new;
end $$;

drop trigger if exists trg_products_catalog_limit on public.products;
create trigger trg_products_catalog_limit before insert on public.products
  for each row execute function public.arpha_enforce_catalog_limit();

drop trigger if exists trg_services_catalog_limit on public.services;
create trigger trg_services_catalog_limit before insert on public.services
  for each row execute function public.arpha_enforce_catalog_limit();

-- إعادة تفعيل عنصر مخفي تحسب خانة أيضاً — وإلا صار الإخفاء ثغرة تجاوز.
create or replace function public.arpha_enforce_catalog_reactivate()
returns trigger language plpgsql security definer
set search_path = public, pg_temp
as $$
declare v_limit int; v_used int;
begin
  if old.is_active = false and new.is_active = true
     and coalesce(new.counts_against_limit, true) then
    v_limit := public.arpha_effective_limit(new.store_id, 'catalog');
    v_used  := public.arpha_count_catalog(new.store_id);
    if v_used >= v_limit then
      raise exception 'ARPHA_LIMIT:catalog:%:%', v_used, v_limit
        using hint = 'لا خانة فارغة لإعادة الإظهار.';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_products_catalog_reactivate on public.products;
create trigger trg_products_catalog_reactivate before update on public.products
  for each row execute function public.arpha_enforce_catalog_reactivate();

drop trigger if exists trg_services_catalog_reactivate on public.services;
create trigger trg_services_catalog_reactivate before update on public.services
  for each row execute function public.arpha_enforce_catalog_reactivate();

-- حدّا السياسات والقواعد
create or replace function public.arpha_enforce_row_limit()
returns trigger language plpgsql security definer
set search_path = public, pg_temp
as $$
declare v_kind text := tg_argv[0]; v_limit int; v_used int;
begin
  v_limit := public.arpha_effective_limit(new.store_id, v_kind);
  if v_kind = 'rules' then
    select count(*) into v_used from public.bot_rules where store_id = new.store_id and is_active;
  else
    select count(*) into v_used from public.policies  where store_id = new.store_id and is_active;
  end if;

  if v_used >= v_limit then
    raise exception 'ARPHA_LIMIT:%:%:%', v_kind, v_used, v_limit
      using hint = 'حد الباقة ممتلئ لهذا النوع. عطّل عنصراً قديماً أو راجع الإدارة.';
  end if;
  return new;
end $$;

drop trigger if exists trg_bot_rules_limit on public.bot_rules;
create trigger trg_bot_rules_limit before insert on public.bot_rules
  for each row execute function public.arpha_enforce_row_limit('rules');

drop trigger if exists trg_policies_limit on public.policies;
create trigger trg_policies_limit before insert on public.policies
  for each row execute function public.arpha_enforce_row_limit('policies');

-- تحقّق — يجب أن ترى ٦ triggers:
select tgname, tgrelid::regclass as on_table from pg_trigger
where tgname like 'trg_%limit%' or tgname like 'trg_%reactivate%'
order by tgname;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ ١٦ — RPCs التي يستدعيها التطبيق                                          ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create or replace function public.store_my_limits()
returns json language plpgsql stable security definer
set search_path = public, pg_temp
as $$
declare v_store uuid := public.auth_store_id();
begin
  if v_store is null then return null; end if;
  return json_build_object(
    'store_id',       v_store,
    'catalog_used',   public.arpha_count_catalog(v_store),
    'catalog_limit',  public.arpha_effective_limit(v_store,'catalog'),
    'rules_used',     (select count(*) from public.bot_rules where store_id=v_store and is_active),
    'rules_limit',    public.arpha_effective_limit(v_store,'rules'),
    'policies_used',  (select count(*) from public.policies  where store_id=v_store and is_active),
    'policies_limit', public.arpha_effective_limit(v_store,'policies'),
    'pending_count',  (select count(*) from public.pending_followups
                       where store_id=v_store and status='pending')
  );
end $$;

grant execute on function public.store_my_limits() to authenticated;

-- التعليم: جواب صاحب المتجر يصير سياسة، والسؤال يُغلق — في معاملة واحدة.
-- source = 'auto_learned' لأن قيد policies_source_check يسمح بها ولا يسمح بغيرها.
-- confirmed_permanent كان موجوداً في تصميمك أصلاً وهو بالضبط خانة «احفظه دائماً».
create or replace function public.store_answer_question(
  p_question_id    uuid,
  p_answer         text,
  p_save_as_policy boolean default true,
  p_category       text default 'general'
) returns json
language plpgsql security invoker
set search_path = public, pg_temp
as $$
declare q public.pending_followups%rowtype; v_policy uuid; v_user uuid;
begin
  select * into q from public.pending_followups where id = p_question_id;
  if not found then raise exception 'ARPHA_NOT_FOUND: السؤال غير موجود أو لا يخص متجرك'; end if;
  if q.status <> 'pending' then raise exception 'ARPHA_STATE: هذا السؤال مُعالَج مسبقاً'; end if;
  if length(trim(coalesce(p_answer,''))) < 2 then raise exception 'ARPHA_INPUT: الجواب فارغ'; end if;

  select id into v_user from public.store_users where auth_user_id = auth.uid();

  if p_save_as_policy then
    insert into public.policies (store_id, question, answer, category, source, source_question_id)
    values (q.store_id, q.question_text, p_answer, coalesce(p_category,'general'), 'auto_learned', q.id)
    returning id into v_policy;
  end if;

  update public.pending_followups
     set status              = 'resolved',
         resolved_answer     = p_answer,
         confirmed_permanent = p_save_as_policy,
         answered_by         = v_user,
         policy_id           = v_policy,
         resolved_at         = now(),
         updated_at          = now()
   where id = q.id;

  return json_build_object('question_id', q.id, 'policy_id', v_policy,
                           'telegram_chat_id', q.telegram_chat_id, 'answer', p_answer);
end $$;

grant execute on function public.store_answer_question(uuid,text,boolean,text) to authenticated;

create or replace function public.store_mark_question_sent(
  p_question_id uuid, p_ok boolean, p_error text default null
) returns void language sql security invoker
set search_path = public, pg_temp
as $$
  update public.pending_followups
     set sent_to_customer = p_ok,
         sent_at    = case when p_ok then now() else null end,
         send_error = p_error,
         updated_at = now()
   where id = p_question_id;
$$;

grant execute on function public.store_mark_question_sent(uuid,boolean,text) to authenticated;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ ١٧ — RPCs التي يستدعيها n8n (بمفتاح service_role)                        ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create or replace function public.bot_search_policies(
  p_store_id uuid, p_query text, p_limit int default 4
) returns table (id uuid, question text, answer text, category text, rank real)
language sql stable security definer
set search_path = public, pg_temp
as $$
  select p.id, p.question, p.answer, p.category,
         ts_rank(p.search_vector, websearch_to_tsquery('arabic', p_query)) as rank
  from public.policies p
  where p.store_id = p_store_id
    and p.is_active and not p.disabled_by_admin
    and p.search_vector @@ websearch_to_tsquery('arabic', p_query)
  order by rank desc
  limit greatest(1, least(p_limit, 10));
$$;

create or replace function public.bot_get_context(p_store_id uuid)
returns json language sql stable security definer
set search_path = public, pg_temp
as $$
  select json_build_object(
    'rules', coalesce((select json_agg(r.rule_text order by r.priority, r.created_at)
                       from public.bot_rules r
                       where r.store_id = p_store_id and r.is_active), '[]'::json),
    'policy_questions', coalesce((select json_agg(p.question order by p.updated_at desc)
                                  from public.policies p
                                  where p.store_id = p_store_id and p.is_active
                                    and not p.disabled_by_admin), '[]'::json)
  );
$$;

-- p_gap_type مقيّد بخمس قيم في قيد pending_followups_gap_type_check:
--   product_attribute · product_availability · service_availability
--   policy_question   · custom_request
-- الافتراضي policy_question — أنسب لسؤال لم يجد جواباً في السياسات.
create or replace function public.bot_log_pending_question(
  p_store_id        uuid,
  p_question        text,
  p_chat_id         text    default null,
  p_customer_id     uuid    default null,
  p_conversation_id uuid    default null,
  p_bot_reply       text    default null,
  p_gap_type        text    default 'policy_question'
) returns uuid
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  -- كبح التكرار: نفس السؤال من نفس المتجر خلال ساعة يرجع نفس الـ id.
  select id into v_id from public.pending_followups
  where store_id = p_store_id
    and question_text = p_question
    and status = 'pending'
    and created_at > now() - interval '1 hour'
  limit 1;

  if v_id is not null then return v_id; end if;

  insert into public.pending_followups
    (store_id, customer_id, conversation_id, telegram_chat_id,
     question_text, bot_reply, gap_type, status)
  values
    (p_store_id, p_customer_id, p_conversation_id, p_chat_id,
     p_question, p_bot_reply, p_gap_type, 'pending')
  returning id into v_id;

  return v_id;
end $$;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ ١٨ — سياسات RLS، على أسماء جداولك الحقيقية                              ║
-- ║                                                                          ║
-- ║ آمنة: n8n يعمل بـ service_role الذي يتجاوز RLS. أُثبت ذلك بأن products    ║
-- ║ عليه RLS بصفر سياسات والبوت يقرأ منه — لا مفتاح آخر يستطيع ذلك.          ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- store_users: بلا auth_store_id() تفادياً للتكرار اللانهائي
drop policy if exists store_users_self_read on public.store_users;
create policy store_users_self_read on public.store_users
  for select to authenticated using (auth_user_id = auth.uid());

-- المتجر: قراءة فقط. الباقة والحدود وحالة الخدمة يملكها الأدمن وحده.
drop policy if exists stores_own_read on public.stores;
create policy stores_own_read on public.stores
  for select to authenticated using (id = public.auth_store_id());

-- الطلبات: يفتحها ويقرأها ولا يغيّر حالتها
drop policy if exists change_requests_tenant_read on public.store_change_requests;
create policy change_requests_tenant_read on public.store_change_requests
  for select to authenticated using (store_id = public.auth_store_id());

drop policy if exists change_requests_tenant_insert on public.store_change_requests;
create policy change_requests_tenant_insert on public.store_change_requests
  for insert to authenticated with check (store_id = public.auth_store_id());

do $$
declare
  -- قراءة وكتابة: ما يملكه صاحب المتجر فعلاً
  rw text[] := array['products','services','product_media','policies',
                     'bot_rules','pending_followups'];
  -- قراءة فقط: ما ينتجه البوت ويتابعه هو
  ro text[] := array['orders','order_items','order_status_log','customers',
                     'conversations','messages','usage_events','customer_memories'];
  t text;
begin
  foreach t in array rw loop
    execute format('drop policy if exists %I_tenant_all on public.%I', t, t);
    execute format($p$
      create policy %I_tenant_all on public.%I for all to authenticated
        using (store_id = public.auth_store_id())
        with check (store_id = public.auth_store_id())
    $p$, t, t);
  end loop;

  foreach t in array ro loop
    execute format('drop policy if exists %I_tenant_read on public.%I', t, t);
    execute format($p$
      create policy %I_tenant_read on public.%I for select to authenticated
        using (store_id = public.auth_store_id())
    $p$, t, t);
  end loop;
end $$;

-- store_platform_credentials يبقى بلا سياسة عمداً: فارغ بالتصميم، ولا سبب
-- لأن تراه بوابة المتجر. plans يبقى بلا RLS كما كان — الحدود تصل عبر
-- store_my_limits() وهي security definer.
--
-- قاعدة المشروع محفوظة: منع تعديل products.name يخص الوكلاء الآليين لأن
-- إعادة التسمية طريقة الالتفاف على الحد. سياسة tenant_all أعلاه تخص الإنسان
-- المصادَق يعدّل كتالوجه هو — وهو الاستثناء المنصوص عليه.


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ ١٩ — التدقيق النهائي. أرسل لي نتيجة (أ) و(ب).                            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- (أ) كل جدول وعدد سياساته. لا يجوز أن يبقى جدول يحمل store_id بصفر سياسات
--     إلا store_platform_credentials.
select t.tablename, t.rowsecurity as rls_on,
       (select count(*) from pg_policies p
        where p.schemaname='public' and p.tablename=t.tablename) as policies
from pg_tables t where t.schemaname='public'
order by policies, t.tablename;

-- (ب) الحدود والاستهلاك لمتجرك الحقيقي
select s.id, s.name, s.service_status,
       public.arpha_count_catalog(s.id)              as catalog_used,
       public.arpha_effective_limit(s.id,'catalog')  as catalog_limit,
       (select count(*) from public.policies where store_id=s.id and is_active) as policies_used,
       public.arpha_effective_limit(s.id,'policies') as policies_limit,
       (select count(*) from public.pending_followups where store_id=s.id and status='pending') as pending
from public.stores s order by s.name;

-- (ج) الدوال التسع
select proname from pg_proc where pronamespace='public'::regnamespace
  and proname in ('auth_store_id','arpha_effective_limit','arpha_count_catalog',
                  'store_my_limits','store_answer_question','store_mark_question_sent',
                  'bot_search_policies','bot_get_context','bot_log_pending_question')
order by proname;
