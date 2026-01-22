// admin.js
const $ = (id) => document.getElementById(id);

function logDebug(...args) {
  console.log(...args);
  const d = $("debug");
  if (d) d.textContent += args.map(a => (typeof a === "string" ? a : JSON.stringify(a))).join(" ") + "\n";
}

async function requireAdmin() {
  const { data } = await sb.auth.getUser();
  const user = data?.user;

  if (!user) {
    logDebug("Sem user -> ir para index.html");
    window.location.href = "index.html";
    return null;
  }

  logDebug("Logado como:", user.email);
  logDebug("Role:", user.app_metadata?.role);

  if (user.app_metadata?.role !== "admin") {
    logDebug("Não é admin -> ir para app.html");
    window.location.href = "app.html";
    return null;
  }

  return user;
}

async function callFn(name, body) {
  const { data, error } = await sb.auth.getSession();
  const token = data?.session?.access_token;

  logDebug("SUPABASE_URL:", window.SUPABASE_URL);
  logDebug("Token starts:", token ? token.slice(0, 20) : "SEM TOKEN");

  if (error || !token) throw new Error("Sem sessão/token. Faz login de novo.");

  const res = await fetch(`${window.SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body ?? {}),
  });

  const text = await res.text();
  logDebug("Function status:", res.status);
  logDebug("Function response:", text);

  if (!res.ok) throw new Error(text);

  try { return JSON.parse(text); } catch { return text; }
}

window.addEventListener("DOMContentLoaded", async () => {
  $("msg").textContent = "";
  $("debug").textContent = "";

  await requireAdmin();

  $("btnLogout").addEventListener("click", async () => {
    await sb.auth.signOut();
    window.location.href = "index.html";
  });

  $("btnCreate").addEventListener("click", async () => {
    $("msg").textContent = "";
    logDebug("Cliquei em Criar conta");

    const username = prompt("Novo username (ex: tomas):");
    if (!username) return;

    const password = prompt("Password:");
    if (!password) return;

    try {
      const out = await callFn("admin-create-user", { username: username.trim(), password });
      $("msg").textContent = `Conta criada: ${out.username}`;
    } catch (e) {
      $("msg").textContent = "Erro: " + (e?.message ?? e);
    }
  });
});
