-- PaperOK AI design (B2C) — run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS ai_design_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('A6', 'A5', 'A4', 'A3')),
  with_frame BOOLEAN NOT NULL DEFAULT FALSE,
  back_option TEXT CHECK (back_option IS NULL OR back_option IN ('planting', 'blank')),
  idea TEXT,
  styles TEXT[] NOT NULL DEFAULT '{}',
  exact_text TEXT,
  attempts_used INT NOT NULL DEFAULT 0 CHECK (attempts_used >= 0 AND attempts_used <= 3),
  selected_variant_id UUID,
  order_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ai_design_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES ai_design_projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  preview_url TEXT,
  print_url TEXT,
  cloudinary_public_id TEXT,
  prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_design_projects_session
  ON ai_design_projects(session_id);

CREATE INDEX IF NOT EXISTS idx_ai_design_projects_order
  ON ai_design_projects(order_id)
  WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_design_variants_project
  ON ai_design_variants(project_id);

CREATE INDEX IF NOT EXISTS idx_ai_design_projects_expires
  ON ai_design_projects(expires_at)
  WHERE expires_at IS NOT NULL;

COMMENT ON TABLE ai_design_projects IS 'B2C AI card/poster design sessions';
COMMENT ON TABLE ai_design_variants IS 'Generated image variants for an AI design project';

-- Optional flag on orders for quick admin filtering
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS has_ai_design BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_orders_has_ai_design
  ON orders(has_ai_design)
  WHERE has_ai_design = TRUE;

COMMENT ON COLUMN orders.has_ai_design IS 'True when order contains at least one AI personal design line';
