// inventory.js
const $ = (id) => document.getElementById(id);

async function requireUser() {
  const { data } = await sb.auth.getUser();
  if (!data?.user) {
    window.location.href = "index.html";
    return null;
  }
  if (data.user.app_metadata?.role === "admin") {
    window.location.href = "admin.html";
    return null;
  }
  return data.user;
}

$("btnLogout")?.addEventListener("click", async () => {
  await sb.auth.signOut();
  window.location.href = "index.html";
});

(async () => {
  await requireUser();
})();
