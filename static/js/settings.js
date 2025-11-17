async function fetchLogs(limit = 200) {
  const res = await fetch(`/settings/logs?limit=${limit}`);
  if (!res.ok) return [];
  return res.json();
}

function renderLogs(logs) {
  const tbody = document.querySelector("#logs-table tbody");
  const mobileContainer = document.getElementById("logs-mobile-container");

  console.log("Renderizando logs:", logs.length);
  console.log("tbody existe?", !!tbody);
  console.log("mobileContainer existe?", !!mobileContainer);

  // Limpar ambos os containers
  if (tbody) tbody.innerHTML = "";
  if (mobileContainer) mobileContainer.innerHTML = "";

  // Mensagem quando não há logs
  if (logs.length === 0) {
    if (tbody) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="p-8 text-center text-gray-400">Nenhum registro encontrado</td></tr>';
    }
    if (mobileContainer) {
      mobileContainer.innerHTML =
        '<div class="text-center text-gray-400 py-8">Nenhum registro encontrado</div>';
    }
    return;
  }

  logs.forEach((l, index) => {
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

    const ts = new Date(l.timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const tsShort = new Date(l.timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Renderizar para desktop (tabela)
    if (tbody) {
      const tr = document.createElement("tr");
      tr.className = `hover:bg-sky-50 transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`;

      tr.innerHTML = `
        <td class="p-4 text-sm text-gray-600 font-medium whitespace-nowrap">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2 h-2 bg-sky-500 rounded-full"></span>
            ${ts}
          </div>
        </td>
        <td class="p-4 text-sm">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 whitespace-nowrap">
            ${l.user || "Sistema"}
          </span>
        </td>
        <td class="p-4 text-sm">
          <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${badgeColor} whitespace-nowrap">
            ${l.action}
          </span>
        </td>
        <td class="p-4 text-sm font-medium text-gray-800">${targetDisplay}</td>
        <td class="p-4 text-sm text-gray-600 max-w-md">${l.description || ""}</td>
      `;
      tbody.appendChild(tr);
    }

    // Renderizar para mobile (cards)
    if (mobileContainer) {
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow";

      card.innerHTML = `
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${badgeColor}">
                ${l.action}
              </span>
            </div>
            <div class="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              ${tsShort}
            </div>
            <div class="text-xs text-gray-500 flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                ${l.user || "Sistema"}
              </span>
            </div>
          </div>
        </div>
        ${
          targetDisplay !== "-"
            ? `
        <div class="mb-2 pb-2 border-b border-gray-100">
          <div class="text-xs text-gray-500 mb-1">Alvo:</div>
          <div class="text-sm font-medium text-gray-800">${targetDisplay}</div>
        </div>`
            : ""
        }
        ${
          l.description
            ? `
        <div>
          <div class="text-xs text-gray-500 mb-1">Descrição:</div>
          <div class="text-sm text-gray-600">${l.description}</div>
        </div>`
            : ""
        }
      `;

      mobileContainer.appendChild(card);
      console.log("Card adicionado para log:", index);
    }
  });

  console.log("Renderização concluída");
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
  // Adicionar listener para mudança de limite
  const logsLimitSelect = document.getElementById("logs-limit");
  if (logsLimitSelect) {
    logsLimitSelect.addEventListener("change", async () => {
      const limit = logsLimitSelect.value;
      const logs = await fetchLogs(limit);
      renderLogs(logs);
    });
  }

  // Adicionar listener para botão de refresh
  const refreshBtn = document.getElementById("refresh-logs");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      const limit = document.getElementById("logs-limit").value;
      const logs = await fetchLogs(limit);
      renderLogs(logs);
    });
  }

  // Carregar logs iniciais
  const initialLimit = document.getElementById("logs-limit")?.value || 200;
  const logs = await fetchLogs(initialLimit);
  console.log("Logs carregados:", logs.length);
  console.log(
    "Container mobile existe?",
    !!document.getElementById("logs-mobile-container")
  );
  renderLogs(logs);

  updateDateTime();
  setInterval(updateDateTime, 1000);
}

window.addEventListener("load", init);
