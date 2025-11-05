function updateDateTime() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timeStr = `${hours}:${minutes}:${seconds}`;

  document.getElementById("time").textContent = timeStr;
  if (document.getElementById("header-time")) {
    document.getElementById("header-time").textContent = timeStr;
  }

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

let currentStep = 1;

function updateProgressSteps() {
  const steps = document.querySelectorAll(".step");
  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    const icon = step.querySelector(".step-icon");
    const label = step.querySelector(".step-label");
    const connector = step.querySelector(".step-connector");

    if (stepNumber < currentStep) {
      // Completed steps - filled sky with white icon
      icon.className =
        "step-icon w-12 h-12 md:w-14 md:h-14 rounded-full bg-sky-800 border-[3px] border-sky-800 flex items-center justify-center z-10 mb-2";
      icon.querySelector("img").className = "w-6 h-6 brightness-0 invert";
      label.className =
        "step-label text-xs md:text-sm text-gray-700 text-center";
      if (connector) {
        connector.className =
          "step-connector absolute top-6 left-1/2 w-20 md:w-40 h-[3px] bg-sky-800";
      }
    } else if (stepNumber === currentStep) {
      // Active step - filled sky with white icon
      icon.className =
        "step-icon w-12 h-12 md:w-14 md:h-14 rounded-full bg-sky-800 border-[3px] border-sky-800 flex items-center justify-center z-10 mb-2";
      icon.querySelector("img").className = "w-6 h-6 brightness-0 invert";
      label.className =
        "step-label text-xs md:text-sm text-sky-800 font-semibold text-center";
      if (connector) {
        connector.className =
          "step-connector absolute top-6 left-1/2 w-20 md:w-40 h-[3px] bg-gray-300";
      }
    } else {
      // Future steps - white background with gray border
      icon.className =
        "step-icon w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border-[3px] border-gray-300 flex items-center justify-center z-10 mb-2";
      icon.querySelector("img").className = "w-6 h-6 brightness-0 opacity-60";
      label.className =
        "step-label text-xs md:text-sm text-gray-500 text-center";
      if (connector) {
        connector.className =
          "step-connector absolute top-6 left-1/2 w-20 md:w-40 h-[3px] bg-gray-300";
      }
    }
  });
}

function nextStep(stepNumber) {
  document.getElementById(`step${currentStep}`).style.display = "none";
  currentStep = stepNumber;
  document.getElementById(`step${currentStep}`).style.display = "block";
  updateProgressSteps();

  if (stepNumber === 4) {
    showConfirmation();
  }
}

function prevStep(stepNumber) {
  document.getElementById(`step${currentStep}`).style.display = "none";
  currentStep = stepNumber;
  document.getElementById(`step${currentStep}`).style.display = "block";
  updateProgressSteps();
}

function addChildForm() {
  const container = document.getElementById("children-container");
  const newForm = document.createElement("div");
  newForm.className =
    "child-form-group bg-gray-50 p-6 rounded-lg space-y-4 border-2 border-gray-200";
  newForm.innerHTML = `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Filho <span class="text-red-600">*</span></label>
      <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all child-name" placeholder="Digite o nome completo do filho">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Telefone <span class="text-red-600">*</span></label>
      <input type="tel" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all child-phone" placeholder="Digite o telefone do filho">
    </div>
  `;
  container.appendChild(newForm);
}

function addCareForm() {
  const container = document.getElementById("cares-container");
  const newForm = document.createElement("div");
  newForm.className =
    "child-form-group bg-gray-50 p-6 rounded-lg space-y-4 border-2 border-gray-200";
  newForm.innerHTML = `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Medicamento/Cuidado <span class="text-red-600">*</span></label>
      <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all care-name" placeholder="Ex: Paracetamol, Caminhada, etc.">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Horário <span class="text-red-600">*</span></label>
      <input type="time" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all care-time">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Prioridade <span class="text-red-600">*</span></label>
      <select class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all care-priority">
        <option value="">Selecione a prioridade</option>
        <option value="alta">Alta</option>
        <option value="media">Média</option>
        <option value="baixa">Baixa</option>
      </select>
    </div>
  `;
  container.appendChild(newForm);
}

