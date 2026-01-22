// auth.js
const $ = (id) => document.getElementById(id);

async function routeAfterLogin() {
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) return;

  const role = user.app_metadata?.role;
  if (role === "admin") window.location.href = "admin.html";
  else window.location.href = "app.html";
}

$("btnLogin").addEventListener("click", async () => {
  $("msg").textContent = "";

  const username = $("username").value.trim();
  const password = $("password").value;

  if (!username || !password) {
    $("msg").textContent = "Preenche username e password.";
    return;
  }

  const email = usernameToEmail(username);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    $("msg").textContent = "Login inválido.";
    return;
  }

  await routeAfterLogin();
});

routeAfterLogin();

