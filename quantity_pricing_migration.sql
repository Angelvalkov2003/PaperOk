-- Quantity pricing for products (variants keep settings inside products.variants JSONB)
-- Run in Supabase SQL editor after previous migrations.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS min_quantity_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_quantity INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS price_tiers_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_tiers JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_min_quantity_check;
ALTER TABLE products
  ADD CONSTRAINT products_min_quantity_check
  CHECK (min_quantity >= 1);

COMMENT ON COLUMN products.min_quantity_enabled IS
  'When true, customers cannot order fewer than min_quantity (product-level; used when no enabled size variants).';
COMMENT ON COLUMN products.min_quantity IS
  'Minimum order quantity when min_quantity_enabled is true. Independent of price tiers.';
COMMENT ON COLUMN products.price_tiers_enabled IS
  'When true, unit price is taken from price_tiers by quantity (product-level).';
COMMENT ON COLUMN products.price_tiers IS
  '[{id, minQty, maxQty|null, price|null}] — null price means quote/inquiry; null maxQty means open-ended.';
