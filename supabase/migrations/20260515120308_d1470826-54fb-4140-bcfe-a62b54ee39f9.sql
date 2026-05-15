CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username citext NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles are viewable by authenticated"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "users update own profile"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname text;
BEGIN
  uname := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = uname::citext) LOOP
    uname := uname || floor(random() * 1000)::text;
  END LOOP;
  INSERT INTO public.profiles (user_id, username) VALUES (NEW.id, uname);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT u.email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE p.username = p_username::citext
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;