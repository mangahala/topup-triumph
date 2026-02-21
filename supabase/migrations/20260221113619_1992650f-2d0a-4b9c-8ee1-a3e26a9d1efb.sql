
-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Add whatsapp_number column to orders for OTT WhatsApp delivery
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for profile-photos bucket
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile photo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile photo"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add avatar_url to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create a function to auto-delete rejected orders after 1 hour (keeps tracking_id logic)
CREATE OR REPLACE FUNCTION public.cleanup_rejected_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.orders
  WHERE status = 'rejected'
    AND updated_at IS NOT NULL
    AND updated_at < now() - interval '1 hour';
END;
$$;

-- Add updated_at column to orders if not exists
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create trigger to update updated_at on orders update
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_orders_updated_at();
