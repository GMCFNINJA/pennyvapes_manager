// admin.js
const $ = (id) => document.getElementById(id);

async function requireAdmin() {
  const { data } = await sb.auth.getUser();
  if (!data?.user) {
    window.location.href = "index.html";
    return null;
  }
  if (data.user.app_metadata?.role !== "admin") {
    window.location.href = "app.html";
    return null;
  }
  return data.user;
}

async function callFn(name, body) {
  const { data: session } = await sb.auth.getSession();
  const token = session.session.access_token;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body ?? {}),
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

$("btnLogout").addEventListener("click", async () => {
  await sb.auth.signOut();
  window.location.href = "index.html";
});

$("btnCreate").addEventListener("click", async () => {
  const username = prompt("Username:");
  const password = prompt("Password:");
  if (!username || !password) return;

  try {
    await callFn("admin-create-user", { username, password });
    $("msg").textContent = "Conta criada!";
  } catch (e) {
    $("msg").textContent = e.message;
  }
});

(async () => {
  await requireAdmin();
})();
