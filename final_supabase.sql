-- =============================================================================
-- PaperOK — final_supabase.sql
-- =============================================================================
-- Пълна схема за НОВА база (или пълен reset).
-- Пусни веднъж в: Supabase Dashboard → SQL Editor → New query
--
-- След това (по избор): seed_data.sql
--
-- ⚠️  WARNING: DROPS all existing data in these tables!
-- =============================================================================

DROP TABLE IF EXISTS contact_inquiries CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS collections CASCADE;

DROP FUNCTION IF EXISTS validate_products_json(JSONB) CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. COLLECTIONS
-- =============================================================================
CREATE TABLE collections (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handle      TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    description TEXT,
    position    INTEGER NOT NULL DEFAULT 0,
    parent_id   UUID REFERENCES collections(id) ON DELETE SET NULL,
    available   BOOLEAN NOT NULL DEFAULT false,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collections_handle    ON collections(handle);
CREATE INDEX idx_collections_position  ON collections(position);
CREATE INDEX idx_collections_parent_id ON collections(parent_id);
CREATE INDEX idx_collections_available ON collections(available);

COMMENT ON TABLE  collections            IS 'Product categories. Tree via parent_id. NULL parent = root.';
COMMENT ON COLUMN collections.parent_id  IS 'Parent category. NULL = root category.';
COMMENT ON COLUMN collections.available  IS 'When false, category is hidden from storefront nav, sidebar, search, and direct links.';

-- =============================================================================
-- 2. PRODUCTS
-- =============================================================================
CREATE TABLE products (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handle           TEXT UNIQUE NOT NULL,
    title            TEXT NOT NULL,
    description      TEXT,
    price            NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(10, 2),
    featured_image   JSONB,
    images           JSONB[] NOT NULL DEFAULT '{}',
    variants         JSONB NOT NULL DEFAULT '[]',
    category         TEXT,
    available        BOOLEAN NOT NULL DEFAULT false,
    plantable        BOOLEAN NOT NULL DEFAULT true,
    position         INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_handle    ON products(handle);
CREATE INDEX idx_products_category  ON products(category);
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_products_position  ON products(position);

COMMENT ON TABLE  products           IS 'Store products. Images in images[] JSONB. Sizes in variants JSONB.';
COMMENT ON COLUMN products.category  IS 'Collection handle this product belongs to.';
COMMENT ON COLUMN products.variants  IS 'Size variants: [{id, name, price, description, enabled}]. Empty = use base price.';
COMMENT ON COLUMN products.plantable IS 'When true, show planting tab and plantable badge on the product page.';
COMMENT ON COLUMN products.images    IS 'Gallery images as JSONB array. Order = display order.';

-- =============================================================================
-- 3. PRODUCT_IMAGES (optional legacy)
-- =============================================================================
CREATE TABLE product_images (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url  TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_product_sort_order UNIQUE (product_id, sort_order)
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_sort_order ON product_images(product_id, sort_order);

COMMENT ON TABLE  product_images            IS 'Optional separate image table. App primarily uses products.images JSONB.';
COMMENT ON COLUMN product_images.sort_order IS '0 = main image, 1+ = secondary images.';

-- =============================================================================
-- 4. ORDERS
-- =============================================================================
CREATE TABLE orders (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name     VARCHAR(255) NOT NULL,
    customer_email    VARCHAR(255) NOT NULL,
    customer_phone    VARCHAR(50),
    customer_address  TEXT NOT NULL,
    products          JSONB NOT NULL,
    total_price       NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    products_subtotal NUMERIC(10, 2),
    payment_method    VARCHAR(20) NOT NULL DEFAULT 'cash_on_delivery'
                          CHECK (payment_method IN ('cash_on_delivery', 'card', 'bank_transfer')),
    payment_status    VARCHAR(30) NOT NULL DEFAULT 'cash_on_delivery'
                          CHECK (payment_status IN (
                              'cash_on_delivery', 'awaiting_payment', 'paid', 'failed'
                          )),
    status            VARCHAR(20) NOT NULL DEFAULT 'new'
                          CHECK (status IN (
                              'new', 'processing', 'shipped', 'delivered', 'canceled'
                          )),
    comment           TEXT,
    shipping_method      TEXT CHECK (
        shipping_method IS NULL OR shipping_method IN ('office', 'apt', 'address')
    ),
    shipping_price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    shipping_site_id     BIGINT,
    shipping_site_name   TEXT,
    shipping_office_id   INTEGER,
    shipping_office_name TEXT,
    shipping_deadline    TEXT,
    shipping_details     JSONB,
    stripe_session_id TEXT,
    idempotency_key   TEXT,
    email_sent_at     TIMESTAMPTZ,
    speedy_shipment_id   TEXT,
    speedy_parcel_id     TEXT,
    speedy_created_at    TIMESTAMPTZ,
    speedy_last_synced_at TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX        idx_orders_status         ON orders(status);
CREATE INDEX        idx_orders_payment_status ON orders(payment_status);
CREATE INDEX        idx_orders_created_at     ON orders(created_at DESC);
CREATE INDEX        idx_orders_updated_at     ON orders(updated_at DESC);
CREATE INDEX        idx_orders_customer_email ON orders(customer_email);
CREATE INDEX        idx_orders_speedy_parcel ON orders(speedy_parcel_id)
    WHERE speedy_parcel_id IS NOT NULL;
CREATE UNIQUE INDEX idx_orders_stripe_session_id
    ON orders(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE UNIQUE INDEX idx_orders_idempotency_key
    ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;

COMMENT ON TABLE  orders                   IS 'Customer orders. Cart lives in browser localStorage.';
COMMENT ON COLUMN orders.products          IS 'Snapshot: [{id, name, price, quantity, variant_name?}]';
COMMENT ON COLUMN orders.stripe_session_id IS 'Stripe Checkout Session ID — one per payment.';
COMMENT ON COLUMN orders.idempotency_key   IS 'Client UUID — prevents duplicate orders on double-submit.';
COMMENT ON COLUMN orders.email_sent_at     IS 'When admin notification was sent — prevents duplicate emails.';
COMMENT ON COLUMN orders.status            IS 'new | processing | shipped | delivered | canceled';
COMMENT ON COLUMN orders.payment_status    IS 'cash_on_delivery | awaiting_payment | paid | failed';
COMMENT ON COLUMN orders.shipping_method   IS 'office | apt | address (Speedy)';
COMMENT ON COLUMN orders.shipping_price    IS 'Shipping cost from Speedy calculate (EUR, incl. VAT)';
COMMENT ON COLUMN orders.products_subtotal IS 'Products total before shipping';
COMMENT ON COLUMN orders.shipping_details  IS 'Extra Speedy/address payload for admin';
COMMENT ON COLUMN orders.speedy_shipment_id   IS 'Speedy shipment id from /shipment/';
COMMENT ON COLUMN orders.speedy_parcel_id     IS 'Primary parcel id — waybill number for print/track';
COMMENT ON COLUMN orders.speedy_created_at   IS 'When the Speedy waybill was created from admin';
COMMENT ON COLUMN orders.speedy_last_synced_at IS 'Last Speedy track sync (cron)';

-- =============================================================================
-- 5. BLOG POSTS
-- =============================================================================
CREATE TABLE blog_posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            TEXT UNIQUE NOT NULL,
    title           TEXT NOT NULL,
    excerpt         TEXT,
    content         TEXT NOT NULL DEFAULT '',
    featured_image  JSONB,
    images          JSONB[] NOT NULL DEFAULT '{}',
    seo_title       TEXT,
    seo_description TEXT,
    published       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug       ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published  ON blog_posts(published);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);

COMMENT ON TABLE blog_posts IS 'Blog articles managed from /admin/blog.';

-- =============================================================================
-- 6. CONTACT INQUIRIES
-- =============================================================================
CREATE TABLE contact_inquiries (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    phone      TEXT,
    subject    TEXT,
    message    TEXT NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new', 'read', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_inquiries_status     ON contact_inquiries(status);
CREATE INDEX idx_contact_inquiries_created_at ON contact_inquiries(created_at DESC);

COMMENT ON TABLE  contact_inquiries        IS 'Messages from the public /contact form. Managed in /admin/inquiries.';
COMMENT ON COLUMN contact_inquiries.status IS 'new | read | archived';

-- =============================================================================
-- 7. VALIDATION — orders.products JSON
-- =============================================================================
CREATE OR REPLACE FUNCTION validate_products_json(products_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    IF jsonb_typeof(products_data) != 'array' THEN
        RETURN FALSE;
    END IF;

    RETURN (
        SELECT bool_and(
            elem ? 'id' AND
            elem ? 'name' AND
            elem ? 'price' AND
            elem ? 'quantity' AND
            (elem->>'quantity')::INTEGER > 0
        )
        FROM jsonb_array_elements(products_data) AS elem
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

ALTER TABLE orders
    ADD CONSTRAINT check_products_json
    CHECK (validate_products_json(products));

-- =============================================================================
-- 8. ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_collections" ON collections
  FOR SELECT USING (available = true);

CREATE POLICY "public_read_products" ON products
  FOR SELECT USING (available = true);

CREATE POLICY "public_read_blog" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "public_insert_orders" ON orders
  FOR INSERT WITH CHECK (true);

-- contact_inquiries: no public policies — service role only (API + admin)

-- =============================================================================
-- Done.
--   collections / products / product_images / orders / blog_posts / contact_inquiries
-- =============================================================================
