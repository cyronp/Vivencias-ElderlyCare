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

function formatTimeHHMM(timeString) {
  if (!timeString) return "";
  return timeString.substring(0, 5);
}

function loadStatistics() {
  fetch("/idosos/")
    .then((response) => response.json())
    .then((idosos) => {
      document.getElementById("total-idosos").textContent = idosos.length;

      let totalCuidados = 0;
      let totalVisitas = 0;
      const hoje = new Date().toISOString().split("T")[0];

      idosos.forEach((idoso) => {
        totalCuidados += idoso.remedios?.length || 0;

        if (idoso.visitas) {
          totalVisitas += idoso.visitas.filter(
            (v) => v.data_visita === hoje
          ).length;
        }
      });

      document.getElementById("total-cuidados").textContent = totalCuidados;
      document.getElementById("total-visitas").textContent = totalVisitas;

      loadNextCares(idosos);
    })
    .catch((error) => {
      console.error("Erro ao carregar dados:", error);
    });
}

function loadNextCares(idosos) {
  const proximosCuidadosHtml = [];

  idosos.forEach((idoso) => {
    if (idoso.remedios && idoso.remedios.length > 0) {
      idoso.remedios.forEach((remedio) => {
        proximosCuidadosHtml.push({
          html: `
          <div class="p-5 border-l-4 border-sky-600 mb-3 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-all hover:translate-x-1">
              <div class="flex flex-col gap-2 pl-2">
                <strong class="text-gray-800 text-lg">${idoso.nome}</strong>
                <span class="text-gray-600 text-sm">${remedio.nome} - ${remedio.dosagem}</span>
              </div>
              <span class="text-sky-600 font-semibold text-lg min-w-20 text-right pr-2">${formatTimeHHMM(remedio.horario)}</span>
            </div>
          `,
          time: remedio.horario,
        });
      });
    }
  });

  proximosCuidadosHtml.sort((a, b) => a.time.localeCompare(b.time));
  const container = document.getElementById("proximos-cuidados");

  if (proximosCuidadosHtml.length > 0) {
    container.innerHTML = proximosCuidadosHtml
      .slice(0, 5)
      .map((item) => item.html)
      .join("");
  } else {
    container.innerHTML =
      '<p class="text-gray-400 text-center py-5">Nenhum cuidado cadastrado</p>';
  }
}

function loadVisitAlerts() {
  fetch("/idosos/alertas/visitas")
    .then((response) => response.json())
    .then((alertas) => {
      const container = document.getElementById("alertas-visitas");

      if (alertas.length === 0) {
        container.innerHTML = `
          <div class="p-6 text-center">
            <svg class="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-gray-600 text-lg">Todos os idosos receberam visitas recentemente!</p>
          </div>
        `;
        return;
      }

      const html = alertas
        .map(
          (alerta) => `
        <div class="p-5 border-l-4 ${alerta.ultima_visita === null ? "border-red-600 bg-red-50" : "border-amber-600 bg-amber-50"} mb-3 rounded-lg hover:shadow-md transition-all">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <svg class="w-6 h-6 ${alerta.ultima_visita === null ? "text-red-600" : "text-amber-600"}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <strong class="text-gray-800 text-lg">${alerta.nome}</strong>
              </div>
              <p class="text-gray-700 ml-9">
                ${
                  alerta.ultima_visita === null
                    ? '<span class="font-semibold text-red-700">Nunca recebeu visita</span>'
                    : `<span class="font-semibold text-amber-700">${alerta.dias_sem_visita} dias</span> sem visita (última em ${alerta.ultima_visita})`
                }
              </p>
            </div>
            <a 
              href="/static/pages/elderly_elders.html?id=${alerta.id}" 
              class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors no-underline whitespace-nowrap"
            >
              Ver Detalhes
            </a>
          </div>
        </div>
      `
        )
        .join("");

      container.innerHTML = html;
    })
    .catch((error) => {
      console.error("Erro ao carregar alertas de visitas:", error);
      document.getElementById("alertas-visitas").innerHTML =
        '<p class="text-red-500 text-center p-4">Erro ao carregar alertas</p>';
    });
}

updateDateTime();
setInterval(updateDateTime, 1000);
loadStatistics();
loadVisitAlerts();
