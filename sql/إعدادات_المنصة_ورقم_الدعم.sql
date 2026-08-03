-- ============================================================================
-- أرفا — إعدادات المنصّة (رقم الدعم وقنوات التواصل)
-- شغّل كل كتلة وحدها.
-- ============================================================================

-- ╔══ ١ — الجدول ═════════════════════════════════════════════════════════════╗
-- إعدادات على مستوى المنصّة كلها، لا لكل متجر. لهذا لا يوجد فيه store_id:
-- رقم دعم أرفا واحد لجميع المتاجر.
create table if not exists public.platform_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

insert into public.platform_settings (key, value) values
  ('support_phone',    '0772320627'),
  ('support_whatsapp', ''),
  ('support_telegram', ''),
  ('support_hours',    'يوميّاً ٩ صباحاً — ٩ مساءً')
on conflict (key) do nothing;

-- تحقّق:
select key, value from public.platform_settings order by key;


-- ╔══ ٢ — RLS ════════════════════════════════════════════════════════════════╗
-- القراءة مسموحة لكل مستخدم مصادَق: رقم الدعم ليس سرّاً، وكل صاحب متجر
-- يحتاجه. الكتابة للأدمن وحده عبر service_role (لا سياسة insert/update).
alter table public.platform_settings enable row level security;

drop policy if exists platform_settings_read on public.platform_settings;
create policy platform_settings_read on public.platform_settings
  for select to authenticated using (true);

notify pgrst, 'reload schema';

-- تحقّق:
select policyname, cmd from pg_policies
where schemaname='public' and tablename='platform_settings';


-- ╔══ ٣ — تحقّق من رقم الهاتف ════════════════════════════════════════════════╗
-- ⚠️ الرقم 0772320627 عشر خانات. أرقام الموبايل العراقية إحدى عشرة خانة
--    (07XX XXX XXXX). راجعه — إن كان ناقصاً خانة فرابط واتساب لن يعمل.
--    لتصحيحه:
-- update public.platform_settings set value = '07723206270', updated_at = now()
--   where key = 'support_phone';
