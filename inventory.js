// inventory.js
const $ = (id) => document.getElementById(id);

async function requireUser() {
  const { data } = await sb.auth.getUser();
  const user = data?.user;

  if (!user) {
    window.location.href = "index.html";
    return null;
  }

  if (user.app_metadata?.role === "admin") {
    window.location.href = "admin.html";
    return null;
  }

  return user;
}

function itemImgSvg(n) {
  const hue = (n * 35) % 360;
  return `
    <svg width="36" height="36" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="28" cy="24" r="16" fill="hsl(${hue},70%,55%)"></circle>
      <rect x="26" y="36" width="4" height="22" rx="2" fill="#888"></rect>
    </svg>
  `;
}

async function loadInventory(userId) {
  const { data, error } = await sb
    .from("inventory_items")
    .select("item_no, qty")
    .eq("user_id", userId)
    .order("item_no", { ascending: true });

  if (error) throw error;
  return data;
}

function render(items) {
  const list = $("list");
  list.innerHTML = "";

  for (const it of items) {
    const row = document.createElement("div");
    row.className = "row";

    row.innerHTML = `
      <div class="left">
        <div class="img">${itemImgSvg(it.item_no)}</div>
        <div class="name">${it.item_no}</div>
      </div>

      <div class="right">
        <button class="btn" data-op="minus" data-item="${it.item_no}" type="button">−</button>
        <div class="qty" id="qty-${it.item_no}">${it.qty}</div>
        <button class="btn" data-op="plus" data-item="${it.item_no}" type="button">+</button>
      </div>
    `;

    list.appendChild(row);
  }
}

async function setQty(userId, itemNo, next) {
  const { error } = await sb
    .from("inventory_items")
    .update({ qty: next, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("item_no", itemNo);

  if (error) throw error;
}

async function changeQty(userId, itemNo, delta) {
  const qtyEl = document.getElementById(`qty-${itemNo}`);
  const current = parseInt(qtyEl.textContent, 10);
  const next = Math.max(0, current + delta);

  // UI imediata (rápida)
  qtyEl.textContent = String(next);

  try {
    await setQty(userId, itemNo, next);
  } catch (e) {
    // rollback se falhar
    qtyEl.textContent = String(current);
    throw e;
  }
}

$("btnLogout").addEventListener("click", async () => {
  await sb.auth.signOut();
  window.location.href = "index.html";
});

(async () => {
  const user = await requireUser();
  if (!user) return;

  try {
    const items = await loadInventory(user.id);
    render(items);
  } catch (e) {
    $("msg").textContent = "Erro ao carregar inventário.";
    return;
  }

  // Delegation: 1 listener para todos os botões
  $("list").addEventListener("click", async (ev) => {
    const btn = ev.target.closest("button[data-op]");
    if (!btn) return;

    $("msg").textContent = "";

    const itemNo = parseInt(btn.dataset.item, 10);
    const op = btn.dataset.op;
    const delta = op === "plus" ? 1 : -1;

    try {
      await changeQty(user.id, itemNo, delta);
    } catch (e) {
      $("msg").textContent = "Erro ao atualizar (RLS ou rede).";
      setTimeout(() => ($("msg").textContent = ""), 1500);
    }
  });
})();
