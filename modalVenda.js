document.addEventListener("DOMContentLoaded", function () {
  // Seleciona a seção de Venda
  const vendasDiaBtn = document.getElementById("vendasDiaBtn");
  if (!vendasDiaBtn) {
    console.error("Elemento com id 'vendasDiaBtn' não encontrado.");
    return;
  }
  console.log("Elemento 'vendasDiaBtn' carregado. Aguardando clique.");
  
  vendasDiaBtn.addEventListener("click", function (e) {
    e.preventDefault();
    console.log("Elemento 'vendasDiaBtn' clicado. Abrindo modal de vendas...");
    showVendaModal();
  });
  
  // Configura os eventos de fechamento do modal
  function setupModal(modal) {
    const closeBtn = modal.querySelector("#closeVendaModal");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
        console.log("Modal fechado via botão de fechar.");
      });
    } else {
      console.warn("Botão de fechar não encontrado no modal.");
    }
    
    // Fecha o modal ao clicar fora do conteúdo
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.style.display = "none";
        console.log("Modal fechado ao clicar fora do conteúdo.");
      }
    });
    
    // Fecha o modal ao pressionar a tecla Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        modal.style.display = "none";
        console.log("Modal fechado ao pressionar Escape.");
      }
    });
  }
  
  // Cria e exibe o modal de vendas com a nova tabela
  function showVendaModal() {
    let modal = document.getElementById("vendaModal");
    if (!modal) {
      console.log("Modal não existente. Criando o modal de vendas.");
      const modalHTML = `
        <div id="vendaModal" class="modal-overlay" style="display: none;">
          <div class="modal-content">
            <button id="closeVendaModal" class="close-modal">X</button>
            <h2>Histórico de Vendas</h2>
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
                <tbody>
                  <tr>
                    <td>001</td>
                    <td>João Silva</td>
                    <td>123.456.789-00</td>
                    <td>joao@example.com</td>
                    <td>(11) 98765-4321</td>
                    <td>Produto A</td>
                    <td>10 / R$ 100,00</td>
                    <td>2025-03-29</td>
                    <td>
                      <button class="btn btn-sm btn-primary">Ver Detalhes</button>
                    </td>
                  </tr>
                  <!-- Adicione mais linhas conforme necessário -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", modalHTML);
      modal = document.getElementById("vendaModal");
      setupModal(modal);
      console.log("Modal de vendas criado e configurado.");
    }
    modal.style.display = "flex";
    console.log("Modal de vendas aberto.");
  }
});