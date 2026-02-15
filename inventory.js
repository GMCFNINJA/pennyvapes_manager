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

/* ===================== PUSH SEND (PASSO 9) ===================== */
async function sendSalePush() {
  const { data } = await sb.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) return;

  // não precisa body, mas mando um pequeno payload
  const res = await fetch(`${window.SUPABASE_URL}/functions/v1/push-send-sale`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": window.SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ event: "sale" }),
  });

  // se falhar, não rebenta a app
  if (!res.ok) {
    console.warn("push-send-sale falhou:", await res.text());
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
    const delta = op === "plus" ? 1 : -1;
    const next = Math.max(0, current + delta);

    // se não muda (ex: current=0 e op=minus), não faz nada
    if (next === current) return;

    // UI otimista
    qtyEl.textContent = String(next);

    try {
      await saveQty(user.id, itemNo, next);

      // ✅ PASSO 9: só dispara push quando foi venda (minus) e realmente diminuiu
      if (op === "minus") {
        sendSalePush().catch(() => {});
      }
    } catch (e) {
      console.error(e);
      qtyEl.textContent = String(current);
      $("msg").textContent = "Erro ao atualizar.";
      setTimeout(() => ($("msg").textContent = ""), 1500);
    }
  });
})();

/* ===================== PUSH REGISTER (ANDROID) ===================== */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function enablePush() {
  try {
    // 0) checks
    if (!("serviceWorker" in navigator)) {
      alert("Sem Service Worker (browser não suporta). Usa Chrome no Android.");
      return;
    }
    if (!("PushManager" in window)) {
      alert("Sem PushManager (browser não suporta push). Usa Chrome no Android.");
      return;
    }
    if (!("Notification" in window)) {
      alert("Sem Notifications API.");
      return;
    }

    // 1) registar SW aqui (mais fiável que depender do supabase.js)
    const reg = await navigator.serviceWorker.register("./sw.js");
    await navigator.serviceWorker.ready; // agora sim deve ficar pronto

    // 2) pedir permissão
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      alert("Permissão recusada ou bloqueada. Vai às definições do site e permite notificações.");
      return;
    }

    // 3) subscrever
    const vapidPublicKey =
      "BEI8FZOL-mREeQ9EAthEtG7cy9VPinRoQGIAk8hRwjak_FQIFILtyvnuTn6naKZwFMoHSuR1tNihEotLBTQT3R0";

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // 4) guardar no Supabase via Edge Function
    const { data } = await sb.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) {
      alert("Sem sessão/token. Faz login primeiro.");
      return;
    }

    const res = await fetch(`${window.SUPABASE_URL}/functions/v1/push-register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": window.SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(sub.toJSON()),
    });

    const text = await res.text();
    if (!res.ok) {
      alert("Erro a guardar subscription: " + text);
      return;
    }

    alert("Notificações ativadas ✅");
  } catch (e) {
    alert("Erro ao ativar push: " + (e?.message ?? e));
    console.error(e);
  }
});
