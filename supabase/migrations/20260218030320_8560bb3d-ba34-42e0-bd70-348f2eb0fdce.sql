-- Create hero_banners table for admin-managed slider images
CREATE TABLE public.hero_banners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Anyone can read active banners
CREATE POLICY "Anyone can read active banners"
  ON public.hero_banners FOR SELECT
  USING (active = true);

-- Admins can manage all banners
CREATE POLICY "Admins can manage banners"
  ON public.hero_banners FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));