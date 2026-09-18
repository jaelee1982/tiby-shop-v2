-- tiby-shop (Supabase ref bkcmekmpgbetuicnjawy) — 주문에 配送先·送料·お支払い方法 저장 (2026-09-18, /checkout 신설).
-- 적용은 Supabase MCP/SQL Editor(이 레포엔 자동 적용 파이프라인 없음). 멱등. 미적용이어도 /api/checkout 은 raw 에 배송지를 남기고 동작(fail-soft).
alter table public.orders add column if not exists shipping jsonb;            -- {name, postal, prefecture, city, building, phone, email}
alter table public.orders add column if not exists shipping_jpy integer not null default 0;
alter table public.orders add column if not exists payment_method text;      -- 'card' | 'convenience' (Eximbay 창에서 최종 선택)
comment on column public.orders.shipping is '配送先 (lib/shipping.ts ShippingAddress) — 消費者 PII, service_role only';
