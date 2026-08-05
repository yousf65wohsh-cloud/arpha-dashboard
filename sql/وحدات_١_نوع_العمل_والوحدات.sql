-- ============================================================================
-- أرفا — الملف ١ من ٧: نوع العمل والوحدات
--
-- الفكرة: لا نبني لوحة للمطاعم وأخرى للعيادات وثالثة للمتاجر. نبني وحدات
-- مستقلة، ونوع العمل مجرّد مجموعة وحدات مُفعَّلة مسبقاً يقدر الأدمن يعدّلها.
-- إصلاح واحد يسري على الجميع، ونوع عمل جديد = صفّ في قائمة، لا لوحة رابعة.
--
-- هذا الملف آمن تماماً: يضيف عموداً وجدولاً، ولا يغيّر سلوك البوابة إطلاقاً
-- حتى الملف ٣ (التنقّل الديناميكي).
--
-- شغّل كل كتلة وحدها.
-- ============================================================================


-- ╔══ ١ — نوع العمل على المتجر ═══════════════════════════════════════════════╗

alter table public.stores add column if not exists business_type text not null default 'custom';

do $ARPHA$ begin
  alter table public.stores drop constraint if exists stores_business_type_chk;
  alter table public.stores add constraint stores_business_type_chk
    check (business_type in ('restaurant','clinic','online_store','custom'));
end $ARPHA$;

comment on column public.stores.business_type is
  'يحدّد الوحدات الافتراضية والتسميات. الأدمن يقدر يعدّل الوحدات بعدها بحرية.';

-- تحقّق:
select id, name, business_type from public.stores order by name;


-- ╔══ ٢ — الوحدات المفعَّلة لكل متجر ══════════════════════════════════════════╗

-- صفّ لكل وحدة لكل متجر. غياب الصفّ = الوحدة معطّلة.
-- الوحدات الأساسية (نظرة عامة، أسئلة، سياسات، قواعد، تقارير، حساب) لا تُخزَّن
-- هنا إطلاقاً — تعمل دائماً لكل متجر، فلا معنى لإمكانية إطفائها.
create table if not exists public.store_modules (
  store_id   uuid not null references public.stores(id) on delete cascade,
  module_key text not null,
  enabled    boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  primary key (store_id, module_key)
);

do $ARPHA$ begin
  alter table public.store_modules drop constraint if exists store_modules_key_chk;
  alter table public.store_modules add constraint store_modules_key_chk
    check (module_key in ('catalog','orders','bookings','reviews','finance'));
end $ARPHA$;

create index if not exists store_modules_store_idx
  on public.store_modules(store_id) where enabled;

comment on table public.store_modules is
  'الوحدات الاختيارية. الأساسية غير مذكورة هنا لأنها تعمل دائماً.';


-- ╔══ ٣ — الوحدات الافتراضية حسب نوع العمل ═══════════════════════════════════╗

-- تُستدعى عند إنشاء متجر جديد، وعند تغيير نوع عمله من لوحة الأدمن.
-- p_reset = false: تضيف الناقص ولا تلمس ما عدّله الأدمن يدوياً — وهذا المهم،
-- فتغيير نوع العمل لا يجوز أن يمحو قراراً واعياً اتخذه الأدمن.
create or replace function public.apply_business_type_modules(
  p_store_id uuid,
  p_reset    boolean default false
) returns void
language plpgsql security definer
set search_path = public, pg_temp as $ARPHA$
declare
  v_type text;
  v_mods text[];
begin
  select business_type into v_type from public.stores where id = p_store_id;
  if v_type is null then return; end if;

  v_mods := case v_type
    when 'restaurant'   then array['catalog','orders','bookings','reviews']
    when 'clinic'       then array['catalog','bookings','reviews']
    when 'online_store' then array['catalog','orders','reviews']
    else                     array['catalog','orders']
  end;

  if p_reset then
    delete from public.store_modules where store_id = p_store_id;
  end if;

  insert into public.store_modules (store_id, module_key, enabled, sort_order)
  select p_store_id, m.key, true, m.ord
  from unnest(v_mods) with ordinality as m(key, ord)
  on conflict (store_id, module_key) do nothing;
end $ARPHA$;

