-- ============================================================================
-- أرفا — قسم التقارير + رقم الدعم + أعمدة الكلفة
-- شغّل كل كتلة وحدها.
-- ============================================================================

-- ╔══ ١ — تحديث رقم الدعم ════════════════════════════════════════════════════╗
update public.platform_settings
set value = '07709076787', updated_at = now()
where key = 'support_phone';

update public.platform_settings
set value = '07709076787', updated_at = now()
where key = 'support_whatsapp';

select key, value from public.platform_settings order by key;


-- ╔══ ٢ — أعمدة الكلفة (لحساب الربح) ═════════════════════════════════════════╗
-- بدون كلفة لا يوجد ربح، فقط إيراد. المخطط الحالي يحمل السعر فقط.
-- العمود اختياري: يبقى NULL فلا يُحسب ربح لذلك العنصر، ويُعرض الإيراد وحده.
alter table public.products add column if not exists cost_price numeric;
alter table public.services add column if not exists cost_price numeric;
notify pgrst, 'reload schema';


-- ╔══ ٣ — دالة التقارير ══════════════════════════════════════════════════════╗
-- تُحسب في القاعدة لا في المتصفّح: أسرع، وتحترم RLS بـ security invoker.
-- p_days: عدد الأيام للخلف (٧ / ٣٠ / ٩٠).
create or replace function public.store_report(p_days int default 30)
returns json language plpgsql stable security invoker
set search_path = public, pg_temp as $ARPHA$
declare
  v_store uuid := public.auth_store_id();
  v_from  timestamptz := now() - make_interval(days => greatest(1, least(p_days, 365)));
  v_res   json;
begin
  if v_store is null then return null; end if;

  select json_build_object(
    'days', p_days,

    -- الأرقام الرئيسية
    'totals', (
      select json_build_object(
        'orders_all',    count(*),
        'orders_done',   count(*) filter (where o.status = 'delivered'),
        'orders_open',   count(*) filter (where o.status in ('pending_confirmation','confirmed')),
        'orders_lost',   count(*) filter (where o.status in ('rejected','cancelled')),
        'revenue',       coalesce(sum(o.total_amount) filter (where o.status = 'delivered'), 0),
        'revenue_open',  coalesce(sum(o.total_amount) filter (where o.status = 'confirmed'), 0),
        'avg_order',     coalesce(round(avg(o.total_amount) filter (where o.status = 'delivered')), 0)
      )
      from public.orders o
      where o.store_id = v_store and o.created_at >= v_from
    ),

    -- الإيراد يوماً بيوم — يغذّي الرسم البياني
    'daily', coalesce((
      select json_agg(d order by d.day)
      from (
        select date_trunc('day', o.created_at)::date as day,
               count(*) as orders,
               coalesce(sum(o.total_amount) filter (where o.status = 'delivered'), 0) as revenue
        from public.orders o
        where o.store_id = v_store and o.created_at >= v_from
        group by 1
      ) d
    ), '[]'::json),

    -- توزيع الحالات
    'by_status', coalesce((
      select json_agg(s order by s.n desc)
      from (
        select o.status, count(*) as n
        from public.orders o
        where o.store_id = v_store and o.created_at >= v_from
        group by 1
      ) s
    ), '[]'::json),

    -- الأكثر طلباً
    'top_items', coalesce((
      select json_agg(t order by t.qty desc)
      from (
        select coalesce(p.name, sv.name, 'عنصر محذوف') as name,
               oi.item_type,
               sum(oi.quantity)::int as qty,
               coalesce(sum(oi.subtotal), 0) as revenue
        from public.order_items oi
        join public.orders o on o.id = oi.order_id
        left join public.products p on p.id = oi.item_id and oi.item_type = 'product'
        left join public.services sv on sv.id = oi.item_id and oi.item_type = 'service'
        where o.store_id = v_store and o.created_at >= v_from
        group by 1, 2
        order by qty desc
        limit 8
      ) t
    ), '[]'::json),

    -- نشاط البوت
    'bot', (
      select json_build_object(
        'questions_new',      (select count(*) from public.pending_followups
                               where store_id = v_store and created_at >= v_from),
        'questions_answered', (select count(*) from public.pending_followups
                               where store_id = v_store and status = 'resolved' and resolved_at >= v_from),
        'questions_open',     (select count(*) from public.pending_followups
                               where store_id = v_store and status = 'pending'),
        'policies_learned',   (select count(*) from public.policies
                               where store_id = v_store and source = 'auto_learned')
      )
    )
  ) into v_res;

  return v_res;
end $ARPHA$;

grant execute on function public.store_report(int) to authenticated;


-- ╔══ ٤ — تحقّق ══════════════════════════════════════════════════════════════╗
-- ⚠️ يرجع null هنا لأن auth.uid() فارغ في SQL Editor — هذا سليم.
-- الاختبار الحقيقي من داخل البوابة. لكن هذا يكشف أي خطأ في أسماء الأعمدة:
select public.store_report(30);

-- إن ظهر خطأ عن عمود غير موجود، أرسله لي — أسماء أعمدة orders و order_items
-- مأخوذة من وثائق المشروع ولم تُتحقّق كلها بالفحص المباشر.
