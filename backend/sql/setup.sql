CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.workplaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    suburb text NOT NULL,
    industry text NOT NULL,
    created_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS workplaces_name_suburb_unique
    ON public.workplaces (lower(name), lower(suburb));

CREATE INDEX IF NOT EXISTS workplaces_industry_index
    ON public.workplaces (industry);

CREATE INDEX IF NOT EXISTS workplaces_suburb_index
    ON public.workplaces (suburb);

CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workplace_id uuid NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
    user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    hourly_pay numeric(6, 2) NOT NULL CHECK (hourly_pay > 0),
    hours_worked numeric(5, 2) NOT NULL CHECK (hours_worked > 0),
    payslip_provided boolean NOT NULL,
    is_anonymous boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_workplace_id_index
    ON public.reviews (workplace_id);

CREATE INDEX IF NOT EXISTS reviews_user_id_index
    ON public.reviews (user_id);

ALTER TABLE public.workplaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- These are fictional demo businesses for local development and testing.
INSERT INTO public.workplaces (id, name, suburb, industry)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Bean & Brew Café', 'Carlton', 'Hospitality'),
    ('22222222-2222-2222-2222-222222222222', 'Golden Dragon Restaurant', 'Melbourne CBD', 'Hospitality'),
    ('33333333-3333-3333-3333-333333333333', 'QuickMart Convenience', 'Footscray', 'Retail'),
    ('44444444-4444-4444-4444-444444444444', 'SparkleClean Services', 'Box Hill', 'Cleaning')
ON CONFLICT DO NOTHING;

INSERT INTO public.reviews (
    id,
    workplace_id,
    user_id,
    hourly_pay,
    hours_worked,
    payslip_provided,
    is_anonymous
)
VALUES
    ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NULL, 36.50, 20.00, true, false),
    ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NULL, 38.00, 15.00, true, true),
    ('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NULL, 40.00, 25.00, true, false),
    ('b1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NULL, 18.50, 18.00, false, true),
    ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', NULL, 22.00, 22.00, false, false),
    ('b3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', NULL, 20.00, 16.00, true, true),
    ('c1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 30.00, 24.00, true, false),
    ('c2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', NULL, 32.50, 19.00, true, true),
    ('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', NULL, 31.00, 21.00, true, false)
ON CONFLICT DO NOTHING;