-- ملاحظة على العيادات: بلا وحدة orders عمداً. العيادة تحجز مواعيد ولا تستقبل
-- طلبات بمجاميع مالية. إن احتاج مجمّع طبي بيع أدوية، يفعّل الأدمن orders يدوياً
-- — وهذه بالضبط قيمة فصل الوحدات عن النوع.


-- ╔══ ٤ — تطبيقها على المتاجر القائمة ════════════════════════════════════════╗

-- كل المتاجر الحالية custom، فتأخذ catalog + orders — وهو سلوك اليوم بالضبط.
-- أي لا يتغيّر شيء لصاحب المتجر.
do $ARPHA$
declare r record;
begin
  for r in select id from public.stores loop
    perform public.apply_business_type_modules(r.id, false);
  end loop;
end $ARPHA$;

-- تحقّق:
select s.name, s.business_type,
       string_agg(m.module_key, ' · ' order by m.sort_order) as modules
from public.stores s
left join public.store_modules m on m.store_id = s.id and m.enabled
group by s.id, s.name, s.business_type
order by s.name;


-- ╔══ ٥ — RLS ════════════════════════════════════════════════════════════════╗

-- القراءة فقط لصاحب المتجر: الوحدات تحدّد ما يراه، والتحكّم بها للأدمن وحده
-- عبر service_role. لو ملكها صاحب المتجر لفعّل وحدة خارج باقته.
alter table public.store_modules enable row level security;

drop policy if exists store_modules_tenant_read on public.store_modules;
create policy store_modules_tenant_read on public.store_modules
  for select to authenticated using (store_id = public.auth_store_id());

notify pgrst, 'reload schema';

-- تحقّق:
select policyname, cmd from pg_policies
where schemaname='public' and tablename='store_modules';


-- ╔══ ٦ — الباقتان كما في المخطط ═════════════════════════════════════════════╗

-- ⚠️ اقرأ هذا قبل التشغيل: الاستعلام التالي يريك باقاتك الحالية.
--    شغّله وحده أولاً، وأرسل لي النتيجة إن كانت الأسماء مختلفة عمّا أفترضه.
select id, name, max_conversations, max_catalog_items, max_policies, max_bot_rules
from public.plans order by name;

-- ثم عدّل الأسماء في الجملتين أدناه لتطابق باقاتك الفعلية، وشغّلهما:

-- باقة الناشئ — ٢٠ دولاراً
update public.plans set
  max_conversations = 100,
  max_catalog_items = 100,
  max_policies      = 30,
  max_bot_rules     = 10
where name ilike '%ناشئ%' or name ilike '%starter%' or name ilike '%basic%';

-- باقة الأعمال — ٧٠ دولاراً
update public.plans set
  max_conversations = 500,
  max_catalog_items = 300,
  max_policies      = 80,
  max_bot_rules     = 25
where name ilike '%أعمال%' or name ilike '%business%' or name ilike '%pro%';

-- تحقّق:
select name, max_conversations, max_catalog_items, max_policies, max_bot_rules
from public.plans order by max_catalog_items;

-- ملاحظة: سعر الباقة نفسه ($20 / $70) ليس في المخطّط — الأعمدة الموجودة
-- سقوف استهلاك لا أسعار بيع. إن أردت تخزين السعر أضف عموداً لاحقاً؛ الفوترة
-- خارج نطاق هذا التحديث.


-- ============================================================================
-- افتراضات موثّقة في هذا الملف — راجعها
-- ============================================================================
-- ١. أربعة أنواع عمل: مطعم، عيادة، متجر أونلاين، مخصّص.
-- ٢. العيادة بلا وحدة orders افتراضياً — الأدمن يقدر يفعّلها يدوياً.
-- ٣. تغيير نوع العمل لا يمحو وحدات فعّلها الأدمن يدوياً (إلا بـ p_reset).
-- ٤. الوحدات الأساسية غير قابلة للإطفاء بالتصميم.
-- ٥. حدود السياسات والقواعد للباقتين (30/80 و 10/25) اجتهاد مني — غيّرها كما ترى.
--
-- الملف التالي (٢): قاموس التسميات — «المنيو» للمطعم، «الخدمات» للعيادة،
-- «المنتجات» للمتجر — كلها فوق نفس جدول products.
