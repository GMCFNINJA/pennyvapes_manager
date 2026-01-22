// auth.js
const $ = (id) => document.getElementById(id);

async function routeAfterLogin() {
  const { data } = await sb.auth.getUser();
  if (!data?.user) return;

  const role = data.user.app_metadata?.role;
  if (role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "app.html";
  }
}

$("btnLogin").addEventListener("click", async () => {
  $("msg").textContent = "";

  const username = $("username").value.trim();
  const password = $("password").value;

  if (!username || !password) {
    $("msg").textContent = "Preenche tudo.";
    return;
  }

  const email = usernameToEmail(username);

  const { error } = await sb.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    $("msg").textContent = "Login inválido.";
    return;
  }

  await routeAfterLogin();
});

// se já tiver sessão
routeAfterLogin();
