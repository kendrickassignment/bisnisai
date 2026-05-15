
-- transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  amount BIGINT NOT NULL,
  category TEXT NOT NULL DEFAULT 'lainnya',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_created ON public.transactions(user_id, created_at DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users select own transactions" ON public.transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own transactions" ON public.transactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own transactions" ON public.transactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Auth upload to own folder product-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Auth delete own product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
