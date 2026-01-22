// supabase.js
window.SUPABASE_URL = "https://izzfsjzdatctzrqwukvx.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6emZzanpkYXRjdHpycXd1a3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzc5NzAsImV4cCI6MjA4NDYxMzk3MH0.UgEhFl2nl9L6riefYC0AxqvyOV9D-ZwWBMaQln8MjWg";

window.sb = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);

window.usernameToEmail = (username) => `${username}@penny.local`;
