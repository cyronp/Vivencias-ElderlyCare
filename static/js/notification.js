
function showNotification(message, type = "info", duration = 3000) {
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    container.className =
      "fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md";
    document.body.appendChild(container);
  }

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-sky-500",
  };

  // Ícones por tipo
  const icons = {
    success: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>`,
    error: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>`,
    warning: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
    </svg>`,
    info: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>`,
  };

  // Criar notificação
  const notification = document.createElement("div");
  notification.className = `${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 transform transition-all duration-300 translate-x-full opacity-0`;
  notification.innerHTML = `
    <div class="flex-shrink-0">
      ${icons[type]}
    </div>
    <div class="flex-1 text-sm font-medium">
      ${message}
    </div>
    <button class="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors" onclick="this.parentElement.remove()">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;

  container.appendChild(notification);

  // Animar entrada
  setTimeout(() => {
    notification.classList.remove("translate-x-full", "opacity-0");
  }, 10);

  // Remover após duração
  if (duration > 0) {
    setTimeout(() => {
      notification.classList.add("translate-x-full", "opacity-0");
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
}

// Função para confirmação personalizada
function showConfirm(message, onConfirm, onCancel = null) {
  // Criar overlay
  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4";
  overlay.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-95 opacity-0">
      <div class="flex items-start gap-4 mb-6">
        <div class="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmação</h3>
          <p class="text-gray-600">${message}</p>
        </div>
      </div>
      <div class="flex gap-3 justify-end">
        <button class="cancel-btn px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
          Cancelar
        </button>
        <button class="confirm-btn px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors">
          Confirmar
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const dialog = overlay.querySelector("div");
  const confirmBtn = overlay.querySelector(".confirm-btn");
  const cancelBtn = overlay.querySelector(".cancel-btn");

  // Animar entrada
  setTimeout(() => {
    dialog.classList.remove("scale-95", "opacity-0");
  }, 10);

  // Função para fechar
  const close = (confirmed) => {
    dialog.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      overlay.remove();
      if (confirmed && onConfirm) onConfirm();
      else if (!confirmed && onCancel) onCancel();
    }, 200);
  };

  // Event listeners
  confirmBtn.addEventListener("click", () => close(true));
  cancelBtn.addEventListener("click", () => close(false));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close(false);
  });
}

// Função para prompt personalizado
function showPrompt(message, defaultValue = "", onConfirm, onCancel = null) {
  // Criar overlay
  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4";
  overlay.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-95 opacity-0">
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">${message}</h3>
        <input type="text" value="${defaultValue}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" />
      </div>
      <div class="flex gap-3 justify-end">
        <button class="cancel-btn px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
          Cancelar
        </button>
        <button class="confirm-btn px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors">
          Confirmar
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const dialog = overlay.querySelector("div");
  const input = overlay.querySelector("input");
  const confirmBtn = overlay.querySelector(".confirm-btn");
  const cancelBtn = overlay.querySelector(".cancel-btn");

  // Animar entrada e focar input
  setTimeout(() => {
    dialog.classList.remove("scale-95", "opacity-0");
    input.focus();
    input.select();
  }, 10);

  // Função para fechar
  const close = (confirmed) => {
    dialog.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      overlay.remove();
      if (confirmed && onConfirm) onConfirm(input.value);
      else if (!confirmed && onCancel) onCancel();
    }, 200);
  };

  // Event listeners
  confirmBtn.addEventListener("click", () => close(true));
  cancelBtn.addEventListener("click", () => close(false));
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") close(true);
    if (e.key === "Escape") close(false);
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close(false);
  });
}
