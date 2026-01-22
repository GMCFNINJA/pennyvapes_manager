// inventory.js
const $ = (id) => document.getElementById(id);

console.log("inventory.js carregou ✅");

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
        <div class="name">Item ${it.item_no}</div>
      </div>

      <div class="right">
        <button class="btn" type="button" data-op="minus" data-item="${it.item_no}">−</button>
        <div class="qty" id="qty-${it.item_no}">${it.qty}</div>
        <button class="btn" type="button" data-op="plus" data-item="${it.item_no}">+</button>
      </div>
    `;
    list.appendChild(row);
  }
}

async function saveQty(userId, itemNo, qty) {
  const { error } = await sb
    .from("inventory_items")
    .update({ qty, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("item_no", itemNo);

  if (error) throw error;
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
    console.error(e);
    $("msg").textContent = "Erro ao carregar inventário.";
    return;
  }

  $("list").addEventListener("click", async (ev) => {
    const btn = ev.target.closest("button[data-op]");
    if (!btn) return;

    const itemNo = parseInt(btn.dataset.item, 10);
    const op = btn.dataset.op;

    const qtyEl = document.getElementById(`qty-${itemNo}`);
    const current = parseInt(qtyEl.textContent, 10);
    const next = Math.max(0, current + (op === "plus" ? 1 : -1));

    // UI instantânea
    qtyEl.textContent = String(next);

    try {
      await saveQty(user.id, itemNo, next);
    } catch (e) {
      console.error(e);
      qtyEl.textContent = String(current);
      $("msg").textContent = "Erro ao atualizar.";
      setTimeout(() => ($("msg").textContent = ""), 1500);
    }
  });
})();
