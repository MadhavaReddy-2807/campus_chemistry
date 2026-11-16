-- Grant permissions to authenticated, anon, and service_role
GRANT ALL ON TABLE profiles TO authenticated;
GRANT ALL ON TABLE profiles TO anon;
GRANT ALL ON TABLE profiles TO service_role;

-- Allow authenticated users to read student profiles
DROP POLICY IF EXISTS "users can read visible profiles" ON profiles;
DROP POLICY IF EXISTS "users can read profiles" ON profiles;

CREATE POLICY "users can read profiles" ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- Ensure authenticated users can update their own profile
DROP POLICY IF EXISTS "users can update their own profile" ON profiles;

CREATE POLICY "users can update their own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
