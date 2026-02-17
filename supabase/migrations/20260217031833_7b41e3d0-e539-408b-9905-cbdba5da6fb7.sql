
-- Roles enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  whatsapp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL DEFAULT 'Diamonds',
  image TEXT,
  color TEXT DEFAULT 'from-orange-500 to-red-600',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Game packages
CREATE TABLE public.game_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  amount INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  label TEXT NOT NULL,
  popular BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.game_packages ENABLE ROW LEVEL SECURITY;

-- Payment methods
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon_url TEXT,
  qr_image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Promo codes
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('discount', 'bonus')),
  value NUMERIC(10,2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  game_id UUID REFERENCES public.games(id),
  package_id UUID REFERENCES public.game_packages(id),
  player_id TEXT NOT NULL,
  player_name TEXT,
  promo_code_id UUID REFERENCES public.promo_codes(id),
  payment_method_id UUID REFERENCES public.payment_methods(id),
  screenshot_url TEXT,
  transaction_id TEXT,
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  order_type TEXT NOT NULL DEFAULT 'topup' CHECK (order_type IN ('topup', 'steam', 'giftcard')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Steam accounts
CREATE TABLE public.steam_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  details TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.steam_accounts ENABLE ROW LEVEL SECURITY;

-- Gift card orders (extends orders with extra fields)
CREATE TABLE public.gift_card_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_whatsapp TEXT NOT NULL,
  personal_message TEXT,
  card_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gift_card_orders ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- user_roles: users can read their own roles, admins can read all
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- games: public read, admin write
CREATE POLICY "Anyone can read active games" ON public.games FOR SELECT USING (active = true);
CREATE POLICY "Admins can read all games" ON public.games FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage games" ON public.games FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- game_packages: public read, admin write
CREATE POLICY "Anyone can read packages" ON public.game_packages FOR SELECT USING (true);
CREATE POLICY "Admins can manage packages" ON public.game_packages FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- payment_methods: public read, admin write
CREATE POLICY "Anyone can read active payment methods" ON public.payment_methods FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage payment methods" ON public.payment_methods FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- promo_codes: public can validate, admin manage
CREATE POLICY "Anyone can read active promos" ON public.promo_codes FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage promos" ON public.promo_codes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- orders: users see own, admins see all
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- steam_accounts: public read available, admin manage
CREATE POLICY "Anyone can read available steam accounts" ON public.steam_accounts FOR SELECT USING (status = 'available');
CREATE POLICY "Admins can manage steam accounts" ON public.steam_accounts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- gift_card_orders: user read own via order, admin all
CREATE POLICY "Users can read own gift card orders" ON public.gift_card_orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = gift_card_orders.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can create gift card orders" ON public.gift_card_orders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = gift_card_orders.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can manage gift card orders" ON public.gift_card_orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Generate tracking ID function
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'GT-';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;
