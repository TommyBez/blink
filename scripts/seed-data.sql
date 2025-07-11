-- Insert sample data (this will only work after a user is authenticated)
-- You can run this manually in the Supabase SQL editor after signing up

-- First, you need to get your user ID from auth.users table
-- Replace 'YOUR_USER_ID' with your actual user ID

-- Insert sample notebooks
INSERT INTO public.notebooks (name, user_id) VALUES
  ('Project Alpha', 'YOUR_USER_ID'),
  ('Meeting Notes', 'YOUR_USER_ID'),
  ('Personal Ideas', 'YOUR_USER_ID');

-- Insert sample tags
INSERT INTO public.tags (name, user_id) VALUES
  ('work', 'YOUR_USER_ID'),
  ('urgent', 'YOUR_USER_ID'),
  ('inspiration', 'YOUR_USER_ID');

-- Note: You'll need to insert notes and note_tags after getting the actual IDs
-- from the notebooks and tags tables
