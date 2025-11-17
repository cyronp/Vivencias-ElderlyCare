// Profile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const profileMenuButton = document.getElementById("profile-menu-button");
  const profileMenu = document.getElementById("profile-menu");

  if (profileMenuButton && profileMenu) {
    profileMenuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (
        !profileMenu.contains(e.target) &&
        !profileMenuButton.contains(e.target)
      ) {
        profileMenu.classList.add("hidden");
      }
    });
  }

  // Adicionar funcionalidade de logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Deseja realmente sair?")) {
        logout();
      }
    });
  }
});
