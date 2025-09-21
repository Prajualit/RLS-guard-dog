-- =============================================
-- RLS POLICIES FOR CLASSES TABLE
-- Copy and paste these into your Supabase SQL editor
-- =============================================

-- Policy 1: Users can view classes in their school
CREATE POLICY "Users can view school classes" 
ON "public"."classes"
AS PERMISSIVE
FOR SELECT
TO public
USING (
  school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
);

-- Policy 2: Teachers and head teachers can insert classes
CREATE POLICY "Teachers can create classes"
ON "public"."classes"
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('teacher', 'head_teacher')
    AND school_id = classes.school_id
  )
);

-- Policy 3: Teachers and head teachers can update classes
CREATE POLICY "Teachers can update classes"
ON "public"."classes"
AS PERMISSIVE
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('teacher', 'head_teacher')
    AND school_id = classes.school_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('teacher', 'head_teacher')
    AND school_id = classes.school_id
  )
);

-- Policy 4: Teachers and head teachers can delete classes
CREATE POLICY "Teachers can delete classes"
ON "public"."classes"
AS PERMISSIVE
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('teacher', 'head_teacher')
    AND school_id = classes.school_id
  )
);