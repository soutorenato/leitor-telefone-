document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM carregado.");

  // Variável global para armazenar o modal anterior (usada para o QR Code).
  let previousModal = null;
  // Global: "" significa visualização completa; ou "Venda", "Pipeline" ou "Lead".
  let currentFilter = "";

  // Inject custom style
  const customStyle = document.createElement("style");
  customStyle.innerHTML = `
    .btn-select.btn-primary:hover {
      background-color: #0d6efd !important;
      border-color: #0d6efd !important;
      color: #fff !important;
    }
    /* WhatsApp Modal styling */
    .whatsapp-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 11000;
    }
    .whatsapp-modal-content {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      position: relative;
    }
    .whatsapp-modal-close {
      position: absolute;
      top: 8px;
      right: 8px;
      cursor: pointer;
      font-weight: bold;
    }
  `;
  document.head.appendChild(customStyle);

  // ----------------- Helper Functions -----------------
  // Formata a coluna "Qtde/Valor" na tabela.
  // Se o produto for especial, retorna "1"; senão, formata o número para pt-BR.
  function formatQuantidadeValor(val, produto) {
    const specialProducts = ["Abertura de Conta", "Cartão Novo", "Cartão Upgrade", "Open Finance"];
    if (specialProducts.includes(produto)) {
      return "1";
    } else {
      const num = Number(val);
      return isNaN(num) ? val : num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }

  // Recupera os registros do localStorage.
  function getSalesData() {
    return JSON.parse(localStorage.getItem("vendasData")) || [];
  }
  // Salva os registros no localStorage.
  function saveSalesData(salesArray) {
    localStorage.setItem("vendasData", JSON.stringify(salesArray));
    console.log("✅ Dados salvos no localStorage.");
  }

  // ----------------- Modal de Vendas (Table Modal) -----------------
  if (!document.getElementById("vendaModal")) {
    const vendaModalHTML = `
      <div id="vendaModal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
          <button id="closeVendaModal" class="close-modal">X</button>
          <h2>Produtividade</h2>
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>ATENDIMENTO</th>
                  <th>NOME</th>
                  <th>CPF</th>
                  <th>EMAIL</th>
                  <th>WHATSAPP</th>
                  <th>PRODUTO</th>
                  <th>QTDE/VALOR</th>
                  <th>DATA</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", vendaModalHTML);
  }
  const vendaModal = document.getElementById("vendaModal");
  window.addEventListener("click", function (event) {
    if (event.target === vendaModal) {
      vendaModal.style.display = "none";
    }
  });
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      vendaModal.style.display = "none";
      closeWhatsappModal();
    }
  });
  document.getElementById("closeVendaModal").addEventListener("click", () => {
    vendaModal.style.display = "none";
  });

  // ----------------- Modal de Produção (Form Modal) -----------------
  if (!document.getElementById("addProductModal")) {
    const productionModalHTML = `
      <div class="modal fade" id="addProductModal" tabindex="-1" aria-hidden="true" style="z-index:10000;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Novo Atendimento</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              <form id="productionForm">
                <input type="hidden" id="editingIndex" value="">
                <div class="mb-2 row align-items-center">
                  <label class="col-3 col-form-label">Atendimento</label>
                  <div class="col-9">
                    <select class="form-control" id="tipoAtendimento" required>
                      <option value="">Selecione</option>
                      <option value="Venda">Venda</option>
                      <option value="Pipeline">Pipeline</option>
                      <option value="Lead">Lead</option>
                    </select>
                  </div>
                </div>
                <div class="mb-2 row align-items-center">
                  <label class="col-3 col-form-label">Nome</label>
                  <div class="col-9">
                    <input type="text" class="form-control" id="nome" required>
                  </div>
                </div>
                <div class="mb-2 row align-items-center">
                  <label class="col-3 col-form-label">CPF</label>
                  <div class="col-9">
                    <input type="text" class="form-control" id="cpf" required placeholder="000.000.000-00">
                  </div>
                </div>
                <div class="mb-2 row align-items-center">
                  <label class="col-3 col-form-label">Email</label>
                  <div class="col-9">
                    <input type="email" class="form-control" id="email" required>
                  </div>
                </div>
                <div class="mb-2 row align-items-center">
                  <label class="col-3 col-form-label">Whatsapp</label>
                  <div class="col-9">
                    <input type="text" class="form-control" id="whatsapp" required placeholder="(11) 99999-9999">
                  </div>
                </div>
                <div class="mb-2 row align-items-center">
                  <label class="col-3 col-form-label">Produto</label>
                  <div class="col-9">
                    <select class="form-control" id="produto" required>
                      <option value="">Selecione um produto</option>
                      <option value="Abertura de Conta">Abertura de Conta</option>
                      <option value="Câmbio">Câmbio</option>
                      <option value="Captação Líquida">Captação Líquida</option>
                      <option value="Cartão Novo">Cartão Novo</option>
                      <option value="Cartão Upgrade">Cartão Upgrade</option>
                      <option value="COE">COE</option>
                      <option value="Consórcio">Consórcio</option>
                      <option value="Crédito Imobiliário">Crédito Imobiliário</option>
                      <option value="Crédito Pessoal">Crédito Pessoal</option>
                      <option value="Crédito Pessoal Com Garantia">Crédito Pessoal Com Garantia</option>
                      <option value="Crédito Pessoal Preventivo">Crédito Pessoal Preventivo</option>
                      <option value="Open Finance">Open Finance</option>
                      <option value="Parcelamento de Fatura">Parcelamento de Fatura</option>
                      <option value="Previdência">Previdência</option>
                      <option value="Seguro Auto">Seguro Auto</option>
                      <option value="Seguro Casa">Seguro Casa</option>
                      <option value="Seguro Demais">Seguro Demais</option>
                      <option value="Seguro Vida">Seguro Vida</option>
                      <option value="Use Casa">Use Casa</option>
                    </select>
                  </div>
                </div>
                <div class="mb-2 row align-items-center">
                  <label class="col-3 col-form-label">Qtde/Valor</label>
                  <div class="col-9">
                    <input type="text" class="form-control" id="quantidadeValor" required>
                  </div>
                </div>
                <div class="mb-2 row align-items-center">
                  <label class="col-3 col-form-label">Data</label>
                  <div class="col-9">
                    <input type="date" class="form-control" id="data" required>
                  </div>
                </div>
                <div class="d-flex justify-content-end mt-3">
                  <button type="submit" class="btn btn-primary me-2">
                    <i class="ri-save-line"></i> Salvar
                  </button>
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="ri-close-circle-line"></i> Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", productionModalHTML);
    console.log("Modal de produção adicionado no body.");
  }

  // ----------------- Eventos de Formatação -----------------
  // Formata CPF ao perder o foco.
  document.getElementById("cpf").addEventListener("blur", function () {
    let digits = this.value.replace(/\D/g, "");
    if (digits.length === 11) {
      this.value = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (digits.length > 0 && digits.length !== 11) {
      alert("CPF deve conter 11 dígitos. Por favor, verifique o número inserido.");
      setTimeout(() => this.focus(), 0);
    }
  });
  // Formata Whatsapp ao perder o foco.
  document.getElementById("whatsapp").addEventListener("blur", function () {
    let digits = this.value.replace(/\D/g, "");
    if (digits.length === 11) {
      this.value = digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (digits.length > 0 && digits.length !== 11) {
      alert("Whatsapp deve conter 11 dígitos. Por favor, verifique o número inserido.");
      setTimeout(() => this.focus(), 0);
    }
  });
  // Formata o campo "Qtde/Valor" para o padrão pt-BR (ex: 100.000,00) ao perder o foco.
  document.getElementById("quantidadeValor").addEventListener("blur", function () {
    let rawValue = this.value;
    // Remove pontos e substitui vírgula por ponto para conversão numérica.
    let numericValue = parseFloat(rawValue.replace(/\./g, "").replace(",", "."));
    if (!isNaN(numericValue)) {
      this.value = numericValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  });

  // ----------------- WhatsApp Modal (QR Code) -----------------
  if (!document.getElementById("whatsappModal")) {
    const whatsappModalHTML = `
      <div id="whatsappModal" class="whatsapp-modal-overlay">
        <div class="whatsapp-modal-content">
          <span id="closeWhatsappModal" class="whatsapp-modal-close">X</span>
          <h3>Envie via WhatsApp</h3>
          <img id="whatsappQRCode" src="" alt="QR Code para WhatsApp" width="200" height="200" />
          <p>Escaneie o QR Code para enviar a mensagem</p>
        </div>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", whatsappModalHTML);
  }
  const whatsappModal = document.getElementById("whatsappModal");
  // Ao abrir o QR Code, guarda o modal atual (se estiver visível) e o oculta.
  function openWhatsappModal(qrCodeUrl) {
    if (vendaModal && vendaModal.style.display !== "none") {
      previousModal = vendaModal;
      vendaModal.style.display = "none";
    }
    const qrImg = document.getElementById("whatsappQRCode");
    if (qrImg) {
      qrImg.setAttribute("src", qrCodeUrl);
    }
    whatsappModal.style.display = "flex";
  }
  // Ao fechar o QR Code, oculta-o e retorna ao modal anterior, se houver.
  function closeWhatsappModal() {
    whatsappModal.style.display = "none";
    if (previousModal) {
      previousModal.style.display = "flex";
      previousModal = null;
    }
  }
  document.getElementById("closeWhatsappModal").addEventListener("click", closeWhatsappModal);

  // ----------------- Table Rendering -----------------
  // Renderiza a tabela completa (ordenada pela data do mais recente para o mais antigo).
  function loadFromLocalStorageVenda() {
    let data = getSalesData();
    data.sort((a, b) => new Date(b.data) - new Date(a.data));
    const vendaTableBody = document.querySelector("#vendaModal tbody");
    vendaTableBody.innerHTML = "";
    data.forEach((item, index) => {
      const formattedValor = formatQuantidadeValor(item.quantidadeValor, item.produto);
      const newRow = vendaTableBody.insertRow();
      newRow.setAttribute("data-index", index);
      newRow.innerHTML = `
        <td>${item.atendimento}</td>
        <td>${item.nome}</td>
        <td>${item.cpf}</td>
        <td>${item.email}</td>
        <td>${item.whatsapp}</td>
        <td>${item.produto}</td>
        <td>${formattedValor}</td>
        <td>${item.data}</td>
        <td>
          <div class="icons-actions">
            <span class="icon-wrapper edit-btn" data-tooltip="Editar">
              <i class="ri-edit-box-line icon-line"></i>
              <i class="ri-edit-box-fill icon-fill"></i>
            </span>
            <span class="icon-wrapper delete-btn" data-tooltip="Excluir">
              <i class="ri-delete-bin-line icon-line"></i>
              <i class="ri-delete-bin-fill icon-fill"></i>
            </span>
            <span class="icon-wrapper email-btn" data-tooltip="Enviar E-mail">
              <i class="ri-mail-send-line icon-line"></i>
              <i class="ri-mail-send-fill icon-fill"></i>
            </span>
            <span class="icon-wrapper whatsapp-btn" data-tooltip="Enviar Whatsapp">
              <i class="ri-whatsapp-line icon-line"></i>
              <i class="ri-whatsapp-fill icon-fill"></i>
            </span>
          </div>
        </td>`;
    });
  }
  // Renderiza a tabela filtrada (ordenada pela data).
  function loadFilteredData(filterType) {
    let data = getSalesData();
    data.sort((a, b) => new Date(b.data) - new Date(a.data));
    const vendaTableBody = document.querySelector("#vendaModal tbody");
    vendaTableBody.innerHTML = "";
    data.forEach((item, index) => {
      if (item.atendimento === filterType) {
        const formattedValor = formatQuantidadeValor(item.quantidadeValor, item.produto);
        const newRow = vendaTableBody.insertRow();
        newRow.setAttribute("data-index", index);
        newRow.innerHTML = `
          <td>${item.atendimento}</td>
          <td>${item.nome}</td>
          <td>${item.cpf}</td>
          <td>${item.email}</td>
          <td>${item.whatsapp}</td>
          <td>${item.produto}</td>
          <td>${formattedValor}</td>
          <td>${item.data}</td>
          <td>
            <div class="icons-actions">
              <span class="icon-wrapper edit-btn" data-tooltip="Editar">
                <i class="ri-edit-box-line icon-line"></i>
                <i class="ri-edit-box-fill icon-fill"></i>
              </span>
              <span class="icon-wrapper delete-btn" data-tooltip="Excluir">
                <i class="ri-delete-bin-line icon-line"></i>
                <i class="ri-delete-bin-fill icon-fill"></i>
              </span>
              <span class="icon-wrapper email-btn" data-tooltip="Enviar E-mail">
                <i class="ri-mail-send-line icon-line"></i>
                <i class="ri-mail-send-fill icon-fill"></i>
              </span>
              <span class="icon-wrapper whatsapp-btn" data-tooltip="Enviar Whatsapp">
                <i class="ri-whatsapp-line icon-line"></i>
                <i class="ri-whatsapp-fill icon-fill"></i>
              </span>
            </div>
          </td>`;
      }
    });
  }
  // Atualiza a visualização e os contadores do dashboard.
  function refreshAllViews() {
    updateDashboardCounts();
    if (currentFilter === "Venda" || currentFilter === "Pipeline" || currentFilter === "Lead") {
      loadFilteredData(currentFilter);
    } else {
      loadFromLocalStorageVenda();
    }
  }
  function updateDashboardCounts() {
    const data = getSalesData();
    const vendaCount = data.filter(item => item.atendimento === "Venda").length;
    const pipelineCount = data.filter(item => item.atendimento === "Pipeline").length;
    const leadCount = data.filter(item => item.atendimento === "Lead").length;
    const vendaMesElem = document.querySelector(".vendaMes");
    const pipelineElem = document.querySelector(".pipeline");
    const leadsElem = document.querySelector(".leads");
    if (vendaMesElem) vendaMesElem.textContent = vendaCount.toString();
    if (pipelineElem) pipelineElem.textContent = pipelineCount.toString();
    if (leadsElem) leadsElem.textContent = leadCount.toString();
  }

  // ----------------- EDIÇÃO, EXCLUSÃO, EMAIL & WHATSAPP -----------------
  // Função exclusiva para tratar a edição ao clicar no ícone.
  function handleEditRecord(e) {
    const editBtn = e.target.closest(".edit-btn");
    if (!editBtn) return;
    const row = editBtn.closest("tr");
    if (!row) return;
    const index = row.getAttribute("data-index");
    if (index === null) return;
    document.getElementById("editingIndex").value = index;
    const salesData = getSalesData();
    const record = salesData[parseInt(index)];
    if (!record) return;
    // Popula o formulário com os dados do registro.
    document.getElementById("tipoAtendimento").value = record.atendimento;
    document.getElementById("nome").value = record.nome;
    document.getElementById("cpf").value = record.cpf;
    document.getElementById("email").value = record.email;
    document.getElementById("whatsapp").value = record.whatsapp;
    document.getElementById("produto").value = record.produto;
    document.getElementById("quantidadeValor").value = record.quantidadeValor;
    document.getElementById("data").value = record.data;
    // Abre o modal de edição.
    const editModalEl = document.getElementById("addProductModal");
    if (editModalEl) {
      const modal = new bootstrap.Modal(editModalEl);
      modal.show();
    }
  }

  // Listener para capturar cliques na tabela (edição, exclusão, email e WhatsApp).
  const vendaTableBody = document.querySelector("#vendaModal tbody");
  if (vendaTableBody) {
    vendaTableBody.addEventListener("click", function (e) {
      if (e.target.closest(".edit-btn")) {
        handleEditRecord(e);
      }
      const deleteBtn = e.target.closest(".delete-btn");
      if (deleteBtn) {
        if (!confirm("Você tem certeza que deseja excluir este registro?")) return;
        const row = deleteBtn.closest("tr");
        if (!row) return;
        const index = row.getAttribute("data-index");
        if (index === null) return;
        const fullData = getSalesData();
        fullData.splice(parseInt(index), 1);
        saveSalesData(fullData);
        refreshAllViews();
      }
      const emailBtn = e.target.closest(".email-btn");
      if (emailBtn) {
        const row = emailBtn.closest("tr");
        if (!row) return;
        const clientEmail = row.cells[3].textContent.trim();
        const fullName = row.cells[1].textContent.trim();
        const firstName = fullName.split(" ")[0];
        const subject = encodeURIComponent("Atendimento Santander");
        const body = encodeURIComponent(`${firstName}, tudo bem?\n\nAtenciosamente,\nSantander`);
        window.location.href = `mailto:${clientEmail}?subject=${subject}&body=${body}`;
      }
      const whatsappBtn = e.target.closest(".whatsapp-btn");
      if (whatsappBtn) {
        const row = whatsappBtn.closest("tr");
        if (!row) return;
        let clientWhatsapp = row.cells[4].textContent.trim().replace(/[^0-9]/g, "");
        const fullName = row.cells[1].textContent.trim();
        const firstName = fullName.split(" ")[0];
        const messageText = `${firstName}, tudo bem?\n\nQuero agradecer pelo contato de hoje!\n\nAbraço!`;
        const waLink = `https://wa.me/55${clientWhatsapp}?text=${encodeURIComponent(messageText)}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(waLink)}&size=200x200`;
        openWhatsappModal(qrCodeUrl);
      }
    });
  }

  // ----------------- FORM SUBMISSION -----------------
  const productionForm = document.getElementById("productionForm");
  if (productionForm) {
    productionForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // Validação dos formatos CPF e Whatsapp.
      const cpfValue = document.getElementById("cpf").value.trim();
      const whatsappValue = document.getElementById("whatsapp").value.trim();
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      const whatsappRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
      if (!cpfRegex.test(cpfValue)) {
        alert("CPF em formato inválido. Use o formato: 000.000.000-00");
        setTimeout(() => document.getElementById("cpf").focus(), 0);
        return;
      }
      if (!whatsappRegex.test(whatsappValue)) {
        alert("Whatsapp em formato inválido. Use o formato: (11) 99999-9999");
        setTimeout(() => document.getElementById("whatsapp").focus(), 0);
        return;
      }
      const atendimento = document.getElementById("tipoAtendimento").value;
      const nome = document.getElementById("nome").value;
      const cpf = cpfValue;
      const email = document.getElementById("email").value;
      const whatsapp = whatsappValue;
      const produto = document.getElementById("produto").value;
      const quantidadeValor = document.getElementById("quantidadeValor").value;
      const data = document.getElementById("data").value;
      const editingIndex = document.getElementById("editingIndex").value;
      const newRecord = { atendimento, nome, cpf, email, whatsapp, produto, quantidadeValor, data };
      let currentData = getSalesData();
      if (editingIndex !== "") {
        const idx = parseInt(editingIndex);
        if (!isNaN(idx) && idx >= 0 && idx < currentData.length) {
          currentData[idx] = newRecord;
        }
      } else {
        currentData.unshift(newRecord);
      }
      // Ordena os registros pela data (mais recente primeiro) antes de salvar.
      currentData.sort((a, b) => new Date(b.data) - new Date(a.data));
      saveSalesData(currentData);
      refreshAllViews();
      // Fecha o modal e reseta o formulário.
      const addProductModal = bootstrap.Modal.getInstance(document.getElementById("addProductModal"));
      if (addProductModal) addProductModal.hide();
      productionForm.reset();
      document.getElementById("data").value = new Date().toISOString().split("T")[0];
      document.getElementById("editingIndex").value = "";
    });
  }

  // ----------------- OPEN NEW RECORD FORM -----------------
  const salesIcon = document.querySelector(".sales-icon");
  if (salesIcon) {
    salesIcon.addEventListener("click", function () {
      document.getElementById("editingIndex").value = "";
      const modalEl = document.getElementById("addProductModal");
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
      document.getElementById("data").value = new Date().toISOString().split("T")[0];
    });
  }

  // ----------------- FILTERING EVENTS -----------------
  const vendasDiaBtn = document.getElementById("vendasDiaBtn");
  if (vendasDiaBtn) {
    vendasDiaBtn.addEventListener("click", function () {
      currentFilter = "Venda";
      const modal = document.getElementById("vendaModal");
      if (modal) {
        loadFilteredData("Venda");
        modal.style.display = "flex";
      }
    });
  }
  const pipelineBtn = document.getElementById("pipelineBtn");
  if (pipelineBtn) {
    pipelineBtn.addEventListener("click", function () {
      currentFilter = "Pipeline";
      const modal = document.getElementById("vendaModal");
      if (modal) {
        loadFilteredData("Pipeline");
        modal.style.display = "flex";
      }
    });
  }
  const leadBtn = document.getElementById("leadBtn");
  if (leadBtn) {
    leadBtn.addEventListener("click", function () {
      currentFilter = "Lead";
      const modal = document.getElementById("vendaModal");
      if (modal) {
        loadFilteredData("Lead");
        modal.style.display = "flex";
      }
    });
  }
  const productionIcon = document.querySelector(".production-icon");
  if (productionIcon) {
    productionIcon.addEventListener("click", function () {
      currentFilter = "";
      const modal = document.getElementById("vendaModal");
      if (modal) {
        loadFromLocalStorageVenda();
        modal.style.display = "flex";
      }
    });
  }
  
  // Inicializa a visualização.
  refreshAllViews();
});
