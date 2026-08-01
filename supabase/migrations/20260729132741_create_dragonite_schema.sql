/*
# DRAGONITE.DEV — Full Schema

1. New Tables
   - `profiles`: User profiles (id mirrors auth.users, role admin/member)
   - `knowledge_base`: Algorithm wiki articles with Markdown content, tags, slug
   - `snippets`: Code snippets with language, tags, public/private toggle
   - `problems`: Problem tracker entries with platform, difficulty, status, links

2. Security
   - RLS enabled on all tables.
   - `profiles`: authenticated users read all, update own; trigger creates profile on signup.
   - `knowledge_base`: anon+auth can read public; authenticated can insert/update/delete own.
   - `snippets`: anon+auth can read public; authenticated can CRUD own; admin can CRUD all.
   - `problems`: anon+auth can read all; authenticated admin can insert/update/delete.

3. Important Notes
   - `problems.solve_full_type` distinguishes internal snippet vs external URL.
   - `problems.kb_article_id` links to knowledge_base for related articles.
   - `profiles.role` defaults to 'member'; set to 'admin' manually.
   - All timestamps default to now().
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- KNOWLEDGE BASE
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kb_select_all" ON knowledge_base;
CREATE POLICY "kb_select_all" ON knowledge_base FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "kb_insert_auth" ON knowledge_base;
CREATE POLICY "kb_insert_auth" ON knowledge_base FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "kb_update_own" ON knowledge_base;
CREATE POLICY "kb_update_own" ON knowledge_base FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (auth.uid() = author_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "kb_delete_own" ON knowledge_base;
CREATE POLICY "kb_delete_own" ON knowledge_base FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- SNIPPETS
-- ============================================================
CREATE TABLE IF NOT EXISTS snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  language text NOT NULL DEFAULT 'cpp',
  code text NOT NULL DEFAULT '',
  notes text,
  sample_input text,
  sample_output text,
  is_public boolean NOT NULL DEFAULT true,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "snippets_select_public" ON snippets;
CREATE POLICY "snippets_select_public" ON snippets FOR SELECT
  TO anon, authenticated
  USING (
    is_public = true
    OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "snippets_insert_auth" ON snippets;
CREATE POLICY "snippets_insert_auth" ON snippets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "snippets_update_own" ON snippets;
CREATE POLICY "snippets_update_own" ON snippets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "snippets_delete_own" ON snippets;
CREATE POLICY "snippets_delete_own" ON snippets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- PROBLEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stt integer,
  title text NOT NULL,
  problem_code text,
  platform text NOT NULL DEFAULT 'VNOI',
  difficulty text NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  tags text[] DEFAULT '{}',
  problem_url text,
  notes text,
  solve_full_type text CHECK (solve_full_type IN ('internal_snippet', 'external_url')),
  solve_full_value text,
  solve_trick text,
  status text NOT NULL DEFAULT 'Todo' CHECK (status IN ('AC', 'TLE', 'WA', 'Todo')),
  kb_article_id uuid REFERENCES knowledge_base(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE problems ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "problems_select_all" ON problems;
CREATE POLICY "problems_select_all" ON problems FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "problems_insert_admin" ON problems;
CREATE POLICY "problems_insert_admin" ON problems FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "problems_update_admin" ON problems;
CREATE POLICY "problems_update_admin" ON problems FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "problems_delete_admin" ON problems;
CREATE POLICY "problems_delete_admin" ON problems FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_problems_platform ON problems(platform);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_snippets_user_id ON snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_snippets_is_public ON snippets(is_public);
CREATE INDEX IF NOT EXISTS idx_kb_slug ON knowledge_base(slug);
CREATE INDEX IF NOT EXISTS idx_kb_author ON knowledge_base(author_id);
