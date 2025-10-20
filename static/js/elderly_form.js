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
    step.classList.remove("active", "completed");

    if (stepNumber < currentStep) {
      step.classList.add("completed");
    } else if (stepNumber === currentStep) {
      step.classList.add("active");
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
  newForm.className = "child-form-group";
  newForm.innerHTML = `
    <div class="form-group">
      <label class="form-label">Nome do Filho <span class="required">*</span></label>
      <input type="text" class="form-input child-name" placeholder="Digite o nome completo do filho">
    </div>
    <div class="form-group">
      <label class="form-label">Telefone <span class="required">*</span></label>
      <input type="tel" class="form-input child-phone" placeholder="Digite o telefone do filho">
    </div>
  `;
  container.appendChild(newForm);
}

function addCareForm() {
  const container = document.getElementById("cares-container");
  const newForm = document.createElement("div");
  newForm.className = "child-form-group";
  newForm.innerHTML = `
    <div class="form-group">
      <label class="form-label">Nome do Medicamento/Cuidado <span class="required">*</span></label>
      <input type="text" class="form-input care-name" placeholder="Ex: Paracetamol, Caminhada, etc.">
    </div>
    <div class="form-group">
      <label class="form-label">Horário <span class="required">*</span></label>
      <input type="time" class="form-input care-time">
    </div>
    <div class="form-group">
      <label class="form-label">Prioridade <span class="required">*</span></label>
      <select class="form-input care-priority">
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
    <p><strong>Nome:</strong> ${elderlyName}</p>
    <p><strong>Idade:</strong> ${elderlyAge} anos</p>
    <p><strong>Data de Nascimento:</strong> ${elderlyBirth}</p>
  `;

  const childNames = document.querySelectorAll(".child-name");
  const childPhones = document.querySelectorAll(".child-phone");
  let childrenHTML = "";

  childNames.forEach((nameInput, index) => {
    if (nameInput.value) {
      childrenHTML += `
        <p><strong>Filho ${index + 1}:</strong> ${nameInput.value} - Tel: ${childPhones[index].value}</p>
      `;
    }
  });
  document.getElementById("children-confirm").innerHTML =
    childrenHTML || "<p>Nenhum filho cadastrado</p>";

  const careNames = document.querySelectorAll(".care-name");
  const careTimes = document.querySelectorAll(".care-time");
  const carePriorities = document.querySelectorAll(".care-priority");
  let caresHTML = "";

  careNames.forEach((nameInput, index) => {
    if (nameInput.value) {
      const priority = carePriorities[index].value;
      const priorityClass =
        priority === "alta"
          ? "high-priority"
          : priority === "media"
            ? "medium-priority"
            : "low-priority";
      caresHTML += `
        <p><strong>${nameInput.value}</strong> - <span class="${priorityClass}">${careTimes[index].value}</span> (Prioridade: ${priority})</p>
      `;
    }
  });
  document.getElementById("cares-confirm").innerHTML =
    caresHTML || "<p>Nenhum cuidado cadastrado</p>";
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
