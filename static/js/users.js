async function listProfiles() {
  const res = await fetch("/users/profiles");
  if (!res.ok) return [];
  return res.json();
}

async function listUsers() {
  const res = await fetch("/users/");
  if (!res.ok) return [];
  return res.json();
}

async function loadProfilesIntoSelect() {
  const profiles = await listProfiles();
  const sel = document.getElementById("user-profile");
  const modalSel = document.getElementById("modal-user-profile");

  [sel, modalSel].forEach((element) => {
    if (element) {
      element.innerHTML = "";
      profiles.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name;
        element.appendChild(opt);
      });
    }
  });
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
        <div class="text-sm text-gray-500">${u.profile?.name || "Sem perfil"}</div>
      </div>
    `;
    const btn = document.createElement("button");
    btn.className =
      "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium";
    btn.textContent = "Remover";
    btn.onclick = async () => {
      if (!confirm("Remover usuário?")) return;
      const res = await fetch(`/users/${u.id}`, { method: "DELETE" });
      if (res.ok) {
        await renderUsers();
      } else {
        alert("Erro ao remover");
      }
    };
    div.appendChild(btn);
    container.appendChild(div);
  });
}

window.addEventListener("load", async () => {
  await loadProfilesIntoSelect();
  await renderUsers();

  // Modal controls
  const modal = document.getElementById("user-modal");
  const openBtn = document.getElementById("open-user-modal");
  const closeBtns = document.querySelectorAll(".close-modal");
  const profileMenu = document.getElementById("profile-menu");

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      if (profileMenu) profileMenu.classList.add("hidden");
    });
  }

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });

  // Modal create user
  document
    .getElementById("modal-create-user")
    .addEventListener("click", async () => {
      const username = document.getElementById("modal-user-username").value;
      const fullname = document.getElementById("modal-user-fullname").value;
      const password = document.getElementById("modal-user-password").value;
      const profile_id =
        document.getElementById("modal-user-profile").value || null;
      if (!username || !password) {
        alert("username e senha são obrigatórios");
        return;
      }
      const payload = {
        username,
        full_name: fullname,
        password,
        profile_id: profile_id ? Number(profile_id) : null,
      };
      const res = await fetch("/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        document.getElementById("modal-user-username").value = "";
        document.getElementById("modal-user-fullname").value = "";
        document.getElementById("modal-user-password").value = "";
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        await renderUsers();
      } else {
        const data = await res.json().catch(() => ({ detail: "Erro" }));
        alert("Erro: " + (data.detail || ""));
      }
    });

  // Page form create user
  document.getElementById("create-user").addEventListener("click", async () => {
    const username = document.getElementById("user-username").value;
    const fullname = document.getElementById("user-fullname").value;
    const password = document.getElementById("user-password").value;
    const profile_id = document.getElementById("user-profile").value || null;
    if (!username || !password) {
      alert("username e senha são obrigatórios");
      return;
    }
    const payload = {
      username,
      full_name: fullname,
      password,
      profile_id: profile_id ? Number(profile_id) : null,
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
      await renderUsers();
    } else {
      const data = await res.json().catch(() => ({ detail: "Erro" }));
      alert("Erro: " + (data.detail || ""));
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
