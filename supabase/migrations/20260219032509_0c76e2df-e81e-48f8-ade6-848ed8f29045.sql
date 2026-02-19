
-- OTT Platforms table (replaces gift cards)
CREATE TABLE public.ott_platforms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  image text,
  color text DEFAULT 'from-purple-500 to-pink-600',
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- OTT Plans table (like game_packages but for OTT)
CREATE TABLE public.ott_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_id uuid NOT NULL REFERENCES public.ott_platforms(id) ON DELETE CASCADE,
  label text NOT NULL,
  emoji text DEFAULT '📺',
  duration text NOT NULL DEFAULT '1 Month',
  price numeric NOT NULL,
  popular boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Social profiles table for admin panel
CREATE TABLE public.social_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text NOT NULL,
  url text NOT NULL,
  label text DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- XP/rewards table
CREATE TABLE public.user_xp (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  xp_points integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Rewards/redemptions table
CREATE TABLE public.rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  xp_cost integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Support tickets table
CREATE TABLE public.support_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  order_id text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User proof uploads (public community proof)
CREATE TABLE public.order_proofs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  order_tracking_id text NOT NULL,
  proof_url text NOT NULL,
  game_name text DEFAULT '',
  visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS Policies for OTT Platforms
ALTER TABLE public.ott_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active ott platforms" ON public.ott_platforms FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage ott platforms" ON public.ott_platforms FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for OTT Plans
ALTER TABLE public.ott_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read ott plans" ON public.ott_plans FOR SELECT USING (true);
CREATE POLICY "Admins can manage ott plans" ON public.ott_plans FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for social_profiles
ALTER TABLE public.social_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read social profiles" ON public.social_profiles FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage social profiles" ON public.social_profiles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for user_xp
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own xp" ON public.user_xp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own xp" ON public.user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own xp" ON public.user_xp FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all xp" ON public.user_xp FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for rewards
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active rewards" ON public.rewards FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage rewards" ON public.rewards FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage tickets" ON public.support_tickets FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for order_proofs
ALTER TABLE public.order_proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read visible proofs" ON public.order_proofs FOR SELECT USING (visible = true);
CREATE POLICY "Users can upload proof" ON public.order_proofs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage proofs" ON public.order_proofs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add emoji column to game_packages
ALTER TABLE public.game_packages ADD COLUMN IF NOT EXISTS emoji text DEFAULT '💎';
