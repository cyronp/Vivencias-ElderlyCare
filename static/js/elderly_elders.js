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

function getPriorityClass(priority) {
  const priorityLower = priority.toLowerCase();
  if (priorityLower === "alta") return "high-priority";
  if (priorityLower === "media" || priorityLower === "média")
    return "medium-priority";
  if (priorityLower === "baixa") return "low-priority";
  return "low-priority";
}

function createElderBox(idoso) {
  const elderBox = document.createElement("div");
  elderBox.className =
    "bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full";

  const remediosPorPrioridade = {
    alta: [],
    media: [],
    baixa: [],
  };

  idoso.remedios.forEach((remedio) => {
    const prioridade = remedio.dosagem
      ? remedio.dosagem.toLowerCase()
      : "baixa";
    if (remediosPorPrioridade[prioridade]) {
      remediosPorPrioridade[prioridade].push(remedio);
    } else {
      remediosPorPrioridade.baixa.push(remedio);
    }
  });

  let caresHTML = "";

  if (remediosPorPrioridade.alta.length > 0) {
    caresHTML +=
      '<h3 class="text-red-600 font-semibold text-lg mb-2">Alta</h3>';
    remediosPorPrioridade.alta.forEach((remedio) => {
      caresHTML += `<p class="text-gray-700 mb-1">${remedio.nome} → <span class="text-red-600 font-medium">${remedio.horario}</span></p>`;
    });
  }

  if (remediosPorPrioridade.media.length > 0) {
    caresHTML +=
      '<h3 class="text-orange-500 font-semibold text-lg mb-2 mt-3">Média</h3>';
    remediosPorPrioridade.media.forEach((remedio) => {
      caresHTML += `<p class="text-gray-700 mb-1">${remedio.nome} → <span class="text-orange-500 font-medium">${remedio.horario}</span></p>`;
    });
  }

  if (remediosPorPrioridade.baixa.length > 0) {
    caresHTML +=
      '<h3 class="text-green-600 font-semibold text-lg mb-2 mt-3">Baixa</h3>';
    remediosPorPrioridade.baixa.forEach((remedio) => {
      caresHTML += `<p class="text-gray-700 mb-1">${remedio.nome} → <span class="text-green-600 font-medium">${remedio.horario}</span></p>`;
    });
  }

  elderBox.innerHTML = `
    <div class="relative flex justify-between items-start mb-4">
      <img src="../assets/idoso.png" alt="" class="w-16 h-16 rounded-full">
      <img src="../assets/Subtract.png" alt="" class="w-10 h-10 cursor-pointer hover:opacity-75 transition-opacity" onclick="openEditModal(${idoso.id})">
    </div>
    <h2 class="text-2xl font-bold text-gray-800 mb-1">${idoso.nome}</h2>
    <h3 class="text-xl text-gray-600 mb-4">${idoso.idade} anos</h3>
    <div class="flex-1 mb-4">
      <h4 class="text-lg font-semibold text-gray-800 mb-3">Prioridade dos cuidados:</h4>
      <div class="text-sm">${caresHTML || '<p class="text-gray-400">Nenhum cuidado cadastrado</p>'}</div>
    </div>
    <button class="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl text-lg font-medium transition-colors mt-auto" onclick="performCare(${idoso.id})">Realizar cuidado</button>
  `;

  return elderBox;
}

function loadElderly() {
  fetch("/idosos/")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao carregar idosos");
      }
      return response.json();
    })
    .then((idosos) => {
      const container = document.getElementById("elders-container");
      if (!container) {
        console.error("Container #elders-container não encontrado!");
        return;
      }

      container.innerHTML = "";

      if (idosos.length === 0) {
        container.innerHTML =
          '<p class="text-center text-gray-500 text-lg col-span-full py-12">Nenhum idoso cadastrado ainda.</p>';
        return;
      }

      idosos.forEach((idoso) => {
        const elderBox = createElderBox(idoso);
        container.appendChild(elderBox);
      });
    })
    .catch((error) => {
      console.error("Erro:", error);
      alert("Erro ao carregar lista de idosos: " + error.message);
    });
}

