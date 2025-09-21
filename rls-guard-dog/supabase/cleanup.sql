-- =============================================
-- CLEANUP SCRIPT
-- Use this if you need to reset and start over
-- =============================================

-- Drop all triggers first
DROP TRIGGER IF EXISTS validate_progress_school_consistency_trigger ON progress;
DROP TRIGGER IF EXISTS update_progress_updated_at ON progress;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- Drop all functions
DROP FUNCTION IF EXISTS validate_progress_school_consistency();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop all policies (RLS policies)
DROP POLICY IF EXISTS "Teachers manage class progress" ON progress;
DROP POLICY IF EXISTS "Head teachers see school progress" ON progress;
DROP POLICY IF EXISTS "Teachers see class progress" ON progress;
DROP POLICY IF EXISTS "Students see own progress" ON progress;

DROP POLICY IF EXISTS "Teachers can manage classes" ON classes;
DROP POLICY IF EXISTS "Users can view school classes" ON classes;

DROP POLICY IF EXISTS "Head teachers can update school" ON schools;
DROP POLICY IF EXISTS "Users can view their school" ON schools;

DROP POLICY IF EXISTS "Head teachers can create school users" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view relevant profiles" ON user_profiles;

-- Disable RLS
ALTER TABLE progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;

-- Drop all tables (BE CAREFUL - THIS DELETES ALL DATA!)
-- Uncomment the lines below only if you want to completely reset
-- DROP TABLE IF EXISTS progress CASCADE;
-- DROP TABLE IF EXISTS classes CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP TABLE IF EXISTS schools CASCADE;