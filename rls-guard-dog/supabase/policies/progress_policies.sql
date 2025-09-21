-- =============================================
-- RLS POLICIES FOR PROGRESS TABLE (MOST IMPORTANT)
-- Copy and paste these into your Supabase SQL editor
-- =============================================

-- Policy 1: Students can only see their own progress
CREATE POLICY "Students see own progress"
ON "public"."progress"
AS PERMISSIVE
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'student' 
    AND id = progress.student_id
  )
);

-- Policy 2: Teachers can see progress for students in their classes
CREATE POLICY "Teachers see class progress"
ON "public"."progress"
AS PERMISSIVE
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN classes c ON c.teacher_id = up.id
    WHERE up.id = auth.uid() 
    AND up.role = 'teacher'
    AND c.id = progress.class_id
  )
);

-- Policy 3: Head teachers can see all progress in their school
CREATE POLICY "Head teachers see school progress"
ON "public"."progress"
AS PERMISSIVE
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'head_teacher'
    AND school_id = progress.school_id
  )
);

-- Policy 4: Teachers can insert progress for their students
CREATE POLICY "Teachers can create progress"
ON "public"."progress"
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN classes c ON c.teacher_id = up.id
    WHERE up.id = auth.uid() 
    AND up.role IN ('teacher', 'head_teacher')
    AND c.id = progress.class_id
  )
);

-- Policy 5: Teachers can update progress for their students
CREATE POLICY "Teachers can update progress"
ON "public"."progress"
AS PERMISSIVE
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN classes c ON c.teacher_id = up.id
    WHERE up.id = auth.uid() 
    AND up.role IN ('teacher', 'head_teacher')
    AND c.id = progress.class_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN classes c ON c.teacher_id = up.id
    WHERE up.id = auth.uid() 
    AND up.role IN ('teacher', 'head_teacher')
    AND c.id = progress.class_id
  )
);

-- Policy 6: Teachers can delete progress for their students
CREATE POLICY "Teachers can delete progress"
ON "public"."progress"
AS PERMISSIVE
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN classes c ON c.teacher_id = up.id
    WHERE up.id = auth.uid() 
    AND up.role IN ('teacher', 'head_teacher')
    AND c.id = progress.class_id
  )
);