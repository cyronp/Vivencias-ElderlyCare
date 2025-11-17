async function listUsers() {
  const res = await fetch("/users/");
  if (!res.ok) return [];
  return res.json();
}

async function renderUsers() {
  const users = await listUsers();
  const container = document.getElementById("users-list");
  container.innerHTML = "";
  users.forEach((u) => {
    const div = document.createElement("div");
    div.className =
      "bg-gray-50 p-6 rounded-lg border-2 border-gray-200 flex items-center justify-between";
    div.innerHTML = `
      <div>
        <div class="font-semibold text-lg text-gray-800">${u.username}</div>
        <div class="text-sm text-gray-600">${u.full_name || ""}</div>
      </div>
    `;
    const btn = document.createElement("button");
    btn.className =
      "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium";
    btn.textContent = "Remover";
    btn.onclick = async () => {
      showConfirm("Remover usuário?", async () => {
        const res = await fetch(`/users/${u.id}`, { method: "DELETE" });
        if (res.ok) {
          showNotification("Usuário removido com sucesso!", "success");
          await renderUsers();
        } else {
          showNotification("Erro ao remover", "error");
        }
      });
    };
    div.appendChild(btn);
    container.appendChild(div);
  });
}

window.addEventListener("load", async () => {
  await renderUsers();

  document.getElementById("create-user").addEventListener("click", async () => {
    const username = document.getElementById("user-username").value;
    const fullname = document.getElementById("user-fullname").value;
    const password = document.getElementById("user-password").value;
    if (!username || !password) {
      showNotification("Username e Senha são obrigatórios", "warning");
      return;
    }
    const payload = {
      username,
      full_name: fullname,
      password,
    };
    const res = await fetch("/users/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      document.getElementById("user-username").value = "";
      document.getElementById("user-fullname").value = "";
      document.getElementById("user-password").value = "";
      showNotification("Usuário criado com sucesso!", "success");
      await renderUsers();
    } else {
      const data = await res.json().catch(() => ({ detail: "Erro" }));
      showNotification("Erro: " + (data.detail || ""), "error");
    }
  });
});

function updateDateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timeStr = `${hours}:${minutes}:${seconds}`;
  document.getElementById("time").textContent = timeStr;

  const day = now.getDate();
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const dateStr = `${day} de ${month} de ${year}`;
  document.getElementById("current-date").textContent = dateStr;
}

updateDateTime();
setInterval(updateDateTime, 1000);
