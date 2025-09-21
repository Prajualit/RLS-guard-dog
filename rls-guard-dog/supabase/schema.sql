-- =============================================
-- RLS Guard DogTech Database Schema
-- Phase 2: Database Schema Design
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE CREATION
-- =============================================

-- Schools Table
CREATE TABLE schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom user profiles (extends auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  school_id UUID REFERENCES schools(id) NOT NULL,
  role TEXT CHECK (role IN ('student', 'teacher', 'head_teacher')) NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  class_id UUID, -- Only for students and teachers
  subject TEXT, -- Only for teachers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes Table
CREATE TABLE classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) NOT NULL,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES user_profiles(id),
  subject TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress Table
CREATE TABLE progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES user_profiles(id) NOT NULL,
  class_id UUID REFERENCES classes(id) NOT NULL,
  school_id UUID NOT NULL, -- Denormalized for RLS efficiency
  assignment_name TEXT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  date_completed DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraint to ensure class_id foreign key matches school_id
ALTER TABLE user_profiles 
ADD CONSTRAINT fk_user_class_school 
FOREIGN KEY (class_id) REFERENCES classes(id);

-- Note: We'll use a trigger instead of CHECK constraint to ensure progress school_id matches class school_id
-- This is because PostgreSQL doesn't allow subqueries in CHECK constraints

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- =============================================
-- USER PROFILES POLICIES
-- =============================================

-- Users can view their own profile and profiles in their school
CREATE POLICY "Users can view relevant profiles" ON user_profiles
FOR SELECT USING (
  auth.uid() = id OR 
  school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Head teachers can insert new users in their school
CREATE POLICY "Head teachers can create school users" ON user_profiles
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles existing_users
    WHERE existing_users.id = auth.uid() 
    AND existing_users.role = 'head_teacher'
  )
);

-- =============================================
-- SCHOOLS POLICIES
-- =============================================

-- Users can view their own school
CREATE POLICY "Users can view their school" ON schools
FOR SELECT USING (
  id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
);

-- Only head teachers can update school information
CREATE POLICY "Head teachers can update school" ON schools
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'head_teacher'
    AND school_id = schools.id
  )
);

-- =============================================
-- CLASSES POLICIES
-- =============================================

-- Users can view classes in their school
CREATE POLICY "Users can view school classes" ON classes
FOR SELECT USING (
  school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
);

-- Teachers and head teachers can manage classes
CREATE POLICY "Teachers can manage classes" ON classes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('teacher', 'head_teacher')
    AND school_id = classes.school_id
  )
);

-- =============================================
-- PROGRESS POLICIES (CORE SECURITY LOGIC)
-- =============================================

-- Students: Only see their own progress
CREATE POLICY "Students see own progress" ON progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'student' 
    AND id = progress.student_id
  )
);

-- Teachers: See progress for students in their classes
CREATE POLICY "Teachers see class progress" ON progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN classes c ON c.teacher_id = up.id
    WHERE up.id = auth.uid() 
    AND up.role = 'teacher'
    AND c.id = progress.class_id
  )
);

-- Head Teachers: See all progress in their school
CREATE POLICY "Head teachers see school progress" ON progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'head_teacher'
    AND school_id = progress.school_id
  )
);

-- Teachers can insert/update progress for their students
CREATE POLICY "Teachers manage class progress" ON progress
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN classes c ON c.teacher_id = up.id
    WHERE up.id = auth.uid() 
    AND up.role IN ('teacher', 'head_teacher')
    AND c.id = progress.class_id
  )
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Index for user profile lookups
CREATE INDEX idx_user_profiles_school_id ON user_profiles(school_id);
CREATE INDEX idx_user_profiles_class_id ON user_profiles(class_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Index for classes
CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);

-- Index for progress queries (most important for performance)
CREATE INDEX idx_progress_student_id ON progress(student_id);
CREATE INDEX idx_progress_class_id ON progress(class_id);
CREATE INDEX idx_progress_school_id ON progress(school_id);
CREATE INDEX idx_progress_date_completed ON progress(date_completed);

-- Composite indexes for common query patterns
CREATE INDEX idx_progress_class_date ON progress(class_id, date_completed);
CREATE INDEX idx_progress_student_date ON progress(student_id, date_completed);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_progress_updated_at ON progress;
CREATE TRIGGER update_progress_updated_at 
    BEFORE UPDATE ON progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DATA CONSISTENCY TRIGGERS
-- =============================================

-- Function to validate progress school_id matches class school_id
CREATE OR REPLACE FUNCTION validate_progress_school_consistency()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the progress school_id matches the class school_id
    IF NOT EXISTS (
        SELECT 1 FROM classes 
        WHERE id = NEW.class_id 
        AND school_id = NEW.school_id
    ) THEN
        RAISE EXCEPTION 'Progress school_id must match the school_id of the associated class';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to validate progress consistency on insert and update
DROP TRIGGER IF EXISTS validate_progress_school_consistency_trigger ON progress;
CREATE TRIGGER validate_progress_school_consistency_trigger
    BEFORE INSERT OR UPDATE ON progress
    FOR EACH ROW
    EXECUTE FUNCTION validate_progress_school_consistency();

-- =============================================
-- SAMPLE DATA (FOR TESTING)
-- =============================================

-- Insert sample school
INSERT INTO schools (id, name, address) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Demo Elementary School', '123 Education St, Learning City');

-- Note: User profiles, classes, and progress will be inserted through the application
-- after user authentication is set up in Phase 3