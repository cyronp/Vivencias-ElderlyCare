class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.checkInterval = 30000;
    this.alertMinutesBefore = 5;
    this.notifiedIds = new Set();
    this.init();
  }

  // Função helper para formatar horário (HH:MM)
  formatTime(timeString) {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  }

  init() {
    this.requestPermission();
    this.startChecking();
    this.setupNotificationIcon();
  }

  requestPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  setupNotificationIcon() {
    const notificationIcon = document.querySelector(".notification-icon");
    if (notificationIcon) {
      notificationIcon.addEventListener("click", () => {
        this.showNotificationPanel();
      });
    }
  }

  async checkUpcomingCares() {
    try {
      const response = await fetch("/prontuarios/hoje");
      if (!response.ok) return;

      const prontuarios = await response.json();
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      prontuarios.forEach((prontuario) => {
        if (prontuario.status === "pendente") {
          const timeParts = prontuario.horario_previsto.split(":");
          const hours = parseInt(timeParts[0], 10);
          const minutes = parseInt(timeParts[1], 10);
          const scheduledTime = hours * 60 + minutes;
          const timeDiff = scheduledTime - currentTime;

          if (timeDiff >= 0 && timeDiff <= this.alertMinutesBefore) {
            const notificationKey = `${prontuario.id}-${prontuario.horario_previsto}`;
            if (!this.notifiedIds.has(notificationKey)) {
              this.sendNotification(prontuario);
              this.notifiedIds.add(notificationKey);
              this.addToNotificationList(prontuario);
            }
          }

          if (timeDiff < 0 && timeDiff > -60) {
            const notificationKey = `late-${prontuario.id}-${prontuario.horario_previsto}`;
            if (!this.notifiedIds.has(notificationKey)) {
              this.sendLateNotification(prontuario);
              this.notifiedIds.add(notificationKey);
              this.addToNotificationList(prontuario, true);
            }
          }
        }
      });

      this.updateNotificationBadge();
    } catch (error) {
      console.error("Erro ao verificar cuidados:", error);
    }
  }

  sendNotification(prontuario) {
    const title = "⏰ Horário de Cuidado";
    const body = `${prontuario.idoso_nome}: ${prontuario.remedio_nome} às ${this.formatTime(prontuario.horario_previsto)}`;

    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: body,
        icon: "/static/assets/bell.svg",
        badge: "/static/assets/elderly_icon.png",
        tag: `care-${prontuario.id}`,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = "/static/pages/prontuarios.html";
        notification.close();
      };
    }

    this.showVisualAlert(title, body, "info");
  }

  sendLateNotification(prontuario) {
    const title = "⚠️ Cuidado Atrasado";
    const body = `${prontuario.idoso_nome}: ${prontuario.remedio_nome} - Horário: ${this.formatTime(prontuario.horario_previsto)}`;

    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: body,
        icon: "/static/assets/bell.svg",
        badge: "/static/assets/elderly_icon.png",
        tag: `late-care-${prontuario.id}`,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = "/static/pages/prontuarios.html";
        notification.close();
      };
    }

    this.showVisualAlert(title, body, "warning");
  }

  showVisualAlert(title, message, type = "info") {
    const alertDiv = document.createElement("div");
    alertDiv.className = `fixed top-20 right-4 z-[60] bg-white rounded-lg shadow-2xl p-4 max-w-sm border-l-4 ${
      type === "warning" ? "border-yellow-500" : "border-sky-500"
    } animate-slide-in`;

    alertDiv.innerHTML = `
      <div class="flex items-start gap-3">
        <img src="/static/assets/bell.svg" alt="Notificação" class="w-8 h-8 ${
          type === "warning" ? "brightness-0" : "brightness-0"
        }">
        <div class="flex-1">
          <h4 class="font-bold text-gray-800 mb-1">${title}</h4>
          <p class="text-sm text-gray-600">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
      alertDiv.remove();
    }, 10000);
  }

  addToNotificationList(prontuario, isLate = false) {
    this.notifications.unshift({
      id: prontuario.id,
      idoso: prontuario.idoso_nome,
      remedio: prontuario.remedio_nome,
      horario: prontuario.horario_previsto,
      isLate: isLate,
      timestamp: new Date(),
    });

    if (this.notifications.length > 20) {
      this.notifications = this.notifications.slice(0, 20);
    }
  }

  updateNotificationBadge() {
    const badge = document.querySelector(".notification-badge");
    const pendingCount = this.notifications.filter((n) => !n.read).length;

    if (badge && pendingCount > 0) {
      badge.textContent = pendingCount > 9 ? "9+" : pendingCount;
      badge.classList.remove("hidden");
      badge.classList.add("flex");
    } else if (badge) {
      badge.classList.add("hidden");
      badge.classList.remove("flex");
    }
  }

  showNotificationPanel() {
    const panel = document.getElementById("notification-panel");
    if (!panel) {
      this.createNotificationPanel();
    } else {
      panel.classList.toggle("hidden");
    }
    this.renderNotifications();
  }

  createNotificationPanel() {
    const panel = document.createElement("div");
    panel.id = "notification-panel";
    panel.className =
      "fixed top-20 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl z-[60] max-h-[70vh] flex flex-col";

    panel.innerHTML = `
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-800">Notificações</h3>
        <button onclick="notificationSystem.closeNotificationPanel()" class="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
      <div id="notification-list" class="overflow-y-auto flex-1 p-4"></div>
      <div class="p-3 border-t border-gray-200 flex gap-2">
        <button onclick="notificationSystem.clearAllNotifications()" class="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded transition-colors">
          Limpar Todas
        </button>
        <button onclick="window.location.href='/static/pages/prontuarios.html'" class="flex-1 text-sm bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded transition-colors">
          Ver Prontuários
        </button>
      </div>
    `;

    document.body.appendChild(panel);
  }

  renderNotifications() {
    const list = document.getElementById("notification-list");
    if (!list) return;

    if (this.notifications.length === 0) {
      list.innerHTML = `
        <div class="text-center py-8 text-gray-400">
          <img src="/static/assets/bell.svg" alt="Sem notificações" class="w-16 h-16 mx-auto mb-3 opacity-30">
          <p>Nenhuma notificação</p>
        </div>
      `;
      return;
    }

    list.innerHTML = this.notifications
      .map(
        (notif, index) => `
      <div class="mb-3 p-3 rounded-lg ${notif.isLate ? "bg-yellow-50 border border-yellow-200" : "bg-sky-50 border border-sky-200"}">
        <div class="flex items-start gap-2">
          <div class="flex-1">
            <p class="font-semibold text-gray-800">${notif.idoso}</p>
            <p class="text-sm text-gray-600">${notif.remedio}</p>
            <p class="text-xs text-gray-500 mt-1">
              ${notif.isLate ? "Atrasado - " : ""}Horário: ${notif.horario}
            </p>
          </div>
          <button onclick="notificationSystem.removeNotification(${index})" class="text-gray-400 hover:text-gray-600 text-sm">
            ✕
          </button>
        </div>
      </div>
    `
      )
      .join("");
  }

  closeNotificationPanel() {
    const panel = document.getElementById("notification-panel");
    if (panel) {
      panel.classList.add("hidden");
    }
  }

  removeNotification(index) {
    this.notifications.splice(index, 1);
    this.renderNotifications();
    this.updateNotificationBadge();
  }

  clearAllNotifications() {
    this.notifications = [];
    this.renderNotifications();
    this.updateNotificationBadge();
  }

  startChecking() {
    this.checkUpcomingCares();

    setInterval(() => {
      this.checkUpcomingCares();
    }, this.checkInterval);
  }

  forceCheck() {
    this.checkUpcomingCares();
  }
}

let notificationSystem;
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    notificationSystem = new NotificationSystem();
  });
} else {
  notificationSystem = new NotificationSystem();
}

// Adiciona estilo para animação
const style = document.createElement("style");
style.textContent = `
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
`;
document.head.appendChild(style);

window.checkNotifications = () => {
  if (notificationSystem) {
    notificationSystem.forceCheck();
  }
};

window.showNotificationPanel = () => {
  if (notificationSystem) {
    notificationSystem.showNotificationPanel();
  }
};

window.clearNotifiedIds = () => {
  if (notificationSystem) {
    notificationSystem.notifiedIds.clear();
  }
};