let currentEditingIdoso = null;

function openEditModal(idosoId) {
  fetch(`/idosos/`)
    .then((response) => response.json())
    .then((idosos) => {
      const idoso = idosos.find((i) => i.id === idosoId);
      if (!idoso) {
        alert("Idoso não encontrado!");
        return;
      }

      currentEditingIdoso = idoso;
      populateEditModal(idoso);
      const modal = document.getElementById("edit-modal");
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    })
    .catch((error) => {
      console.error("Erro:", error);
      alert("Erro ao carregar dados do idoso");
    });
}

function closeEditModal() {
  const modal = document.getElementById("edit-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  currentEditingIdoso = null;
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("edit-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeEditModal();
      }
    });
  }
});

function populateEditModal(idoso) {
  document.getElementById("edit-nome").value = idoso.nome || "";
  document.getElementById("edit-idade").value = idoso.idade || "";
  document.getElementById("edit-data-nascimento").value =
    idoso.data_nascimento || "";

  const remediosList = document.getElementById("edit-remedios-list");
  remediosList.innerHTML = "";
  idoso.remedios.forEach((remedio, index) => {
    const item = document.createElement("div");
    item.className =
      "flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg";
    item.innerHTML = `
      <div class="flex-1">
        <strong class="text-gray-800">${remedio.nome}</strong><br>
        <span class="text-sm text-gray-600">Prioridade: ${remedio.dosagem || "Não definida"} | Horário: ${remedio.horario}</span>
      </div>
      <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors" onclick="removeRemedio(${index})">Remover</button>
    `;
    remediosList.appendChild(item);
  });

  const filhosList = document.getElementById("edit-filhos-list");
  filhosList.innerHTML = "";
  idoso.filhos.forEach((filho, index) => {
    const item = document.createElement("div");
    item.className =
      "flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg";
    item.innerHTML = `
      <div class="flex-1">
        <strong class="text-gray-800">${filho.nome}</strong><br>
        <span class="text-sm text-gray-600">Telefone: ${filho.telefone || "Não informado"}</span>
      </div>
      <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors" onclick="removeFilho(${index})">Remover</button>
    `;
    filhosList.appendChild(item);
  });

  const visitasList = document.getElementById("edit-visitas-list");
  visitasList.innerHTML = "";
  if (idoso.visitas && idoso.visitas.length > 0) {
    idoso.visitas.forEach((visita, index) => {
      const item = document.createElement("div");
      item.className =
        "flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg";
      const dataFormatada = new Date(visita.data_visita).toLocaleDateString(
        "pt-BR"
      );
      item.innerHTML = `
        <div class="flex-1">
          <strong class="text-gray-800">Data: ${dataFormatada}</strong><br>
          <span class="text-sm text-gray-600">Responsável: ${visita.responsavel || "Não informado"}</span>
        </div>
        <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors" onclick="removeVisita(${index})">Remover</button>
      `;
      visitasList.appendChild(item);
    });
  } else {
    visitasList.innerHTML =
      '<p class="text-gray-400 text-center py-3">Nenhuma visita marcada</p>';
  }
}

function showAddRemedioForm() {
  document.getElementById("add-remedio-form").style.display = "block";
  document.getElementById("new-remedio-nome").focus();
}

function cancelAddRemedio() {
  document.getElementById("add-remedio-form").style.display = "none";
  document.getElementById("new-remedio-nome").value = "";
  document.getElementById("new-remedio-prioridade").value = "baixa";
  document.getElementById("new-remedio-horario").value = "";
}

function showAddFilhoForm() {
  document.getElementById("add-filho-form").style.display = "block";
  document.getElementById("new-filho-nome").focus();
}

function cancelAddFilho() {
  document.getElementById("add-filho-form").style.display = "none";
  document.getElementById("new-filho-nome").value = "";
  document.getElementById("new-filho-telefone").value = "";
}

