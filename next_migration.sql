ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30);

UPDATE orders
SET payment_status = CASE
  WHEN payment_method IN ('cash_on_delivery', 'bank_transfer') THEN 'cash_on_delivery'
  WHEN status = 'paid' THEN 'paid'
  WHEN status = 'pending_payment' THEN 'awaiting_payment'
  WHEN payment_method = 'card' THEN COALESCE(payment_status, 'awaiting_payment')
  ELSE COALESCE(payment_status, 'awaiting_payment')
END
WHERE payment_status IS NULL;

UPDATE orders
SET status = CASE
  WHEN status = 'pending_payment' THEN 'new'
  WHEN status = 'confirmed' THEN 'processing'
  WHEN status = 'paid' THEN 'processing'
  WHEN status = 'completed' THEN 'delivered'
  WHEN status = 'canceled' THEN 'canceled'
  ELSE status
END;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('new', 'processing', 'shipped', 'delivered', 'canceled'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('cash_on_delivery', 'awaiting_payment', 'paid', 'failed'));

ALTER TABLE orders ALTER COLUMN payment_status SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

COMMENT ON COLUMN orders.status IS 'new | processing | shipped | delivered | canceled';
COMMENT ON COLUMN orders.payment_status IS 'cash_on_delivery | awaiting_payment | paid | failed';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS speedy_shipment_id     TEXT,
  ADD COLUMN IF NOT EXISTS speedy_parcel_id       TEXT,
  ADD COLUMN IF NOT EXISTS speedy_created_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS speedy_last_synced_at  TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_speedy_parcel
  ON orders(speedy_parcel_id)
  WHERE speedy_parcel_id IS NOT NULL;

COMMENT ON COLUMN orders.speedy_shipment_id    IS 'Speedy shipment id returned by /shipment/';
COMMENT ON COLUMN orders.speedy_parcel_id      IS 'Primary parcel id — waybill number for print/track';
COMMENT ON COLUMN orders.speedy_created_at     IS 'When the Speedy waybill was created from admin';
COMMENT ON COLUMN orders.speedy_last_synced_at IS 'Last Speedy track sync (cron)';
