const $ = (id) => document.getElementById(id);

async function requireAdmin() {
  const { data } = await sb.auth.getUser();
  if (!data?.user) {
    window.location.href = "index.html";
    return;
  }
  if (data.user.app_metadata?.role !== "admin") {
    window.location.href = "app.html";
    return;
  }
}

async function callFn(name, body) {
  const { data, error } = await sb.auth.getSession();
  const token = data?.session?.access_token;

  if (error || !token) {
    throw new Error("Sem sessão/token. Faz logout e login de novo.");
  }

  const res = await fetch(`${window.SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // ✅ importante: mandar apikey (anon) + JWT do user
      "apikey": window.SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(body ?? {}),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

  try { return JSON.parse(text); } catch { return text; }
}

$("btnCreate").onclick = async () => {
  $("msg").textContent = "";

  const username = prompt("Username:");
  const password = prompt("Password:");
  if (!username || !password) return;

  try {
    const out = await callFn("admin-create-user", { username, password });
    $("msg").textContent = "Conta criada: " + (out.username ?? username);
  } catch (e) {
    $("msg").textContent = "Erro: " + (e?.message ?? e);
  }
};

$("btnLogout").onclick = async () => {
  await sb.auth.signOut();
  window.location.href = "index.html";
};

requireAdmin();
