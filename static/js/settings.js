async function fetchLogs(limit = 200) {
  const res = await fetch(`/settings/logs?limit=${limit}`);
  if (!res.ok) return [];
  return res.json();
}

function renderLogs(logs) {
  const tbody = document.querySelector("#logs-table tbody");
  tbody.innerHTML = "";
  logs.forEach((l, index) => {
    const tr = document.createElement("tr");
    tr.className = `hover:bg-sky-50 transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`;

    const ts = new Date(l.timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Extrair nome do alvo da descrição quando possível
    let targetDisplay = l.target_table || "-";
    if (l.description) {
      const patterns = [
        /(?:Idoso|idoso|para|Responsável)\s+['"]([^'"]+)['"]/,
        /cadastrado:\s+([^\s(]+)/,
        /removido do sistema:\s+([^\s(]+)/,
        /vinculado ao idoso\s+['"]([^'"]+)['"]/,
        /adicionado para\s+([^\s-]+)/,
        /registrada para\s+([^\s]+)/,
      ];

      for (const pattern of patterns) {
        const match = l.description.match(pattern);
        if (match && match[1]) {
          targetDisplay = match[1];
          break;
        }
      }
    }

    // Definir cor do badge baseado na ação
    let badgeColor = "bg-gray-100 text-gray-700";
    if (
      l.action.includes("Criação") ||
      l.action.includes("Cadastro") ||
      l.action.includes("Registro")
    ) {
      badgeColor = "bg-green-100 text-green-700";
    } else if (
      l.action.includes("Atualização") ||
      l.action.includes("Alteração")
    ) {
      badgeColor = "bg-blue-100 text-blue-700";
    } else if (l.action.includes("Exclusão")) {
      badgeColor = "bg-red-100 text-red-700";
    }

    // Formatar timestamp para mobile (mais curto)
    const isMobile = window.innerWidth < 640;
    const tsFormatted = isMobile
      ? new Date(l.timestamp).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : ts;

    tr.innerHTML = `
      <td class="p-2 sm:p-4 text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap">
        <div class="flex items-center gap-1 sm:gap-2">
          <span class="hidden sm:inline-block w-2 h-2 bg-sky-500 rounded-full"></span>
          ${tsFormatted}
        </div>
      </td>
      <td class="p-2 sm:p-4 text-xs sm:text-sm">
        <span class="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 whitespace-nowrap">
          ${l.user || "Sistema"}
        </span>
      </td>
      <td class="p-2 sm:p-4 text-xs sm:text-sm">
        <span class="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold ${badgeColor} whitespace-nowrap">
          ${l.action}
        </span>
      </td>
      <td class="p-2 sm:p-4 text-xs sm:text-sm font-medium text-gray-800 max-w-[150px] sm:max-w-none truncate">${targetDisplay}</td>
      <td class="p-2 sm:p-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell max-w-md">${l.description || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateDateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timeStr = `${hours}:${minutes}:${seconds}`;
  const timeEl = document.getElementById("time");
  if (timeEl) timeEl.textContent = timeStr;

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
  const dateEl = document.getElementById("current-date");
  if (dateEl) dateEl.textContent = dateStr;
}

async function init() {
  document
    .getElementById("refresh-logs")
    .addEventListener("click", async () => {
      const limit = document.getElementById("logs-limit").value;
      const logs = await fetchLogs(limit);
      renderLogs(logs);
    });

  // initial logs load
  const logs = await fetchLogs(document.getElementById("logs-limit").value);
  renderLogs(logs);

  updateDateTime();
  setInterval(updateDateTime, 1000);
}

window.addEventListener("load", init);
