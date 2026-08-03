-- ============================================================================
-- أرفا — الجداول الجديدة، للتنفيذ اليدوي كتلة كتلة
--
-- هذا نفس محتوى migrations_016_to_021.sql، مُعاد ترتيبه إلى كتل مستقلة
-- تلائم النسخ واللصق في Supabase Studio → SQL Editor.
--
-- كل شيء idempotent (if not exists / create or replace)، فتشغيل الملفين معاً
-- أو إعادة تشغيل أي كتلة لا يضر. لكن **لا تشغّل الملف كله دفعة واحدة** —
-- الغرض من التقسيم أن ترى نتيجة كل كتلة قبل التالية.
--
-- الترتيب ملزم: الكتلة ٧ تحتاج ٦، والكتلة ٩ تحتاج ٢.
--
-- ⚠️ لم يُشغَّل شيء من هذا مقابل قاعدتك. ابدأ بالكتلة ٠ ولا تتجاوزها إن فشلت.
-- ============================================================================


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ٠ — تدقيق قبل أي تعديل. لا تكتب شيئاً، اقرأ فقط.                  ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ٠.١ إعداد البحث العربي موجود؟
select cfgname from pg_ts_config where cfgname = 'arabic';
-- ← يجب أن يرجع صفاً واحداً. إن رجع فارغاً: توقّف، الكتلة ٣ ستفشل.

-- ٠.٢ ما الأعمدة الموجودة فعلاً في products و services؟
select table_name, column_name, data_type
from information_schema.columns
where table_schema='public' and table_name in ('products','services')
order by table_name, ordinal_position;
-- ← يهمّني منك: هل يوجد counts_against_limit؟ وهل يوجد is_active؟
--   الكتلة ٧ تتكيّف مع الجواب تلقائياً، لكن احتفظ بالنتيجة — واجهة الكتالوج
--   تفترض أعمدة name / description / price / is_active.

-- ٠.٣ هل في plans عمود حدّ موجود مسبقاً؟ لا نريد عمودين متنافسين.
select column_name, data_type from information_schema.columns
where table_schema='public' and table_name='plans' order by ordinal_position;

-- ٠.٤ كل الجداول التي تحمل store_id — احتفظ بهذه القائمة، تحتاجها في الكتلة ١٠.
select table_name from information_schema.columns
where table_schema='public' and column_name='store_id' order by table_name;

-- ٠.٥ مفتاح جدول العملاء (تستخدمه الكتلة ٤)
select column_name, data_type from information_schema.columns
where table_schema='public' and table_name='customers' order by ordinal_position;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ١ — أعمدة جديدة على stores: المالك والاشتراك                      ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

alter table public.stores add column if not exists owner_name              text;
alter table public.stores add column if not exists owner_phone             text;
alter table public.stores add column if not exists service_status          text not null default 'active';
alter table public.stores add column if not exists subscription_started_at timestamptz;
alter table public.stores add column if not exists subscription_expires_at timestamptz;
alter table public.stores add column if not exists admin_notes             text;

do $$ begin
  alter table public.stores add constraint stores_service_status_chk
    check (service_status in ('active','suspended','expired'));
exception when duplicate_object then null; end $$;

-- تحقّق:
select column_name from information_schema.columns
where table_schema='public' and table_name='stores'
  and column_name in ('owner_name','owner_phone','service_status',
                      'subscription_expires_at','admin_notes');
-- ← يجب أن يرجع ٥ صفوف.


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ٢ — store_users + دالة الهوية auth_store_id()                     ║
-- ║ هذه أهم كتلة: عليها يقوم العزل كله.                                      ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Supabase Auth يتطلب بريداً إلكترونياً. الأدمن يعطي معرّف دخول نصياً،
-- والتطبيق يركّب منه بريداً صناعياً: {login_id}@stores.arpha.local
-- النطاق وهمي عمداً ولا يُرسل إليه بريد أبداً.
create table if not exists public.store_users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid not null unique references auth.users(id) on delete cascade,
  store_id      uuid not null references public.stores(id) on delete cascade,
  login_id      text not null unique,
  full_name     text not null,
  phone         text not null,
  role          text not null default 'owner' check (role in ('owner','staff')),
  is_active     boolean not null default true,
  created_by    text,
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists store_users_store_id_idx  on public.store_users(store_id);
create index if not exists store_users_auth_user_idx on public.store_users(auth_user_id);

