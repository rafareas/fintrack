import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl || 'https://pxqydtrpkvtnvbepmcms.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cXlkdHJwa3Z0bnZiZXBtY21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDYzOTIsImV4cCI6MjA5MDEyMjM5Mn0.sE1Yuv8Rqk2kKjCV_viu9bK3O2xYvZXn9KDWDlw_Gzs'
);
