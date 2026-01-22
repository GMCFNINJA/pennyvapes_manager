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
  const { data, error } = await sb.auth.getSession();
  const token = data?.session?.access_token;

  if (error || !token) {
    throw new Error("Sem sessão (token). Faz login de novo.");
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body ?? {}),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text);

  try { return JSON.parse(text); } catch { return text; }
}

});

(async () => {
  await requireAdmin();
})();
