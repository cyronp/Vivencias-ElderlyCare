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

function formatTime(timeString) {
  if (!timeString) return "";
  return timeString.substring(0, 5);
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
      caresHTML += `<p class="text-gray-700 mb-1">${remedio.nome} → <span class="text-red-600 font-medium">${formatTime(remedio.horario)}</span></p>`;
    });
  }

  if (remediosPorPrioridade.media.length > 0) {
    caresHTML +=
      '<h3 class="text-orange-500 font-semibold text-lg mb-2 mt-3">Média</h3>';
    remediosPorPrioridade.media.forEach((remedio) => {
      caresHTML += `<p class="text-gray-700 mb-1">${remedio.nome} → <span class="text-orange-500 font-medium">${formatTime(remedio.horario)}</span></p>`;
    });
  }

  if (remediosPorPrioridade.baixa.length > 0) {
    caresHTML +=
      '<h3 class="text-green-600 font-semibold text-lg mb-2 mt-3">Baixa</h3>';
    remediosPorPrioridade.baixa.forEach((remedio) => {
      caresHTML += `<p class="text-gray-700 mb-1">${remedio.nome} → <span class="text-green-600 font-medium">${formatTime(remedio.horario)}</span></p>`;
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
    <button class="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl text-lg cursor-pointer font-medium transition-colors mt-auto" onclick="performCare(${idoso.id})">Realizar cuidado</button>
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
      console.error("Error:", error);
      showNotification(
        "Erro ao carregar lista de idosos: " + error.message,
        "error"
      );
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
        <span class="text-sm text-gray-600">Prioridade: ${remedio.dosagem || "Não definida"} | Horário: ${formatTime(remedio.horario)}</span>
      </div>
      <button class="bg-red-500 hover:bg-red-600 cursor-pointer
       text-white px-3 py-1 rounded-lg text-sm transition-colors" onclick="removeRemedio(${index})">Remover</button>
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
      <button class="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-3 py-1 rounded-lg text-sm transition-colors" onclick="removeFilho(${index})">Remover</button>
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
        <button class="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-3 py-1 rounded-lg text-sm transition-colors" onclick="removeVisita(${index})">Remover</button>
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
    showNotification("Por favor, informe o nome do remédio/cuidado", "warning");
    return;
  }

  if (!horario) {
    showNotification("Por favor, informe o horário", "warning");
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
    showNotification("Por favor, informe o nome do filho", "warning");
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
    showNotification("Por favor, informe a data da visita", "warning");
    return;
  }

  if (!currentEditingIdoso || !currentEditingIdoso.id) {
    showNotification("Erro: Idoso não identificado", "error");
    return;
  }

  // Salvar visita diretamente no backend
  fetch(`/visitas/${currentEditingIdoso.id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data_visita: data,
      responsavel: responsavel || null,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao registrar visita");
      }
      return response.json();
    })
    .then((novaVisita) => {
      // Adicionar visita à lista local
      if (!currentEditingIdoso.visitas) {
        currentEditingIdoso.visitas = [];
      }
      currentEditingIdoso.visitas.push(novaVisita);

      // Atualizar modal
      populateEditModal(currentEditingIdoso);
      cancelAddVisita();
      showNotification("Visita registrada com sucesso!", "success");
    })
    .catch((error) => {
      console.error("Erro:", error);
      showNotification("Erro ao registrar visita. Tente novamente.", "error");
    });
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
  if (!currentEditingIdoso || !currentEditingIdoso.visitas) return;

  const visita = currentEditingIdoso.visitas[index];

  if (!visita || !visita.id) {
    showNotification("Erro: Visita não encontrada", "error");
    return;
  }

  showConfirm("Tem certeza que deseja remover esta visita?", () => {
    // Deletar visita no backend
    fetch(`/visitas/${visita.id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao deletar visita");
        }
        return response.json();
      })
      .then(() => {
        // Remover da lista local
        currentEditingIdoso.visitas.splice(index, 1);
        populateEditModal(currentEditingIdoso);
        showNotification("Visita removida com sucesso!", "success");
      })
      .catch((error) => {
        console.error("Erro:", error);
        showNotification("Erro ao remover visita. Tente novamente.", "error");
      });
  });
}

