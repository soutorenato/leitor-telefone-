document.addEventListener("DOMContentLoaded", function () {
  // Verifica se o modal já existe e, se não, cria-o dinamicamente.
  if (!document.getElementById("dashboardModal")) {
    const dashboardHTML = `
      <div class="modal fade" id="dashboardModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-body">
              <!-- Linha com barra de progresso (div reduzida para 1/3 do tamanho) e botão de fechar na mesma linha -->
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="progress" style="width:31.5%; margin-right: 10px;">
                  <div class="progress-bar progress-bar-striped progress-bar-animated" 
                       role="progressbar" style="width: 50%;" 
                       aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">50%</div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
              </div>
              
              <!-- Linha com abas -->
              <ul class="nav nav-tabs mb-3" id="mainDashboardTab" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="informacoes-tab" data-bs-toggle="tab" data-bs-target="#informacoesDashboard" type="button" role="tab" aria-controls="informacoesDashboard" aria-selected="true">
                    Informações
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="orcamento-tab" data-bs-toggle="tab" data-bs-target="#orcamentoDashboard" type="button" role="tab" aria-controls="orcamentoDashboard" aria-selected="false">
                    Orçamento
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="patrimonio-tab" data-bs-toggle="tab" data-bs-target="#patrimonioDashboard" type="button" role="tab" aria-controls="patrimonioDashboard" aria-selected="false">
                    Patrimônio
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="objetivos-tab" data-bs-toggle="tab" data-bs-target="#objetivosDashboard" type="button" role="tab" aria-controls="objetivosDashboard" aria-selected="false">
                    Objetivos
                  </button>
                </li>
              </ul>

              <!-- Conteúdo das abas -->
              <div class="tab-content" id="mainDashboardTabContent">
                <!-- Dashboard de Informações -->
                <div class="tab-pane fade show active" id="informacoesDashboard" role="tabpanel" aria-labelledby="informacoes-tab">
                  <!-- Filtros -->
                  <div class="row mb-3">
                    <div class="col-md-4">
                      <input type="text" class="form-control" placeholder="Buscar informação..." id="searchInformacao">
                    </div>
                    <div class="col-md-4">
                      <select class="form-select" id="filterStatus">
                        <option value="">Status</option>
                        <option value="ativo">Ativo</option>
                        <option value="andamento">Em Andamento</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                    </div>
                    <div class="col-md-4">
                      <select class="form-select" id="filterPriority">
                        <option value="">Prioridade</option>
                        <option value="alta">Alta</option>
                        <option value="media">Média</option>
                        <option value="baixa">Baixa</option>
                      </select>
                    </div>
                  </div>
                  <!-- Grid de Cards de Informações -->
                  <div class="row" id="informacoesGrid">
                    <!-- Exemplo de Card 1 -->
                    <div class="col-md-4 mb-4">
                      <div class="card project-card">
                        <div class="card-body">
                          <h5 class="card-title">Projeto Alpha</h5>
                          <p class="card-text">Descrição breve do Projeto Alpha.</p>
                          <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-success badge-status">Ativo</span>
                            <span class="text-muted">Prazo: 30 dias</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Exemplo de Card 2 -->
                    <div class="col-md-4 mb-4">
                      <div class="card project-card">
                        <div class="card-body">
                          <h5 class="card-title">Projeto Beta</h5>
                          <p class="card-text">Descrição breve do Projeto Beta.</p>
                          <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-warning badge-status">Em Andamento</span>
                            <span class="text-muted">Prazo: 15 dias</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Exemplo de Card 3 -->
                    <div class="col-md-4 mb-4">
                      <div class="card project-card">
                        <div class="card-body">
                          <h5 class="card-title">Projeto Gamma</h5>
                          <p class="card-text">Descrição breve do Projeto Gamma.</p>
                          <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-danger badge-status">Finalizado</span>
                            <span class="text-muted">Prazo: 10 dias</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Dashboard de Orçamento -->
                <div class="tab-pane fade" id="orcamentoDashboard" role="tabpanel" aria-labelledby="orcamento-tab">
                  <!-- Filtros Orçamento -->
                  <div class="row mb-3">
                    <div class="col-md-4">
                      <input type="text" class="form-control" placeholder="Buscar orçamento..." id="searchOrcamento">
                    </div>
                    <div class="col-md-4">
                      <select class="form-select" id="filterOrcamentoStatus">
                        <option value="">Status do Orçamento</option>
                        <option value="novo">Novo</option>
                        <option value="contato">Em Contato</option>
                        <option value="convertido">Convertido</option>
                      </select>
                    </div>
                    <div class="col-md-4">
                      <select class="form-select" id="filterOrcamentoPriority">
                        <option value="">Prioridade</option>
                        <option value="alta">Alta</option>
                        <option value="media">Média</option>
                        <option value="baixa">Baixa</option>
                      </select>
                    </div>
                  </div>
                  <!-- Grid de Cards de Orçamento -->
                  <div class="row" id="orcamentoGrid">
                    <!-- Exemplo de Card Orçamento 1 -->
                    <div class="col-md-4 mb-4">
                      <div class="card project-card">
                        <div class="card-body">
                          <h5 class="card-title">Cliente X</h5>
                          <p class="card-text">Informações resumidas do Cliente X.</p>
                          <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-info badge-status">Novo</span>
                            <span class="text-muted">Último contato: 2 dias</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Exemplo de Card Orçamento 2 -->
                    <div class="col-md-4 mb-4">
                      <div class="card project-card">
                        <div class="card-body">
                          <h5 class="card-title">Cliente Y</h5>
                          <p class="card-text">Informações resumidas do Cliente Y.</p>
                          <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-warning badge-status">Em Contato</span>
                            <span class="text-muted">Último contato: 5 dias</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Exemplo de Card Orçamento 3 -->
                    <div class="col-md-4 mb-4">
                      <div class="card project-card">
                        <div class="card-body">
                          <h5 class="card-title">Cliente Z</h5>
                          <p class="card-text">Informações resumidas do Cliente Z.</p>
                          <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-success badge-status">Convertido</span>
                            <span class="text-muted">Último contato: 1 dia</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Dashboard de Patrimônio -->
                <div class="tab-pane fade" id="patrimonioDashboard" role="tabpanel" aria-labelledby="patrimonio-tab">
                  <!-- Conteúdo para Patrimônio -->
                  <p>Aqui será exibido o conteúdo de Patrimônio.</p>
                </div>
                <!-- Dashboard de Objetivos -->
                <div class="tab-pane fade" id="objetivosDashboard" role="tabpanel" aria-labelledby="objetivos-tab">
                  <!-- Conteúdo para Objetivos -->
                  <p>Aqui será exibido o conteúdo de Objetivos.</p>
                </div>
              </div> <!-- Fim das abas -->
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", dashboardHTML);
  }

  // Adiciona listener para abrir o dashboard ao clicar no elemento com a classe "consultorias-history"
  const consultoriasHistory = document.querySelector(".consultorias-history");
  if (consultoriasHistory) {
    consultoriasHistory.addEventListener("click", function () {
      const modalEl = document.getElementById("dashboardModal");
      if (modalEl) {
        const modalInstance = new bootstrap.Modal(modalEl);
        modalInstance.show();
      } else {
        console.error("Dashboard modal não encontrado!");
      }
    });
  } else {
    console.error("Elemento com a classe 'consultorias-history' não foi encontrado!");
  }
});