create unique index if not exists store_users_one_owner_per_store
  on public.store_users(store_id) where role = 'owner';

-- security definer لأنها تقرأ store_users الذي عليه RLS — بدونها تكرار لا نهائي.
create or replace function public.auth_store_id()
returns uuid language sql stable security definer
set search_path = public, pg_temp
as $$
  select su.store_id
  from public.store_users su
  join public.stores s on s.id = su.store_id
  where su.auth_user_id = auth.uid()
    and su.is_active
    and s.service_status = 'active'
  limit 1;
$$;

-- تحقّق:
select to_regclass('public.store_users') as tbl,
       to_regprocedure('public.auth_store_id()') as fn;
-- ← يجب ألا يكون أيٌّ منهما NULL.


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ٣ — store_policies + فهرس البحث العربي                            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create table if not exists public.store_policies (
  id                 uuid primary key default gen_random_uuid(),
  store_id           uuid not null references public.stores(id) on delete cascade,
  title              text not null,
  body               text not null,
  category           text not null default 'general'
                     check (category in ('general','shipping','returns','payment','hours','pricing','other')),
  source             text not null default 'manual'
                     check (source in ('manual','taught','admin')),
  source_question_id uuid,
  is_active          boolean not null default true,
  disabled_by_admin  boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists store_policies_store_idx
  on public.store_policies(store_id) where is_active;

-- قاعدة المشروع: إضافة عمود قابل للبحث لا تضيفه إلى فهرس FTS تلقائياً.
-- لذلك العمود المولّد والفهرس معرّفان صراحة هنا.
do $$ begin
  alter table public.store_policies
    add column search_vector tsvector
    generated always as (
      to_tsvector('arabic', coalesce(title,'') || ' ' || coalesce(body,''))
    ) stored;
exception when duplicate_column then null; end $$;

create index if not exists store_policies_fts_idx
  on public.store_policies using gin(search_vector);

-- تحقّق — هذا الاختبار يكشف لو بُني الفهرس على simple بالخطأ:
select to_tsvector('arabic','قميص أسود') @@ websearch_to_tsquery('arabic','قميص اسود') as hamza_ok;
-- ← يجب أن يرجع true. إن رجع false فالبحث سيفوّت اختلافات الهمزة.

select indexname from pg_indexes where schemaname='public' and tablename='store_policies';
-- ← يجب أن يظهر store_policies_fts_idx.


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ٤ — pending_questions (الأسئلة المعلقة)                           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create table if not exists public.pending_questions (
  id               uuid primary key default gen_random_uuid(),
  store_id         uuid not null references public.stores(id) on delete cascade,
  customer_id      uuid,
  telegram_chat_id text,
  question_text    text not null,
  bot_reply        text,
  reason           text not null default 'low_confidence'
                   check (reason in ('low_confidence','no_match','customer_reported','manual')),
  status           text not null default 'pending'
                   check (status in ('pending','answered','dismissed')),
  answer_text      text,
  answered_by      uuid references public.store_users(id) on delete set null,
  answered_at      timestamptz,
  policy_id        uuid references public.store_policies(id) on delete set null,
  sent_to_customer boolean not null default false,
  sent_at          timestamptz,
  send_error       text,
  created_at       timestamptz not null default now()
);

create index if not exists pending_questions_store_status_idx
  on public.pending_questions(store_id, status, created_at desc);

-- ربط العميل — يُضاف فقط إن كان customers موجوداً بمفتاح uuid.
-- الكتلة تتخطّى نفسها بصمت إن لم ينطبق الشرط (راجع نتيجة ٠.٥).
do $$
begin
  if to_regclass('public.customers') is not null
     and exists (select 1 from information_schema.columns
                 where table_schema='public' and table_name='customers'
                   and column_name='id' and data_type='uuid')
     and not exists (select 1 from pg_constraint where conname='pending_questions_customer_fk')
  then
    alter table public.pending_questions
      add constraint pending_questions_customer_fk
      foreign key (customer_id) references public.customers(id) on delete set null;
  end if;
end $$;

-- ربط السياسة بالسؤال الذي وُلدت منه (الاتجاه المعاكس)
do $$
begin
  if not exists (select 1 from pg_constraint where conname='store_policies_question_fk') then
    alter table public.store_policies
      add constraint store_policies_question_fk
      foreign key (source_question_id) references public.pending_questions(id) on delete set null;
  end if;
end $$;

-- تحقّق:
select conname from pg_constraint
where conname in ('pending_questions_customer_fk','store_policies_question_fk');


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ٥ — bot_rules (قواعد سلوك البوت)                                  ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create table if not exists public.bot_rules (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references public.stores(id) on delete cascade,
  rule_text  text not null check (length(trim(rule_text)) between 3 and 500),
  priority   int  not null default 100,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bot_rules_store_idx
  on public.bot_rules(store_id, priority) where is_active;

comment on table public.bot_rules is
  'قواعد سلوك عامة تُحقن في system prompt عند كل رد. ليست قواعد تصعيد ولا مطابقة نصية.';


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ٦ — أعمدة الحدود على plans و stores                               ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- حد واحد للكتالوج يجمع المنتجات والخدمات: «١٠٠ منتج» = ١٠٠ عنصر أياً كان نوعه.
alter table public.plans add column if not exists max_catalog_items int not null default 50;
alter table public.plans add column if not exists max_bot_rules     int not null default 10;
alter table public.plans add column if not exists max_policies      int not null default 30;

-- تجاوز اختياري لكل متجر. NULL = استخدم قيمة الباقة.
alter table public.stores add column if not exists max_catalog_items_override int;
alter table public.stores add column if not exists max_bot_rules_override     int;
alter table public.stores add column if not exists max_policies_override      int;

-- اضبط قيم باقاتك الفعلية الآن (عدّل الأسماء والأرقام):
-- update public.plans set max_catalog_items = 50,  max_policies = 20, max_bot_rules = 5   where name = 'basic';
-- update public.plans set max_catalog_items = 200, max_policies = 60, max_bot_rules = 20  where name = 'pro';

-- تحقّق:
select id, name, max_catalog_items, max_policies, max_bot_rules from public.plans order by name;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ٧ — فرض الحدود: دوال و triggers                                   ║
-- ║ بدون هذه الكتلة تبقى الحدود رقماً معروضاً لا قيداً فعلياً.               ║
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

-- مكتوبة ديناميكياً لأن وجود counts_against_limit / is_active لم يُتحقق منه.
-- تتكيّف مع الأعمدة الموجودة فعلاً (راجع نتيجة ٠.٢).
create or replace function public.arpha_count_catalog(p_store_id uuid)
returns int language plpgsql stable security definer
set search_path = public, pg_temp
as $$
declare t text; v_sql text; v_n int; v_total int := 0;
begin
  foreach t in array array['products','services'] loop
    if to_regclass('public.'||t) is null then continue; end if;
    v_sql := format('select count(*) from public.%I where store_id = $1', t);
    if exists (select 1 from information_schema.columns
               where table_schema='public' and table_name=t and column_name='counts_against_limit')
    then v_sql := v_sql || ' and coalesce(counts_against_limit, true)'; end if;
    if exists (select 1 from information_schema.columns
               where table_schema='public' and table_name=t and column_name='is_active')
    then v_sql := v_sql || ' and coalesce(is_active, true)'; end if;
    execute v_sql into v_n using p_store_id;
    v_total := v_total + v_n;
  end loop;
  return v_total;
end $$;

create or replace function public.arpha_enforce_catalog_limit()
returns trigger language plpgsql security definer
set search_path = public, pg_temp
as $$
declare v_limit int; v_used int; v_flag text;
begin
  v_flag := to_jsonb(new) ->> 'counts_against_limit';
  if v_flag is not null and v_flag::boolean = false then
    return new;                          -- عنصر لا يُحتسب ضمن الحد
  end if;

  v_limit := public.arpha_effective_limit(new.store_id, 'catalog');
  v_used  := public.arpha_count_catalog(new.store_id);

  if v_used >= v_limit then
    raise exception 'ARPHA_LIMIT:catalog:%:%', v_used, v_limit
      using hint = 'حد الباقة للكتالوج ممتلئ. عدّل عنصراً موجوداً أو راجع الإدارة.';
  end if;
  return new;
end $$;

do $$ begin
  if to_regclass('public.products') is not null then
    drop trigger if exists trg_products_catalog_limit on public.products;
    create trigger trg_products_catalog_limit before insert on public.products
      for each row execute function public.arpha_enforce_catalog_limit();
  end if;
  if to_regclass('public.services') is not null then
    drop trigger if exists trg_services_catalog_limit on public.services;
    create trigger trg_services_catalog_limit before insert on public.services
      for each row execute function public.arpha_enforce_catalog_limit();
  end if;
end $$;

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
    select count(*) into v_used from public.store_policies where store_id = new.store_id and is_active;
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

drop trigger if exists trg_store_policies_limit on public.store_policies;
create trigger trg_store_policies_limit before insert on public.store_policies
  for each row execute function public.arpha_enforce_row_limit('policies');

-- تحقّق — الحدود تُقرأ صحيحة لكل متجر؟
select s.id, s.name,
       public.arpha_effective_limit(s.id,'catalog') as catalog_limit,
       public.arpha_count_catalog(s.id)             as catalog_used,
       public.arpha_effective_limit(s.id,'policies') as policies_limit,
       public.arpha_effective_limit(s.id,'rules')    as rules_limit
from public.stores s order by s.name;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ٨ — store_change_requests (طلبات صاحب المتجر للإدارة)             ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- صاحب المتجر لا يغيّر معرّفه ولا كلمة مروره بنفسه — يفتح طلباً والأدمن ينفّذه.
create table if not exists public.store_change_requests (
  id           uuid primary key default gen_random_uuid(),
  store_id     uuid not null references public.stores(id) on delete cascade,
  requested_by uuid references public.store_users(id) on delete set null,
  request_type text not null
               check (request_type in ('password_reset','login_id_change','plan_upgrade','other')),
  details      text,
  status       text not null default 'open' check (status in ('open','done','rejected')),
  admin_note   text,
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists store_change_requests_status_idx
  on public.store_change_requests(status, created_at desc);


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ٩ — RLS على الجداول الجديدة                                       ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

alter table public.store_users           enable row level security;
alter table public.store_policies        enable row level security;
alter table public.pending_questions     enable row level security;
alter table public.bot_rules             enable row level security;
alter table public.store_change_requests enable row level security;

-- store_users: بدون auth_store_id() تفادياً للتكرار اللانهائي
drop policy if exists store_users_self_read on public.store_users;
create policy store_users_self_read on public.store_users
  for select to authenticated using (auth_user_id = auth.uid());
-- لا insert/update/delete: إنشاء الحسابات من الأدمن فقط عبر service_role.

-- المتجر نفسه: قراءة فقط. الباقة والحدود وحالة الخدمة يملكها الأدمن وحده.
drop policy if exists stores_own_read on public.stores;
create policy stores_own_read on public.stores
  for select to authenticated using (id = public.auth_store_id());

-- السياسات والقواعد والأسئلة: صلاحية كاملة داخل المتجر
do $$
declare t text;
begin
  foreach t in array array['store_policies','bot_rules','pending_questions'] loop
    execute format('drop policy if exists %I_tenant_all on public.%I', t, t);
    execute format($p$
      create policy %I_tenant_all on public.%I for all to authenticated
        using (store_id = public.auth_store_id())
        with check (store_id = public.auth_store_id())
    $p$, t, t);
  end loop;
end $$;

-- الطلبات: يفتحها ويقرأها ولا يعدّل حالتها
drop policy if exists change_requests_tenant_read on public.store_change_requests;
create policy change_requests_tenant_read on public.store_change_requests
  for select to authenticated using (store_id = public.auth_store_id());

drop policy if exists change_requests_tenant_insert on public.store_change_requests;
create policy change_requests_tenant_insert on public.store_change_requests
  for insert to authenticated with check (store_id = public.auth_store_id());


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ١٠ — RLS على الجداول القائمة                                      ║
-- ║ ⚠️ عدّل القائمتين أدناه بنتيجة الاستعلام ٠.٤ قبل التشغيل.                ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- أي جدول تتركه خارج القائمتين يبقى بلا سياسة، أي غير مرئي تماماً لبوابة
-- المتجر. هذا فشل آمن — لا تسريب، فقط شاشة فارغة.
do $$
declare
  read_write text[] := array['products','services'];                                  -- ← عدّل
  read_only  text[] := array['orders','order_items','customers','conversations','messages']; -- ← عدّل
  t text;
begin
  foreach t in array read_write loop
    if to_regclass('public.'||t) is null then
      raise notice 'تخطّي %: الجدول غير موجود', t; continue;
    end if;
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_tenant_all on public.%I', t, t);
    execute format($p$
      create policy %I_tenant_all on public.%I for all to authenticated
        using (store_id = public.auth_store_id())
        with check (store_id = public.auth_store_id())
    $p$, t, t);
  end loop;

  foreach t in array read_only loop
    if to_regclass('public.'||t) is null then
      raise notice 'تخطّي %: الجدول غير موجود', t; continue;
    end if;
    if not exists (select 1 from information_schema.columns
                   where table_schema='public' and table_name=t and column_name='store_id') then
      raise notice 'تخطّي %: لا يحتوي store_id', t; continue;
    end if;
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_tenant_read on public.%I', t, t);
    execute format($p$
      create policy %I_tenant_read on public.%I for select to authenticated
        using (store_id = public.auth_store_id())
    $p$, t, t);
  end loop;
end $$;

-- ملاحظة على قاعدة المشروع: منع تعديل products.name / services.name يخص الوكلاء
-- الآليين لأن إعادة التسمية هي طريقة الالتفاف على حد الكتالوج. سياسة tenant_all
-- أعلاه تخص الإنسان المصادَق يعدّل كتالوجه هو — وهو الاستثناء المنصوص عليه.
-- البوت في n8n يعمل بـ service_role ويظل ممنوعاً بقيود الأداة في الـ workflow.


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ١١ — RPCs التي يستدعيها التطبيق                                   ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- الحدود والاستهلاك. security definer لأن plans غير مقروء للمستأجر.
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
    'rules_used',     (select count(*) from public.bot_rules      where store_id=v_store and is_active),
    'rules_limit',    public.arpha_effective_limit(v_store,'rules'),
    'policies_used',  (select count(*) from public.store_policies where store_id=v_store and is_active),
    'policies_limit', public.arpha_effective_limit(v_store,'policies'),
    'pending_count',  (select count(*) from public.pending_questions where store_id=v_store and status='pending')
  );
end $$;

grant execute on function public.store_my_limits() to authenticated;

-- التعليم: يحوّل جواب صاحب المتجر إلى سياسة ويغلق السؤال في معاملة واحدة.
-- security invoker: يمرّ عبر RLS، فلا يمكن الإجابة على سؤال متجر آخر.
create or replace function public.store_answer_question(
  p_question_id uuid, p_answer text, p_save_as_policy boolean default true,
  p_title text default null, p_category text default 'general'
) returns json language plpgsql security invoker
set search_path = public, pg_temp
as $$
declare q public.pending_questions%rowtype; v_policy uuid; v_user uuid;
begin
  select * into q from public.pending_questions where id = p_question_id;
  if not found then raise exception 'ARPHA_NOT_FOUND: السؤال غير موجود أو لا يخص متجرك'; end if;
  if q.status <> 'pending' then raise exception 'ARPHA_STATE: هذا السؤال مُجاب أو مُهمل مسبقاً'; end if;
  if length(trim(coalesce(p_answer,''))) < 2 then raise exception 'ARPHA_INPUT: الجواب فارغ'; end if;

  select id into v_user from public.store_users where auth_user_id = auth.uid();

  if p_save_as_policy then
    insert into public.store_policies (store_id, title, body, category, source, source_question_id)
    values (q.store_id,
            coalesce(nullif(trim(p_title),''), left(q.question_text, 80)),
            p_answer, coalesce(p_category,'general'), 'taught', q.id)
    returning id into v_policy;
  end if;

  update public.pending_questions
     set status='answered', answer_text=p_answer, answered_by=v_user,
         answered_at=now(), policy_id=v_policy
   where id = q.id;

  return json_build_object('question_id', q.id, 'policy_id', v_policy,
                           'telegram_chat_id', q.telegram_chat_id, 'answer', p_answer);
end $$;

grant execute on function public.store_answer_question(uuid,text,boolean,text,text) to authenticated;

create or replace function public.store_mark_question_sent(
  p_question_id uuid, p_ok boolean, p_error text default null
) returns void language sql security invoker
set search_path = public, pg_temp
as $$
  update public.pending_questions
     set sent_to_customer = p_ok,
         sent_at = case when p_ok then now() else null end,
         send_error = p_error
   where id = p_question_id;
$$;

grant execute on function public.store_mark_question_sent(uuid,boolean,text) to authenticated;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ١٢ — RPCs التي يستدعيها n8n (بمفتاح service_role)                 ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- بحث السياسات: أداة جديدة للوكيل. FTS عربي، بلا embeddings (قاعدة المشروع).
create or replace function public.bot_search_policies(
  p_store_id uuid, p_query text, p_limit int default 4
) returns table (id uuid, title text, body text, category text, rank real)
language sql stable security definer
set search_path = public, pg_temp
as $$
  select p.id, p.title, p.body, p.category,
         ts_rank(p.search_vector, websearch_to_tsquery('arabic', p_query)) as rank
  from public.store_policies p
  where p.store_id = p_store_id
    and p.is_active and not p.disabled_by_admin
    and p.search_vector @@ websearch_to_tsquery('arabic', p_query)
  order by rank desc
  limit greatest(1, least(p_limit, 10));
$$;

-- سياق البوت: قواعد السلوك + عناوين السياسات، للحقن في system prompt
create or replace function public.bot_get_context(p_store_id uuid)
returns json language sql stable security definer
set search_path = public, pg_temp
as $$
  select json_build_object(
    'rules', coalesce((select json_agg(r.rule_text order by r.priority, r.created_at)
                       from public.bot_rules r
                       where r.store_id = p_store_id and r.is_active), '[]'::json),
    'policy_titles', coalesce((select json_agg(p.title order by p.updated_at desc)
                               from public.store_policies p
                               where p.store_id = p_store_id and p.is_active
                                 and not p.disabled_by_admin), '[]'::json)
  );
$$;

-- تسجيل سؤال معلّق. الكبح داخلي: نفس السؤال من نفس المحادثة خلال ساعة
-- يرجع نفس الـ id بدل صف جديد — لا حاجة لفحص في n8n.
create or replace function public.bot_log_pending_question(
  p_store_id uuid, p_chat_id text, p_question text,
  p_bot_reply text default null, p_reason text default 'low_confidence'
) returns uuid language plpgsql security definer
set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  select id into v_id from public.pending_questions
  where store_id = p_store_id and telegram_chat_id = p_chat_id
    and question_text = p_question and created_at > now() - interval '1 hour'
  limit 1;

  if v_id is not null then return v_id; end if;

  insert into public.pending_questions (store_id, telegram_chat_id, question_text, bot_reply, reason)
  values (p_store_id, p_chat_id, p_question, p_bot_reply, p_reason)
  returning id into v_id;

  return v_id;
end $$;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ الكتلة ١٣ — التدقيق النهائي. شغّلها وأرسل لي النتيجة.                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- أ. الجداول الخمسة موجودة؟ (يجب أن يرجع ٥ صفوف)
select table_name from information_schema.tables
where table_schema='public'
  and table_name in ('store_users','store_policies','pending_questions',
                     'bot_rules','store_change_requests')
order by table_name;

-- ب. استعلام الحقيقة: أي جدول يحمل store_id وبقي بلا سياسة RLS؟
--    كل صف بـ policy_count = 0 هو جدول لن تراه بوابة المتجر إطلاقاً.
select c.table_name,
       (select count(*) from pg_policies p
        where p.schemaname='public' and p.tablename=c.table_name) as policy_count
from information_schema.columns c
where c.table_schema='public' and c.column_name='store_id'
order by policy_count, c.table_name;

-- ج. الدوال الثمانية موجودة؟
select proname from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in ('auth_store_id','arpha_effective_limit','arpha_count_catalog',
                  'store_my_limits','store_answer_question','store_mark_question_sent',
                  'bot_search_policies','bot_get_context','bot_log_pending_question')
order by proname;

-- د. الـ triggers الأربعة مركّبة؟
select tgname, tgrelid::regclass as on_table from pg_trigger
where tgname in ('trg_products_catalog_limit','trg_services_catalog_limit',
                 'trg_bot_rules_limit','trg_store_policies_limit');

-- هـ. الحدود وحالة الخدمة لكل متجر
select s.id, s.name, s.service_status,
       public.arpha_count_catalog(s.id)               as catalog_used,
       public.arpha_effective_limit(s.id,'catalog')   as catalog_limit,
       public.arpha_effective_limit(s.id,'policies')  as policies_limit,
       public.arpha_effective_limit(s.id,'rules')     as rules_limit,
       s.subscription_expires_at
from public.stores s order by s.name;
