-- Fix 1: Remove the order_type check constraint to allow 'ott' order type
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_order_type_check;

-- Fix 2: Set orders.package_id foreign key to SET NULL on delete (so game packages can be deleted)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_package_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_package_id_fkey 
  FOREIGN KEY (package_id) REFERENCES public.game_packages(id) ON DELETE SET NULL;