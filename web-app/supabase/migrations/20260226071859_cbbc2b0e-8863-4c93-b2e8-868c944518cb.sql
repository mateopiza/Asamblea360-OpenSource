
-- Add onboarding_completed to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Add copropiedad_id to user_roles for per-copropiedad admin assignment
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS copropiedad_id uuid REFERENCES public.copropiedades(id) ON DELETE SET NULL;
