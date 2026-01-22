// admin.js
const $ = (id) => document.getElementById(id);

async function requireAdmin() {
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) { window.location.href = "index.html"; return null; }
  if (user.app_metadata?.role !== "admin") { window.location.href = "app.html"; return null; }
  return user;
}

async function callFn(name, bodyObj) {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess?.session?.access_token;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bodyObj ?? {}),
  });

  if (!res.ok) throw new Error(await res.text());
  const txt = await res.text();
  try { return JSON.parse(txt); } catch { return txt; }
}

function renderUsers(users) {
  const box = $("users");
  box.innerHTML = "";
  for (const u of users) {
    const div = document.createElement("div");
    div.className = "row clickable";
    div.dataset.userId = u.user_id;
    div.dataset.username = u.username;
    div.innerHTML = `<div class="name">${u.username}</div>`;
    box.appendChild(div);
  }
}

async function loadInventoryReadOnly(userId) {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("item_no, qty")
    .eq("user_id", userId)
    .order("item_no", { ascending: true });
  if (error) throw error;
  return data;
}

function renderInventoryReadOnly(items) {
  const inv = $("inv");
  inv.innerHTML = "";
  for (const it of items) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <div class="left"><div class="name">${it.item_no}</div></div>
      <div class="right"><div class="qty">${it.qty}</div></div>
    `;
    inv.appendChild(row);
  }
}

$("btnLogout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "index.html";
});

$("btnCreate").addEventListener("click", async () => {
  $("msg").textContent = "";
  const username = prompt("Novo username (ex: tomas):");
  if (!username) return;
  const password = prompt("Password:");
  if (!password) return;

  try {
    await callFn("admin-create-user", { username: username.trim(), password });
    $("msg").textContent = "Conta criada.";
    const users = await callFn("admin-list-users");
    renderUsers(users);
  } catch (e) {
    $("msg").textContent = "Erro a criar conta: " + (e?.message ?? "");
  }
});

(async () => {
  const admin = await requireAdmin();
  if (!admin) return;

  try {
    const users = await callFn("admin-list-users");
    renderUsers(users);
  } catch (e) {
    $("msg").textContent = "Erro ao listar utilizadores: " + (e?.message ?? "");
  }

  $("users").addEventListener("click", async (ev) => {
    const row = ev.target.closest(".row.clickable");
    if (!row) return;

    const userId = row.dataset.userId;
    const username = row.dataset.username;

    $("details").textContent = `Utilizador: ${username} (${userId})`;
    $("msg").textContent = "";

    try {
      const items = await loadInventoryReadOnly(userId);
      renderInventoryReadOnly(items);
    } catch (e) {
      $("msg").textContent = "Erro ao carregar inventário: " + (e?.message ?? "");
    }
  });
})();