function showConfirmation() {
  const elderlyName = document.getElementById("elderly-name").value;
  const elderlyAge = document.getElementById("elderly-age").value;
  const elderlyBirth = document.getElementById("elderly-birth").value;

  document.getElementById("elderly-info-confirm").innerHTML = `
    <p class="text-sm"><span class="font-semibold">Nome:</span> ${elderlyName}</p>
    <p class="text-sm"><span class="font-semibold">Idade:</span> ${elderlyAge} anos</p>
    <p class="text-sm"><span class="font-semibold">Data de Nascimento:</span> ${elderlyBirth}</p>
  `;

  const childNames = document.querySelectorAll(".child-name");
  const childPhones = document.querySelectorAll(".child-phone");
  let childrenHTML = "";

  childNames.forEach((nameInput, index) => {
    if (nameInput.value) {
      childrenHTML += `
        <p class="text-sm"><span class="font-semibold">Filho ${index + 1}:</span> ${nameInput.value} - Tel: ${childPhones[index].value}</p>
      `;
    }
  });
  document.getElementById("children-confirm").innerHTML =
    childrenHTML ||
    "<p class='text-sm text-gray-500'>Nenhum filho cadastrado</p>";

  const careNames = document.querySelectorAll(".care-name");
  const careTimes = document.querySelectorAll(".care-time");
  const carePriorities = document.querySelectorAll(".care-priority");
  let caresHTML = "";

  careNames.forEach((nameInput, index) => {
    if (nameInput.value) {
      const priority = carePriorities[index].value;
      const priorityClass =
        priority === "alta"
          ? "text-red-600 font-semibold"
          : priority === "media"
            ? "text-orange-500 font-semibold"
            : "text-green-600 font-semibold";
      caresHTML += `
        <p class="text-sm"><span class="font-semibold">${nameInput.value}</span> - <span class="${priorityClass}">${careTimes[index].value}</span> (Prioridade: ${priority})</p>
      `;
    }
  });
  document.getElementById("cares-confirm").innerHTML =
    caresHTML ||
    "<p class='text-sm text-gray-500'>Nenhum cuidado cadastrado</p>";
}

function submitForm() {
  const elderlyName = document.getElementById("elderly-name").value;
  const elderlyAge = document.getElementById("elderly-age").value;
  const elderlyBirth = document.getElementById("elderly-birth").value;

  const childNames = document.querySelectorAll(".child-name");
  const childPhones = document.querySelectorAll(".child-phone");
  const filhos = [];

  childNames.forEach((nameInput, index) => {
    if (nameInput.value) {
      filhos.push({
        nome: nameInput.value,
        telefone: childPhones[index].value,
      });
    }
  });

  const careNames = document.querySelectorAll(".care-name");
  const careTimes = document.querySelectorAll(".care-time");
  const carePriorities = document.querySelectorAll(".care-priority");
  const remedios = [];

  careNames.forEach((nameInput, index) => {
    if (nameInput.value && careTimes[index].value) {
      remedios.push({
        nome: nameInput.value,
        horario: careTimes[index].value,
        dosagem: carePriorities[index].value,
      });
    }
  });

  const data = {
    nome: elderlyName,
    idade: parseInt(elderlyAge),
    data_nascimento: elderlyBirth,
    filhos: filhos,
    remedios: remedios,
  };

  console.log("Dados enviados:", JSON.stringify(data, null, 2));

  fetch("/idosos/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro do servidor:", errorData);
        throw new Error(JSON.stringify(errorData));
      }
      return response.json();
    })
    .then((data) => {
      alert("Cadastro finalizado com sucesso!");
      console.log("Idoso cadastrado:", data);
      window.location.href = "/static/pages/elderly_elders.html";
    })
    .catch((error) => {
      console.error("Erro completo:", error);
      alert(
        "Erro ao cadastrar idoso. Verifique os dados e tente novamente.\n\nDetalhes: " +
          error.message
      );
    });
}

