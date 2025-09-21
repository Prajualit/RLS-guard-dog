-- =============================================
-- RLS POLICIES FOR SCHOOLS TABLE
-- Copy and paste these into your Supabase SQL editor
-- =============================================

-- Policy 1: Users can view their own school
CREATE POLICY "Users can view their school"
ON "public"."schools"
AS PERMISSIVE
FOR SELECT
TO public
USING (
  id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
);

-- Policy 2: Head teachers can update school information
CREATE POLICY "Head teachers can update school"
ON "public"."schools"
AS PERMISSIVE
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'head_teacher'
    AND school_id = schools.id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'head_teacher'
    AND school_id = schools.id
  )
);

-- Policy 3: Head teachers can insert new schools (for setup)
CREATE POLICY "Head teachers can create schools"
ON "public"."schools"
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'head_teacher'
  )
);