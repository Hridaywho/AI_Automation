import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://khmacocrrasnwvvczeqf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobWFjb2NycmFzbnd2dmN6ZXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODYzMDksImV4cCI6MjA3Mzg2MjMwOX0.rRvabCeN-caB0eJzrX9HAnMzudNIKiJhcjR3I6bDu1Y'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)