BEGIN;

CREATE TABLE IF NOT EXISTS public.menu_item_sizes (
  menu_item_size_id SERIAL PRIMARY KEY,
  menu_item_id INTEGER NOT NULL REFERENCES public.menuitems(menu_item_id) ON DELETE CASCADE,
  size_name VARCHAR(20) NOT NULL CHECK (size_name IN ('small', 'medium', 'large')),
  price NUMERIC(10, 2) NOT NULL,
  UNIQUE (menu_item_id, size_name)
);

ALTER TABLE public.orderitems
ADD COLUMN IF NOT EXISTS size_name VARCHAR(20);

INSERT INTO public.menu_item_sizes (menu_item_id, size_name, price)
SELECT
  mi.menu_item_id,
  size_data.size_name,
  size_data.price
FROM public.menuitems mi
CROSS JOIN LATERAL (
  VALUES
    ('small', GREATEST(mi.base_price - 0.50, 0.50)),
    ('medium', mi.base_price),
    ('large', mi.base_price + 0.50)
) AS size_data(size_name, price)
WHERE LOWER(COALESCE(mi.category, '')) <> 'topping'
ON CONFLICT (menu_item_id, size_name) DO NOTHING;

COMMIT;
