// supabase.js

// 🔑 URL do teu projeto Supabase (FIXO)
window.SUPABASE_URL = "https://izzfsjzdatctzrqwukvx.supabase.co";

// 🔑 ANON PUBLIC KEY (SUBSTITUI pela tua)
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6emZzanpkYXRjdHpycXd1a3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzc5NzAsImV4cCI6MjA4NDYxMzk3MH0.UgEhFl2nl9L6riefYC0AxqvyOV9D-ZwWBMaQln8MjWg";

// cria o client com nome "sb" (para não colidir com o SDK)
window.sb = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);

// helper: username → email interno
window.usernameToEmail = function (username) {
  return `${username}@penny.local`;
};
