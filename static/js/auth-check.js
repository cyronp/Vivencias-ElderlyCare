// Verificar se o usuário está logado
function checkAuth() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const currentPath = window.location.pathname;

  // Se não está logado e não está na página de login, redirecionar
  if (!isLoggedIn || isLoggedIn !== "true") {
    if (
      !currentPath.includes("index.html") &&
      currentPath !== "/static/" &&
      currentPath !== "/"
    ) {
      window.location.href = "/static/index.html";
    }
  }
}

// Atualizar nome do usuário no header
function updateUsername() {
  const username = localStorage.getItem("username") || "Usuário";
  const usernameElement = document.getElementById("username-display");
  if (usernameElement) {
    usernameElement.textContent = username;
  }
}

// Verificar autenticação ao carregar a página
checkAuth();
updateUsername();

// Função para fazer logout
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("username");
  window.location.href = "/static/index.html";
}
