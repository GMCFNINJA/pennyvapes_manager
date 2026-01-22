<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Admin</title>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script defer src="supabase.js"></script>
  <script defer src="admin.js"></script>

  <style>
    body { font-family: Arial, sans-serif; margin:0; background:#f5f5f5; }
    .topbar { background:#fff; border-bottom:1px solid #ddd; padding:12px 16px; display:flex; gap:10px; align-items:center; }
    .spacer { flex:1; }
    button { padding:10px 12px; border:1px solid #333; border-radius:10px; background:#fff; cursor:pointer; }
    .container { padding:16px; }
    .msg { color:#b00020; }
  </style>
</head>
<body>
  <header class="topbar">
    <strong>Admin</strong>
    <div class="spacer"></div>
    <button id="btnCreate" type="button">Criar conta</button>
    <button id="btnLogout" type="button">Sair</button>
  </header>

  <main class="container">
    <p id="msg" class="msg"></p>
  </main>
</body>
</html>
