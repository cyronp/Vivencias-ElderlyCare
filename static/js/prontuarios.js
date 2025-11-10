let filtroAtual = "todos";
let prontuariosData = [];

// Função helper para formatar horário (HH:MM)
function formatTime(timeString) {
  if (!timeString) return "";
  // Se vier como "HH:MM:SS", pega apenas "HH:MM"
  return timeString.substring(0, 5);
}

// Atualizar data e hora
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

async function gerarProntuarios() {
  try {
    const response = await fetch("/prontuarios/gerar-do-dia", {
      method: "POST",
    });
    const data = await response.json();
    alert(data.message + "\nQuantidade: " + data.quantidade);
    carregarProntuarios();
  } catch (error) {
    console.error("Erro ao gerar prontuários:", error);
    alert("Erro ao gerar prontuários");
  }
}

async function carregarProntuarios() {
  try {
    const response = await fetch("/prontuarios/hoje");
    prontuariosData = await response.json();
    atualizarEstatisticas();
    renderizarProntuarios();
  } catch (error) {
    console.error("Erro ao carregar prontuários:", error);
    document.getElementById("prontuarios-container").innerHTML =
      '<p class="text-red-500 text-center py-10">Erro ao carregar prontuários</p>';
  }
}

function atualizarEstatisticas() {
  const total = prontuariosData.length;
  const pendentes = prontuariosData.filter(
    (p) => p.status === "pendente"
  ).length;
  const concluidos = prontuariosData.filter(
    (p) => p.status === "concluido"
  ).length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-pendentes").textContent = pendentes;
  document.getElementById("stat-concluidos").textContent = concluidos;
}

function filtrarProntuarios(filtro) {
  filtroAtual = filtro;

  document.getElementById("btn-todos").className =
    "px-6 py-2 rounded-lg font-medium transition-colors " +
    (filtro === "todos"
      ? "bg-sky-600 text-white"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300");

  document.getElementById("btn-pendentes").className =
    "px-6 py-2 rounded-lg font-medium transition-colors " +
    (filtro === "pendente"
      ? "bg-sky-600 text-white"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300");

  document.getElementById("btn-concluidos").className =
    "px-6 py-2 rounded-lg font-medium transition-colors " +
    (filtro === "concluido"
      ? "bg-sky-600 text-white"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300");

  document.getElementById("btn-pulados").className =
    "px-6 py-2 rounded-lg font-medium transition-colors " +
    (filtro === "pulado"
      ? "bg-sky-600 text-white"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300");

  renderizarProntuarios();
}

function renderizarProntuarios() {
  const container = document.getElementById("prontuarios-container");

  let prontuariosFiltrados = prontuariosData;
  if (filtroAtual !== "todos") {
    prontuariosFiltrados = prontuariosData.filter(
      (p) => p.status === filtroAtual
    );
  }

  prontuariosFiltrados.sort((a, b) => {
    return a.horario_previsto.localeCompare(b.horario_previsto);
  });

  if (prontuariosFiltrados.length === 0) {
    container.innerHTML =
      '<p class="text-gray-400 text-center py-10">Nenhum prontuário encontrado</p>';
    return;
  }

  container.innerHTML = prontuariosFiltrados
    .map(
      (pront) => `
    <div class="bg-white rounded-xl shadow-md p-5 border-l-4 ${getCorStatus(pront.status)} hover:shadow-lg transition-all">
      <div class="flex flex-col md:flex-row justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-xl font-bold text-gray-800">${pront.idoso_nome}</h3>
              <p class="text-gray-600 mt-1">
                <strong>${pront.remedio_nome}</strong> 
                ${pront.remedio_dosagem ? `- ${pront.remedio_dosagem}` : ""}
              </p>
            </div>
            <span class="${getBadgeStatus(pront.status)} px-3 py-1 rounded-full text-sm font-medium">
              ${getTextoStatus(pront.status)}
            </span>
          </div>

          <div class="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
            <div class="flex items-center gap-2">
              <span>Previsto: <strong>${formatTime(pront.horario_previsto)}</strong></span>
            </div>
            ${
              pront.horario_realizado
                ? `
              <div class="flex items-center gap-2">
                <span>Realizado: <strong>${formatTime(formatarDataHora(pront.horario_realizado))}</strong></span>
              </div>
            `
                : ""
            }
          </div>

          ${
            pront.observacoes
              ? `
            <div class="bg-gray-50 p-3 rounded-lg mb-3">
              <p class="text-sm text-gray-700"><strong>Observações:</strong> ${pront.observacoes}</p>
            </div>
          `
              : ""
          }

          <div class="flex flex-wrap gap-2">
            ${
              pront.status === "pendente"
                ? `
              <button 
                onclick="marcarConcluido(${pront.id})"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Marcar Concluído
              </button>
              <button 
                onclick="marcarPulado(${pront.id})"
                class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Pular
              </button>
            `
                : ""
            }
            ${
              pront.status !== "pendente"
                ? `
              <button 
                onclick="marcarPendente(${pront.id})"
                class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Voltar para Pendente
              </button>
            `
                : ""
            }
            <button 
              onclick="adicionarObservacao(${pront.id}, '${pront.observacoes || ""}')"
              class="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
            >
              Observações
            </button>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function getCorStatus(status) {
  switch (status) {
    case "pendente":
      return "border-orange-500";
    case "concluido":
      return "border-green-500";
    case "pulado":
      return "border-yellow-500";
    default:
      return "border-gray-300";
  }
}

function getBadgeStatus(status) {
  switch (status) {
    case "pendente":
      return "bg-orange-100 text-orange-800";
    case "concluido":
      return "bg-green-100 text-green-800";
    case "pulado":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getTextoStatus(status) {
  switch (status) {
    case "pendente":
      return "Pendente";
    case "concluido":
      return "Concluído";
    case "pulado":
      return "Pulado";
    default:
      return status;
  }
}

function formatarDataHora(datetime) {
  const dt = new Date(datetime);
  const hours = String(dt.getHours()).padStart(2, "0");
  const minutes = String(dt.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

async function marcarConcluido(id) {
  try {
    const response = await fetch(`/prontuarios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "concluido",
      }),
    });

    if (response.ok) {
      carregarProntuarios();
    } else {
      alert("Erro ao atualizar prontuário");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao atualizar prontuário");
  }
}

async function marcarPulado(id) {
  try {
    const response = await fetch(`/prontuarios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "pulado",
      }),
    });

    if (response.ok) {
      carregarProntuarios();
    } else {
      alert("Erro ao atualizar prontuário");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao atualizar prontuário");
  }
}

async function marcarPendente(id) {
  try {
    const response = await fetch(`/prontuarios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "pendente",
        horario_realizado: null,
      }),
    });

    if (response.ok) {
      carregarProntuarios();
    } else {
      alert("Erro ao atualizar prontuário");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao atualizar prontuário");
  }
}

async function adicionarObservacao(id, observacaoAtual) {
  const observacao = prompt("Adicionar/Editar observação:", observacaoAtual);

  if (observacao === null) return;

  try {
    const pront = prontuariosData.find((p) => p.id === id);

    const response = await fetch(`/prontuarios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: pront.status,
        observacoes: observacao,
      }),
    });

    if (response.ok) {
      carregarProntuarios();
    } else {
      alert("Erro ao atualizar observação");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao atualizar observação");
  }
}

updateDateTime();
setInterval(updateDateTime, 1000);
carregarProntuarios();
