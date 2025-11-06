import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ktmvvgqfjpmzqpvebkti.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bXZ2Z3FmanBtenFwdmVia3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4ODY2MDQsImV4cCI6MjA3NzQ2MjYwNH0.Krkey-swvNfNYfV3F_Ksg7j5qsQxapnsmeksA_twWEM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