function showAddVisitaForm() {
  document.getElementById("add-visita-form").style.display = "block";
  document.getElementById("new-visita-data").focus();
}

function cancelAddVisita() {
  document.getElementById("add-visita-form").style.display = "none";
  document.getElementById("new-visita-data").value = "";
  document.getElementById("new-visita-responsavel").value = "";
}

function addRemedio() {
  const nome = document.getElementById("new-remedio-nome").value.trim();
  const prioridade = document.getElementById("new-remedio-prioridade").value;
  const horario = document.getElementById("new-remedio-horario").value;

  if (!nome) {
    alert("Por favor, informe o nome do remédio/cuidado");
    return;
  }

  if (!horario) {
    alert("Por favor, informe o horário");
    return;
  }

  if (!currentEditingIdoso.remedios) {
    currentEditingIdoso.remedios = [];
  }

  currentEditingIdoso.remedios.push({
    nome: nome,
    dosagem: prioridade,
    horario: horario,
  });

  populateEditModal(currentEditingIdoso);
  cancelAddRemedio();
}

function addFilho() {
  const nome = document.getElementById("new-filho-nome").value.trim();
  const telefone = document.getElementById("new-filho-telefone").value.trim();

  if (!nome) {
    alert("Por favor, informe o nome do filho");
    return;
  }

  if (!currentEditingIdoso.filhos) {
    currentEditingIdoso.filhos = [];
  }

  currentEditingIdoso.filhos.push({
    nome: nome,
    telefone: telefone || null,
  });

  populateEditModal(currentEditingIdoso);
  cancelAddFilho();
}

function addVisita() {
  const data = document.getElementById("new-visita-data").value;
  const responsavel = document
    .getElementById("new-visita-responsavel")
    .value.trim();

  if (!data) {
    alert("Por favor, informe a data da visita");
    return;
  }

  if (!currentEditingIdoso.visitas) {
    currentEditingIdoso.visitas = [];
  }

  currentEditingIdoso.visitas.push({
    data_visita: data,
    responsavel: responsavel || null,
  });

  populateEditModal(currentEditingIdoso);
  cancelAddVisita();
}

function removeRemedio(index) {
  if (currentEditingIdoso && currentEditingIdoso.remedios) {
    currentEditingIdoso.remedios.splice(index, 1);
    populateEditModal(currentEditingIdoso);
  }
}

function removeFilho(index) {
  if (currentEditingIdoso && currentEditingIdoso.filhos) {
    currentEditingIdoso.filhos.splice(index, 1);
    populateEditModal(currentEditingIdoso);
  }
}

function removeVisita(index) {
  if (currentEditingIdoso && currentEditingIdoso.visitas) {
    currentEditingIdoso.visitas.splice(index, 1);
    populateEditModal(currentEditingIdoso);
  }
}

function saveEdit() {
  if (!currentEditingIdoso) return;

  const updatedData = {
    nome: document.getElementById("edit-nome").value,
    idade: parseInt(document.getElementById("edit-idade").value) || null,
    data_nascimento:
      document.getElementById("edit-data-nascimento").value || null,
    remedios: currentEditingIdoso.remedios || [],
    filhos: currentEditingIdoso.filhos || [],
    visitas: currentEditingIdoso.visitas || [],
  };

  console.log("Dados a serem salvos:", updatedData);
  alert("Funcionalidade de edição será implementada em breve no backend!");
  closeEditModal();
}

function deleteCurrentElderly() {
  if (!currentEditingIdoso) return;

  if (!confirm(`Tem certeza que deseja excluir ${currentEditingIdoso.nome}?`)) {
    return;
  }

  fetch(`/idosos/${currentEditingIdoso.id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao excluir idoso");
      }
      alert("Idoso excluído com sucesso!");
      closeEditModal();
      loadElderly();
    })
    .catch((error) => {
      console.error("Erro:", error);
      alert("Erro ao excluir idoso");
    });
}

function performCare(idosoId) {
  alert(
    `Funcionalidade de realizar cuidado para o idoso ${idosoId} será implementada em breve.`
  );
}

loadElderly();

