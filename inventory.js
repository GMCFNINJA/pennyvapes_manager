const $ = (id) => document.getElementById(id);

async function requireUser() {
  const { data } = await sb.auth.getUser();
  if (!data?.user) window.location.href = "index.html";
  if (data.user.app_metadata?.role === "admin") window.location.href = "admin.html";
  return data.user;
}

async function loadInventory(userId) {
  const { data } = await sb
    .from("inventory_items")
    .select("*")
    .eq("user_id", userId)
    .order("item_no");

  $("list").innerHTML = data
    .map(i => `<li>${i.item_no}: ${i.qty}</li>`)
    .join("");
}

$("btnLogout").onclick = async () => {
  await sb.auth.signOut();
  window.location.href = "index.html";
};

(async () => {
  const user = await requireUser();
  if (user) loadInventory(user.id);
})();
