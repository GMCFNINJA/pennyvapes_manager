const $ = (id) => document.getElementById(id);

async function requireAdmin() {
  const { data } = await sb.auth.getUser();
  if (!data?.user) {
    window.location.href = "index.html";
    return;
  }
  if (data.user.app_metadata?.role !== "admin") {
    window.location.href = "app.html";
  }
}

async function callFn(name, body) {
  const { data } = await sb.auth.getSession();
  const token = data?.session?.access_token;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

$("btnCreate").onclick = async () => {
  $("msg").textContent = "";

  const username = prompt("Username:");
  const password = prompt("Password:");
  if (!username || !password) return;

  try {
    await callFn("admin-create-user", { username, password });
    $("msg").textContent = "Conta criada com sucesso";
  } catch (e) {
    $("msg").textContent = "Erro: " + e.message;
  }
};

$("btnLogout").onclick = async () => {
  await sb.auth.signOut();
  window.location.href = "index.html";
};

requireAdmin();
