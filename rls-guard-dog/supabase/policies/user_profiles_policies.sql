-- =============================================
-- RLS POLICIES FOR USER_PROFILES TABLE
-- Copy and paste these into your Supabase SQL editor
-- =============================================

-- Policy 1: Users can view their own profile and profiles in their school
CREATE POLICY "Users can view relevant profiles"
ON "public"."user_profiles"
AS PERMISSIVE
FOR SELECT
TO public
USING (
  auth.uid() = id OR 
  school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
);

-- Policy 2: Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON "public"."user_profiles"
AS PERMISSIVE
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Head teachers can create new users in their school
CREATE POLICY "Head teachers can create school users"
ON "public"."user_profiles"
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles existing_users
    WHERE existing_users.id = auth.uid() 
    AND existing_users.role = 'head_teacher'
  )
);