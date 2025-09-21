-- =============================================
-- DATABASE RESET AND FIX FOR RLS INFINITE RECURSION
-- Run this entire script in your Supabase SQL editor
-- =============================================

-- First, disable RLS temporarily to clean up
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progress DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view relevant profiles" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Users can view own profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Users can view school profiles" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Head teachers can create school users" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Users can insert own profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "delete_own_profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "view_own_profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "update_own_profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "insert_own_profile" ON "public"."user_profiles";

-- Drop helper functions if they exist
DROP FUNCTION IF EXISTS get_user_school_id(UUID);

-- =============================================
-- RECREATE TABLES IF NEEDED (skip if they exist and have data)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schools Table (if not exists)
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (if not exists)
CREATE TABLE IF NOT EXISTS user_profiles (
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

-- Classes Table (if not exists)
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) NOT NULL,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES user_profiles(id),
  subject TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress Table (if not exists)
CREATE TABLE IF NOT EXISTS progress (
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

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SIMPLE, NON-RECURSIVE RLS POLICIES FOR TESTING
-- =============================================

-- USER PROFILES: Simple policies that don't cause recursion
CREATE POLICY "view_own_profile" ON user_profiles
  FOR SELECT TO public
  USING (auth.uid() = id);

CREATE POLICY "update_own_profile" ON user_profiles
  FOR UPDATE TO public
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "insert_own_profile" ON user_profiles
  FOR INSERT TO public
  WITH CHECK (auth.uid() = id);

-- SCHOOLS: Allow viewing any school for now (simplify for testing)
CREATE POLICY "view_all_schools" ON schools
  FOR SELECT TO public
  USING (true);

-- CLASSES: Allow viewing any class for now (simplify for testing)
CREATE POLICY "view_all_classes" ON classes
  FOR SELECT TO public
  USING (true);

-- PROGRESS: Allow viewing any progress for now (simplify for testing)
CREATE POLICY "view_all_progress" ON progress
  FOR SELECT TO public
  USING (true);

-- =============================================
-- INSERT SAMPLE DATA (if not exists)
-- =============================================

-- Insert sample school if it doesn't exist
INSERT INTO schools (id, name, address) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Demo Elementary School', '123 Education St, Learning City')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE 'Database setup complete! RLS policies have been simplified to avoid recursion.';
  RAISE NOTICE 'You can now test authentication without infinite recursion errors.';
END
$$;