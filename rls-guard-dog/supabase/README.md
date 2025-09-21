# RLS Guard DogTech Database Setup

## Prerequisites

1. **Supabase Project**: Create a new Supabase project at [supabase.com](https://supabase.com)
2. **Environment Variables**: Update your `.env` file with your Supabase credentials

## Environment Setup

Update your `.env` file with the following values from your Supabase project:

```env
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Schema Setup

## Database Schema Setup

### Step 1: Run Main Schema First

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL in the editor

**The updated schema.sql already includes the fix and will run without errors.**

### Step 2: Verify Setup

After running the schema, verify the setup by checking:

1. **Tables Created**:
   - `schools`
   - `user_profiles`
   - `classes` 
   - `progress`

2. **RLS Enabled**: All tables should have Row Level Security enabled

3. **Policies**: Check that all RLS policies are created

4. **Triggers**: Verify the data consistency triggers are in place

### ⚠️ Important: Run Order

- **FIRST**: Run `supabase/schema.sql` (this creates all tables and the fixed constraints)
- **ONLY IF NEEDED**: Use `supabase/fix_check_constraint.sql` only if you previously ran an old version of the schema

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db reset
supabase db push
```

## Troubleshooting

## Troubleshooting

### Missing FROM-clause Error Fix
If you encountered the error `"42P01: missing FROM-clause entry for table 'new'"`, this was due to inconsistent language specification in trigger functions. The schema has been updated to fix this.

### Step-by-Step Setup (If Main Schema Fails)
If you're still having issues with the main schema, try the step-by-step approach:

1. Run `schema_step1_tables.sql` - Creates all tables
2. Run `schema_step2_rls_basic.sql` - Sets up basic RLS policies  
3. Run `schema_step3_progress_policies.sql` - Adds progress security policies
4. Run `schema_step4_final.sql` - Adds indexes, triggers, and sample data

### Check Constraint Error Fix
If you encountered the error `"0A000: cannot use subquery in check constraint"` when running the original schema, use the fix file:

1. Run `supabase/fix_check_constraint.sql` in the SQL editor
2. This replaces the problematic CHECK constraint with a proper trigger-based validation

## Verify Setup

After running the schema, verify the setup by checking:

1. **Tables Created**:
   - `schools`
   - `user_profiles`
   - `classes` 
   - `progress`

2. **RLS Enabled**: All tables should have Row Level Security enabled

3. **Policies**: Check that all RLS policies are created:
   - User profile policies
   - School policies
   - Class policies
   - Progress policies (core security)

## Testing RLS Policies

Create test users with different roles to verify the RLS policies work correctly:

1. Create a head teacher user
2. Create a teacher user
3. Create a student user
4. Test data access patterns

## Next Steps

After completing Phase 2 (Database Schema), proceed to Phase 3 (Authentication Setup).