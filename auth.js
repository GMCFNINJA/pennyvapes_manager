const $ = (id) => document.getElementById(id);

async function route() {
  const { data } = await sb.auth.getUser();
  if (!data?.user) return;

  if (data.user.app_metadata?.role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "app.html";
  }
}

$("btnLogin").onclick = async () => {
  $("msg").textContent = "";

  const email = usernameToEmail($("username").value.trim());
  const password = $("password").value;

  const { error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    $("msg").textContent = "Login inválido";
    return;
  }

  route();
};

route();