function saveEdit() {
  if (!currentEditingIdoso) return;

  const updatedData = {
    nome: document.getElementById("edit-nome").value,
    idade: parseInt(document.getElementById("edit-idade").value) || null,
    data_nascimento:
      document.getElementById("edit-data-nascimento").value || null,
  };

  // Validação básica
  if (!updatedData.nome || updatedData.nome.trim() === "") {
    showNotification("O nome é obrigatório!", "warning");
    return;
  }

  fetch(`/idosos/${currentEditingIdoso.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao atualizar idoso");
      }
      return response.json();
    })
    .then((data) => {
      showNotification("Idoso atualizado com sucesso!", "success");
      closeEditModal();
      loadElderly();
    })
    .catch((error) => {
      console.error("Erro:", error);
      showNotification("Erro ao atualizar idoso", "error");
    });
}

function deleteCurrentElderly() {
  if (!currentEditingIdoso) return;

  showConfirm(
    `Tem certeza que deseja excluir ${currentEditingIdoso.nome}?`,
    () => {
      fetch(`/idosos/${currentEditingIdoso.id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erro ao excluir idoso");
          }
          showNotification("Idoso excluído com sucesso!", "success");
          closeEditModal();
          loadElderly();
        })
        .catch((error) => {
          console.error("Erro ao excluir:", error);
          showNotification("Erro ao excluir idoso", "error");
        });
    }
  );
}

let currentCareIdoso = null;

async function performCare(idosoId) {
  currentCareIdoso = idosoId;

  try {
    const idosoResponse = await fetch(`/idosos/${idosoId}`);
    if (!idosoResponse.ok) throw new Error("Erro ao buscar idoso");
    const idoso = await idosoResponse.json();

    const hoje = new Date().toISOString().split("T")[0];
    const prontResponse = await fetch("/prontuarios/hoje");
    if (!prontResponse.ok) throw new Error("Erro ao buscar prontuários");
    const prontuarios = await prontResponse.json();

    const cuidadosPendentes = prontuarios.filter(
      (p) => p.idoso_id === idosoId && p.status === "pendente"
    );

    document.getElementById("care-idoso-nome").textContent = idoso.nome;

    const careList = document.getElementById("care-list");
    const emptyState = document.getElementById("care-empty-state");

    if (cuidadosPendentes.length === 0) {
      careList.innerHTML = "";
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");
      careList.innerHTML = cuidadosPendentes
        .map(
          (cuidado) => `
        <div class="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-sky-300 transition-colors">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-800 text-lg">${cuidado.remedio_nome}</h4>
              <p class="text-sm text-gray-600 mt-1">
                <span class="font-medium">Horário Previsto:</span> ${formatTime(cuidado.horario_previsto)}
              </p>
              ${cuidado.remedio_dosagem ? `<p class="text-sm text-gray-500 mt-1">Dosagem: ${cuidado.remedio_dosagem}</p>` : ""}
            </div>
            <button
              onclick="markCareAsDone(${cuidado.id}, '${cuidado.remedio_nome}')"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ml-4"
            >
              ✓ Concluir
            </button>
          </div>
        </div>
      `
        )
        .join("");
    }

    document.getElementById("care-modal").classList.remove("hidden");
    document.getElementById("care-modal").classList.add("flex");
  } catch (error) {
    console.error("Erro:", error);
    showNotification("Erro ao carregar cuidados do idoso", "error");
  }
}

function closeCareModal() {
  document.getElementById("care-modal").classList.add("hidden");
  document.getElementById("care-modal").classList.remove("flex");
  currentCareIdoso = null;
}

async function markCareAsDone(prontuarioId, remedioNome) {
  showConfirm(`Marcar "${remedioNome}" como concluído?`, async () => {
    try {
      const now = new Date();
      const horarioRealizado = now.toISOString();

      const response = await fetch(`/prontuarios/${prontuarioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "concluido",
          horario_realizado: horarioRealizado,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Erro do servidor:", errorData);
        throw new Error("Erro ao atualizar prontuário");
      }

      const horarioExibir = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      showNotification(
        `"${remedioNome}" marcado como concluído às ${horarioExibir}!`,
        "success"
      );

      if (currentCareIdoso) {
        await performCare(currentCareIdoso);
      }
    } catch (error) {
      console.error("Erro:", error);
      showNotification(
        "Erro ao marcar cuidado como concluído: " + error.message,
        "error"
      );
    }
  });
}

loadElderly();
