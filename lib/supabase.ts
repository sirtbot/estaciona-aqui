import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uonkxhaxcyoaiskptxxj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbmt4aGF4Y3lvYWlza3B0eHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MjkyMjEsImV4cCI6MjA3OTIwNTIyMX0.bYXfdI3HR0I1DJ4EoLLggU0FfdHBsASuvmmLtWxV_pw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
