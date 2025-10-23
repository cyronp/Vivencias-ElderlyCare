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
            <div class="care-item">
              <div class="care-info">
                <strong class="care-patient">${idoso.nome}</strong>
                <span class="care-description">${remedio.nome} - ${remedio.dosagem}</span>
              </div>
              <span class="care-time">${remedio.horario}</span>
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
      '<p style="color: #999; text-align: center;">Nenhum cuidado cadastrado</p>';
  }
}

// Inicializa
updateDateTime();
setInterval(updateDateTime, 1000);
loadStatistics();
