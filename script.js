
  // ---------- SIDEBAR & MOBILE UPDATE MODALS ----------

  /* ================== TOGGLE DA SIDEBAR ================== */
  const toggleBtn = document.getElementById("toggle-sidebar");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
  });
  document.querySelectorAll(".menu li a").forEach(link => {
    link.addEventListener("click", function () {
      if (window.innerWidth < 768) {
        sidebar.classList.add("collapsed");
        mainContent.classList.add("expanded");
      }
    });
  });

