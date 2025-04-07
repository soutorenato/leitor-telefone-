document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM carregado.");

  // Funções utilitárias para formatação de CPF e Whatsapp
  function formatCPF(cpf) {
    cpf = cpf.replace(/\D/g, ""); // Remove tudo que não é dígito
    if (cpf.length > 11) cpf = cpf.slice(0, 11);
    // Formata no padrão 000.000.000-00
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  function formatWhatsapp(whatsapp) {
    whatsapp = whatsapp.replace(/\D/g, ""); // Remove tudo que não é dígito
    if (whatsapp.length > 11) whatsapp = whatsapp.slice(0, 11);
    // Formata no padrão (11) 99999-9999
    return whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  // Adiciona eventos "blur" para formatar automaticamente os inputs de CPF e Whatsapp
  const cpfInput = document.getElementById("cpf");
  if (cpfInput) {
    cpfInput.addEventListener("blur", function () {
      cpfInput.value = formatCPF(cpfInput.value);
    });
  }
  const whatsappInput = document.getElementById("whatsapp");
  if (whatsappInput) {
    whatsappInput.addEventListener("blur", function () {
      whatsappInput.value = formatWhatsapp(whatsappInput.value);
    });
  }

  // Variáveis globais
  let previousModal = null;
  let currentFilter = "";
  let currentWhatsappNumber = "";

  // Mapeamento dos produtos para mensagens no atendimento "Venda"
  const productMessages = {
    "Abertura de Conta": "Bem-vindo ao Santander! É um prazer termos você conosco. Sua nova conta abre portas para um mundo de possibilidades financeiras.",
    "Câmbio": "Obrigado por escolher o Santander para suas operações de câmbio. Estamos prontos para oferecer soluções seguras e convenientes para suas transações internacionais.",
    "Captação Líquida": "Sua confiança nos serviços do Santander é o que nos motiva a oferecer as melhores opções para sua gestão financeira. Obrigado por essa parceria!",
    "Captalização": "Investir no futuro nunca foi tão inteligente. Obrigado por confiar no Santander para realizar seus planos.",
    "Cartão Novo": "Seu novo cartão Santander chegou para simplificar sua vida. Aproveite todos os benefícios exclusivos que ele oferece!",
    "Cartão Upgrade": "Com o upgrade do seu cartão Santander, você agora conta com ainda mais vantagens. Estamos felizes em fazer parte deste momento.",
    "COE": "Obrigado por confiar no Santander ao investir no Certificado de Operações Estruturadas (COE). É um prazer oferecer soluções personalizadas para seus investimentos.",
    "Consignado": "Sua escolha pelo crédito consignado Santander é uma prova de confiança que valorizamos muito. Conte conosco para apoiar seus planos.",
    "Consignado Preventivo": "Com o crédito consignado preventivo do Santander, você está sempre preparado. Agradecemos sua confiança!",
    "Consórcio": "Realizar seus sonhos é a nossa prioridade. Obrigado por escolher o consórcio Santander como seu parceiro nessa jornada.",
    "Crédito Imobiliário": "Agradecemos por confiar no Santander para realizar o sonho da casa própria. Estamos prontos para caminhar com você.",
    "Crédito Pessoal": "Com o crédito pessoal do Santander, suas metas estão ao alcance das mãos. Obrigado por nos escolher!",
    "Crédito Pessoal Com Garantia": "Obrigado por optar pelo crédito pessoal com garantia Santander. Sua confiança nos inspira a oferecer o melhor serviço.",
    "Crédito Pessoal Preventivo": "Preparação é tudo! Obrigado por confiar no crédito pessoal preventivo do Santander para garantir sua tranquilidade.",
    "Open Finance": "Com o Open Finance do Santander, sua liberdade financeira é prioridade. Agradecemos por aderir a essa inovação!",
    "Parcelamento de Fatura": "Mais flexibilidade no pagamento das suas contas com o Santander. Obrigado por escolher nosso parcelamento de fatura.",
    "Previdência": "Segurança e estabilidade são o futuro que desejamos para você. Obrigado por confiar na previdência Santander.",
    "Seguro Auto": "Seu carro merece o melhor cuidado! Obrigado por escolher o seguro auto do Santander.",
    "Seguro Casa": "Sua casa está protegida com a gente. Obrigado por confiar no seguro residencial Santander.",
    "Seguro Demais": "Independentemente da sua necessidade, estamos aqui para proteger o que importa. Obrigado por contratar nossos seguros Santander.",
    "Seguro Vida": "O seguro de vida Santander foi feito para cuidar de você e de quem você ama. Obrigado pela confiança!",
    "Use Casa": "Transformar seu imóvel em oportunidade é fácil com o Santander. Obrigado por aproveitar essa solução inovadora.",
    "Reativação de Conta": "Reative sua conta Santander e volte a aproveitar todos os benefícios e vantagens exclusivas que preparamos para você."
  };

  // Mapeamento dos produtos para mensagens no atendimento "Lead"
  const leadProductMessages = {
    "Abertura de Conta": "Abra sua conta no Santander e explore um mundo de soluções financeiras feitas para você. Estou aqui para acompanhar cada etapa dessa jornada.",
    "Aniversário": "Parabéns pelo seu aniversário! 🎉 Em nome do Santander, desejo muita alegria e conquistas. Lembre-se de que você pode aproveitar descontos exclusivos na Esfera ao usar seu Cartão de Crédito Santander!",
    "Apresentação do Gerente": "Olá! Sou seu novo gerente no Santander e estou aqui para ser seu parceiro na gestão das suas finanças. Meu objetivo é ajudar você a alcançar suas metas e tornar sua experiência financeira mais prática e eficiente.\n\nGostaria de saber se você tem interesse em participar de uma assessoria financeira personalizada, para que possamos planejar juntos as melhores estratégias para o seu sucesso.",
    "Ativação de Conta": "Ative sua conta Santander e volte a aproveitar todos os benefícios e soluções feitas para facilitar sua rotina financeira.",
    "Câmbio": "Conte comigo para realizar suas transações internacionais de forma prática e segura. O Santander oferece a confiança necessária para suas operações de câmbio.",
    "Capitalização": "Planeje seu futuro com a Capitalização Santander. Economize, participe de sorteios e alcance seus sonhos com tranquilidade.",
    "Cartão Novo": "Solicite o seu Cartão Santander Unique e aproveite benefícios exclusivos, como:\n\n- Acesso a Salas VIP nos aeroportos para maior conforto em suas viagens.\n- Acúmulo de pontos no Esfera, que podem ser trocados por produtos, serviços ou descontos.\n- Vantagens internacionais, pensadas para atender às suas necessidades financeiras.\n\nTransforme sua experiência financeira com exclusividade e benefícios únicos!",
    "Cartão Upgrade": "Faça seu upgrade do cartão Santander e tenha acesso a melhores benefícios! Eleve sua experiência com exclusividades feitas para você.",
    "COE (Certificado de Operações Estruturadas)": "Diversifique seus investimentos com o COE Santander, uma solução inovadora e adaptada ao seu perfil para alcançar seus objetivos financeiros.",
    "Consignado": "Realize seus projetos com o crédito consignado Santander. Taxas atrativas e condições especiais esperam por você!",
    "Consignado Preventivo": "Garanta mais segurança e tranquilidade com o crédito consignado preventivo Santander, uma solução ideal para suas necessidades.",
    "Consórcio de Imóvel": "Conquiste sua casa própria com o Consórcio de Imóvel Santander. Planejamento e confiança para suas realizações.",
    "Consórcio de Veículo": "Adquira o veículo dos seus sonhos com o Consórcio Santander, uma forma prática e econômica de planejar suas metas.",
    "Consultoria de Investimentos": "Quero convidar você para participar de uma assessoria de investimentos personalizada no Santander. Você pode escolher o formato que mais combina com sua rotina: presencial, por telefone ou videoconferência.",
    "Crédito Imobiliário": "Conquiste o imóvel dos seus sonhos com o Crédito Imobiliário Santander, adaptado para atender às suas necessidades e metas.",
    "Crédito Pessoal": "Realize seus planos com o crédito pessoal Santander, oferecendo flexibilidade e condições pensadas para você.",
    "Crédito Pessoal with Garantia": "Aproveite vantagens exclusivas com o crédito pessoal com garantia Santander, uma solução inteligente e personalizada.",
    "Crédito Pessoal Preventivo": "Prepare-se para imprevistos com o crédito pessoal preventivo Santander. Garantimos mais segurança e tranquilidade financeira para você.",
    "Open Finance": "Com o Open Finance Santander, você gerencia suas finanças de forma prática e integrada. Para ativar no aplicativo:\n\n- Acesse o app Santander.\n- Clique no menu Open Finance.\n- Autorize e gerencie suas contas e serviços financeiros de forma integrada.\n\nSimplifique sua rotina e tenha controle total das suas finanças!",
    "Parcelamento de Fatura": "Organize seus pagamentos com o Parcelamento de Fatura Santander, garantindo mais flexibilidade e controle financeiro.",
    "Previdência": "Quero ajudar você a planejar sua aposentadoria com os planos de previdência do Santander. Minha prioridade é garantir sua segurança e conforto no futuro.\n\nMe informe qual a renda mensal que você deseja ter na sua aposentadoria, e eu farei uma simulação personalizada para ajudar você a se preparar da melhor forma possível.",
    "Reativação de Conta": "Reative sua conta Santander e volte a aproveitar todos os benefícios e vantagens exclusivas que preparamos para você.",
    "Saldo Parado em Conta": "Percebi que você possui um saldo parado na conta, e isso pode significar perda de dinheiro para a inflação ao longo do tempo. Por exemplo, se você tem R$ 100.000,00 parados, ao aplicá-los em um CDB de 100% do CDI, o valor renderia aproximadamente R$ 13.650,00 brutos ao ano (baseado no CDI atual de 13,65% ao ano, que pode variar). Mesmo descontando impostos, o rendimento seria maior do que o impacto da inflação, preservando o poder de compra do seu dinheiro.",
    "Seguro Auto": "Com o Seguro Auto Santander, você pode garantir até 30% de desconto na contratação do seguro para o seu veículo. Além disso, utilizamos o sistema Auto Compara, que simula opções com até 11 seguradoras diferentes.\n\nO Auto Compara é uma plataforma que permite comparar preços, coberturas e condições de seguros de forma rápida e prática, ajudando você a escolher a melhor opção para suas necessidades.\n\nMe informe a data de vencimento do seguro do seu veículo, assim podemos encontrar a melhor solução no momento certo para você.",
    "Seguro Casa": "Cuide do seu lar com o Seguro Casa Santander e garanta a proteção que você merece. Oferecemos seguros a partir de R$ 19,90, com coberturas completas para o que realmente importa.",
    "Seguro Demais": "Independentemente da sua necessidade, o Santander tem o seguro ideal para você. Proteja o que importa e tenha mais segurança no seu dia a dia.",
    "Seguro Vida": "Cuide de você e de sua família com o Seguro Vida Santander, garantindo segurança e bem-estar para o futuro.",
    "Use Casa": "Transforme o valor do seu imóvel em uma solução financeira com o Use Casa Santander. Com esse empréstimo, você pode usar o dinheiro liberado para diversas finalidades, como:\n\n- Reforma ou ampliação do seu imóvel, para deixá-lo do jeito que sempre sonhou.\n- Investimento em negócios ou projetos que deseja iniciar ou expandir.\n- Educação, financiando estudos ou cursos importantes para você ou sua família.\n- Viagens, realizando aquela viagem especial que sempre planejou.\n- Quitar dívidas, reorganizando suas finanças com taxas mais atrativas.\n\nTudo isso com a segurança de um empréstimo com garantia de imóvel, que oferece prazos mais longos e condições vantajosas para você.",
    "Reativação de Conta": "Reative sua conta Santander e volte a aproveitar todos os benefícios e vantagens exclusivas que preparamos para você."
  };

  const additionalMessage =
    "Estou à disposição sempre que precisar. Você também pode contar com o atendimento 24 horas por dia, 7 dias por semana pelo Chat Santander. Para acessá-lo, basta entrar no aplicativo Santander, ir até o Menu Atendimento e selecionar a opção Chat.";

  const finalLeadMessage =
    "Retorne este contato para agendarmos um horário e darmos continuidade. Estou à disposição!";

  // Inject custom style
  const customStyle = document.createElement("style");
  customStyle.innerHTML = `
    .btn-select.btn-primary:hover {
      background-color: #0d6efd !important;
      border-color: #0d6efd !important;
      color: #fff !important;
    }
    .whatsapp-modal-overlay, 
    .whatsapp-message-modal {
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
    .whatsapp-modal-content, .whatsapp-message-modal-content {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      position: relative;
      width: 90%;
      max-width: 500px;
    }
    .whatsapp-modal-close, .whatsapp-message-close {
      position: absolute;
      top: 8px;
      right: 8px;
      cursor: pointer;
      font-weight: bold;
    }
    .table-responsive table td {
      white-space: normal;
      word-break: break-word;
    }
    textarea#whatsappMessageText {
      width: 100%;
      resize: vertical;
      padding: 10px;
      font-size: 14px;
    }
  `;
  document.head.appendChild(customStyle);

  // ----------------- Helper Functions -----------------
  function formatQuantidadeValor(val, produto) {
    const specialProducts = ["Abertura de Conta", "Cartão Novo", "Cartão Upgrade", "Open Finance"];
    if (specialProducts.includes(produto)) {
      return "1";
    } else {
      const num = Number(val);
      return isNaN(num) ? val : num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }

  function getSalesData() {
    return JSON.parse(localStorage.getItem("vendasData")) || [];
  }
  
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
          <input type="text" id="searchInput" placeholder="Pesquisar por nome, CPF ou Whatsapp" style="width: 100%; padding: 8px; margin-bottom: 10px;" />
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
      closeWhatsappMessageModal();
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
                      <option value="Aniversário">Aniversário</option>
                      <option value="Apresentação Gerente">Apresentação Gerente</option>
                      <option value="Ativação de Conta">Ativação de Conta</option>
                      <option value="Câmbio">Câmbio</option>
                      <option value="Captalização">Captalização</option>
                      <option value="Cartão Novo">Cartão Novo</option>
                      <option value="Cartão Upgrade">Cartão Upgrade</option>
                      <option value="COE">COE</option>
                      <option value="Consignado">Consignado</option>
                      <option value="Consignado Preventivo">Consignado Preventivo</option>
                      <option value="Consórcio">Consórcio</option>
                      <option value="Consórcio de Imóvel">Consórcio de Imóvel</option>
                      <option value="Consórcio de Veículo">Consórcio de Veículo</option>
                      <option value="Consultoria de Investimentos">Consultoria de Investimentos</option>
                      <option value="Crédito Imobiliário">Crédito Imobiliário</option>
                      <option value="Crédito Pessoal">Crédito Pessoal</option>
                      <option value="Crédito Pessoal Com Garantia">Crédito Pessoal Com Garantia</option>
                      <option value="Crédito Pessoal Preventivo">Crédito Pessoal Preventivo</option>
                      <option value="Open Finance">Open Finance</option>
                      <option value="Parcelamento de Fatura">Parcelamento de Fatura</option>
                      <option value="Previdência">Previdência</option>
                      <option value="Reativação de Conta">Reativação de Conta</option>
                      <option value="Saldo Parado Em Conta">Saldo Parado Em Conta</option>
                      <option value="Seguro Auto">Seguro Auto</option>
                      <option value="Seguro Casa">Seguro Casa</option>
                      <option value="Seguro Demais">Seguro Demais</option>
                      <option value="Seguro Vida">Seguro Vida</option>
                      <option value="Use Casa">Use Casa</option>
                    </select>
                  </div>
                </div>
                <div class="mb-2 row align-items-center">
                  <label class="col-3 col-form-label">Qtde/VALOR</label>
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

  // ----------------- Modal de Edição da Mensagem WhatsApp -----------------
  if (!document.getElementById("whatsappMessageModal")) {
    const whatsappMessageModalHTML = `
      <div id="whatsappMessageModal" class="whatsapp-message-modal" style="display: none;">
        <div class="whatsapp-message-modal-content">
          <span id="closeWhatsappMessageModal" class="whatsapp-message-close">X</span>
          <h3>Mensagem para WhatsApp</h3>
          <textarea id="whatsappMessageText" rows="6"></textarea>
          <div style="margin-top: 10px; text-align: right;">
            <button id="generateQrButton" class="btn btn-primary">Gerar QR Code</button>
            <button id="cancelWhatsappMessage" class="btn btn-secondary">Cancelar</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", whatsappMessageModalHTML);
  }
  const whatsappMessageModal = document.getElementById("whatsappMessageModal");
  const whatsappMessageText = document.getElementById("whatsappMessageText");
  const generateQrButton = document.getElementById("generateQrButton");
  const cancelWhatsappMessage = document.getElementById("cancelWhatsappMessage");

  function showWhatsappMessageModal(messageText, whatsappNumber) {
    currentWhatsappNumber = whatsappNumber;
    whatsappMessageText.value = messageText;
    whatsappMessageModal.style.display = "flex";
  }
  function closeWhatsappMessageModal() {
    whatsappMessageModal.style.display = "none";
  }
  document.getElementById("closeWhatsappMessageModal").addEventListener("click", closeWhatsappMessageModal);
  cancelWhatsappMessage.addEventListener("click", closeWhatsappMessageModal);
  
  generateQrButton.addEventListener("click", function () {
    const editedText = whatsappMessageText.value;
    const waLink = `https://wa.me/55${currentWhatsappNumber}?text=${encodeURIComponent(editedText)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(waLink)}&size=200x200`;
    closeWhatsappMessageModal();
    openWhatsappModal(qrCodeUrl);
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
  function closeWhatsappModal() {
    whatsappModal.style.display = "none";
    if (previousModal) {
      previousModal.style.display = "flex";
      previousModal = null;
    }
  }
  document.getElementById("closeWhatsappModal").addEventListener("click", closeWhatsappModal);

  // ----------------- Table Rendering -----------------
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
    document.getElementById("tipoAtendimento").value = record.atendimento;
    document.getElementById("nome").value = record.nome;
    document.getElementById("cpf").value = record.cpf;
    document.getElementById("email").value = record.email;
    document.getElementById("whatsapp").value = record.whatsapp;
    document.getElementById("produto").value = record.produto;
    document.getElementById("quantidadeValor").value = record.quantidadeValor;
    document.getElementById("data").value = record.data;
    const editModalEl = document.getElementById("addProductModal");
    if (editModalEl) {
      const modal = new bootstrap.Modal(editModalEl);
      modal.show();
    }
  }

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
        let firstName = fullName.split(" ")[0];
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        const atendimento = row.cells[0].textContent.trim();
        let messageBody = `${firstName}, tudo bem?`;
        if (atendimento === "Venda") {
          const produto = row.cells[5].textContent.trim();
          messageBody += `\n\n${productMessages[produto] || ""}\n\n${additionalMessage}`;
        } else if (atendimento === "Lead") {
          const produto = row.cells[5].textContent.trim();
          messageBody = `${firstName}, tudo bem?\n\n${leadProductMessages[produto] || ""}\n\n${finalLeadMessage}`;
        }
        const subject = encodeURIComponent("Atendimento Santander");
        const body = encodeURIComponent(messageBody);
        window.location.href = `mailto:${clientEmail}?subject=${subject}&body=${body}`;
      }
      const whatsappBtn = e.target.closest(".whatsapp-btn");
      if (whatsappBtn) {
        const row = whatsappBtn.closest("tr");
        if (!row) return;
        let clientWhatsapp = row.cells[4].textContent.trim().replace(/[^0-9]/g, "");
        const fullName = row.cells[1].textContent.trim();
        let firstName = fullName.split(" ")[0];
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        const atendimento = row.cells[0].textContent.trim();
        let messageText = `${firstName}, tudo bem?`;
        if (atendimento === "Venda") {
          const produto = row.cells[5].textContent.trim();
          messageText += `\n\n${productMessages[produto] || ""}\n\n${additionalMessage}`;
        } else if (atendimento === "Lead") {
          const produto = row.cells[5].textContent.trim();
          messageText = `${firstName}, tudo bem?\n\n${leadProductMessages[produto] || ""}\n\n${finalLeadMessage}`;
        }
        showWhatsappMessageModal(messageText, clientWhatsapp);
      }
    });
  }

  // ----------------- FORM SUBMISSION -----------------
  const productionForm = document.getElementById("productionForm");
  if (productionForm) {
    productionForm.addEventListener("submit", function (e) {
      e.preventDefault();
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
      // Os campos já foram formatados no blur, mas garantimos a formatação:
      const formattedCPF = formatCPF(cpfValue);
      const formattedWhatsapp = formatWhatsapp(whatsappValue);
      const atendimento = document.getElementById("tipoAtendimento").value;
      const nome = document.getElementById("nome").value;
      const email = document.getElementById("email").value;
      const produto = document.getElementById("produto").value;
      const quantidadeValor = document.getElementById("quantidadeValor").value;
      const data = document.getElementById("data").value;
      const editingIndex = document.getElementById("editingIndex").value;
      const newRecord = { atendimento, nome, cpf: formattedCPF, email, whatsapp: formattedWhatsapp, produto, quantidadeValor, data };
      let currentData = getSalesData();
      if (editingIndex !== "") {
        const idx = parseInt(editingIndex);
        if (!isNaN(idx) && idx >= 0 && idx < currentData.length) {
          currentData[idx] = newRecord;
        }
      } else {
        currentData.unshift(newRecord);
      }
      currentData.sort((a, b) => new Date(b.data) - new Date(a.data));
      saveSalesData(currentData);
      refreshAllViews();
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
  
  refreshAllViews();

  // ----------------- Evento para campo de pesquisa -----------------
  const searchInputField = document.getElementById("searchInput");
  if (searchInputField) {
    searchInputField.addEventListener("input", function() {
      const filter = this.value.toLowerCase();
      const rows = document.querySelectorAll("#vendaModal tbody tr");
      rows.forEach(row => {
        const nome = row.cells[1].textContent.toLowerCase();
        const cpf = row.cells[2].textContent.toLowerCase();
        const whatsapp = row.cells[4].textContent.toLowerCase();
        if (nome.includes(filter) || cpf.includes(filter) || whatsapp.includes(filter)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }

  // ----------------- Funções para o Modal de Mensagem WhatsApp -----------------
  function showWhatsappMessageModal(messageText, whatsappNumber) {
    currentWhatsappNumber = whatsappNumber;
    whatsappMessageText.value = messageText;
    whatsappMessageModal.style.display = "flex";
  }
  function closeWhatsappMessageModal() {
    whatsappMessageModal.style.display = "none";
  }
  document.getElementById("closeWhatsappMessageModal").addEventListener("click", closeWhatsappMessageModal);
  cancelWhatsappMessage.addEventListener("click", closeWhatsappMessageModal);
});
