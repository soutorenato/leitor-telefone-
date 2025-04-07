document.addEventListener("DOMContentLoaded", function () {
  // ====== ELEMENTOS DO MODAL ======
  const modal = document.getElementById("regularizacaoModal");
  const table = document.getElementById("regularizacaoTable");
  const tbody = table ? table.querySelector("tbody") : null;
  const searchInput = document.getElementById("regularizacaoSearch");
  // Botões e inputs de upload
  const loadExcelBtn = document.getElementById("loadExcelBtn");
  const excelFileInput = document.getElementById("excelFileInput");
  // Botão de delete (para exclusão da tabela)
  const deleteBtn = document.getElementById("deleteBtn");
  const regularizacaoHistory = document.querySelector(".regularizacao-history");
  const closeBtn = document.getElementById("closeRegularizacaoModal");

  // ====== MODAL ABERTURA E FECHAMENTO ======
  if (regularizacaoHistory) {
    regularizacaoHistory.addEventListener("click", function () {
      modal.style.display = "flex";
      loadRegularizacaoData();
    });
  } else {
    console.error("Elemento com a classe 'regularizacao-history' não foi encontrado.");
  }

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      modal.style.display = "none";
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      modal.style.display = "none";
    });
  } else {
    console.error("Botão #closeRegularizacaoModal não encontrado.");
  }

  // ====== FUNÇÃO DE SALVAR DADOS ======
  function saveRegularizacaoData() {
    if (!tbody) return;
    const data = [];
    Array.from(tbody.rows).forEach(row => {
      const rowData = [];
      Array.from(row.cells).forEach(cell => {
        rowData.push(cell.textContent.trim());
      });
      data.push(rowData);
    });
    try {
      localStorage.setItem("regularizacaoData", JSON.stringify(data));
      console.log("Dados salvos:", data);
    } catch (e) {
      console.error("Erro ao salvar dados:", e);
    }
  }

  // ====== FUNÇÃO DE ORDENAR A TABELA ======
  if (table) {
    const headerCells = table.querySelectorAll("thead th");
    headerCells.forEach((th, index) => {
      th.style.cursor = "pointer";
      th.addEventListener("click", function () {
        sortTableByColumn(index);
      });
    });
  }
  function sortTableByColumn(colIndex) {
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll("tr"));
    let order = tbody.getAttribute("data-sort-" + colIndex) === "asc" ? "desc" : "asc";
    tbody.setAttribute("data-sort-" + colIndex, order);
    rows.sort((a, b) => {
      let aText = a.cells[colIndex].textContent.trim();
      let bText = b.cells[colIndex].textContent.trim();
      let aNum = parseFloat(aText);
      let bNum = parseFloat(bText);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return order === "asc" ? aNum - bNum : bNum - aNum;
      } else {
        return order === "asc" ? aText.localeCompare(bText) : bText.localeCompare(aText);
      }
    });
    rows.forEach(row => tbody.appendChild(row));
    saveRegularizacaoData();
  }

  // ====== LISTENERS PARA EDIÇÃO DAS CÉLULAS ======
  function attachProductionListener(row) {
    const cells = row.cells;
    if (cells.length < 2) return;
    const prodCell = cells[cells.length - 2];
    const promiseCell = cells[cells.length - 1];
    prodCell.addEventListener("click", function productionHandler() {
      const oldValue = prodCell.textContent.trim();
      if (prodCell.querySelector("select")) return;
      const select = document.createElement("select");
      select.className = "form-control";
      select.style.fontSize = "inherit";
      select.innerHTML = `
        <option value="">Selecione...</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      `;
      prodCell.innerHTML = "";
      prodCell.appendChild(select);
      select.focus();
      let changed = false;
      select.addEventListener("change", function () {
        changed = true;
        const newVal = select.value;
        if (newVal === "Sim" || newVal === "Não") {
          prodCell.textContent = newVal;
          prodCell.style.color = (newVal === "Sim") ? "green" : "red";
          if (newVal === "Sim") {
            // Se produção for "Sim" ou "1", apaga a promessa da linha
            promiseCell.textContent = "";
            promiseCell.style.pointerEvents = "none";
          } else {
            promiseCell.style.pointerEvents = "auto";
            attachPromiseListener(promiseCell, row);
          }
          saveRegularizacaoData();
        } else {
          prodCell.textContent = oldValue;
          saveRegularizacaoData();
        }
      });
      select.addEventListener("blur", function () {
        if (!changed) {
          prodCell.textContent = oldValue;
          saveRegularizacaoData();
        }
      });
      setTimeout(() => {
        prodCell.removeEventListener("click", productionHandler);
        attachProductionListener(row);
      }, 500);
    });
  }

  function attachPromiseListener(cell, row) {
    const prodCell = row.cells[row.cells.length - 2];
    if (prodCell.textContent.trim() === "Sim") {
      cell.style.pointerEvents = "none";
      return;
    } else {
      cell.style.pointerEvents = "auto";
    }
    cell.addEventListener("click", function promiseHandler() {
      const oldValue = cell.textContent.trim();
      if (cell.querySelector("select") || cell.querySelector("input[type='date']")) return;
      cell.innerHTML = "";
      const select = document.createElement("select");
      select.className = "form-control";
      select.style.fontSize = "inherit";
      select.innerHTML = `
        <option value="">Selecione...</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      `;
      cell.appendChild(select);
      select.focus();
      let changed = false;
      select.addEventListener("change", function () {
        changed = true;
        if (select.value === "Sim") {
          cell.innerHTML = "";
          const dateInput = document.createElement("input");
          dateInput.type = "date";
          dateInput.className = "form-control";
          dateInput.style.fontSize = "inherit";
          cell.appendChild(dateInput);
          dateInput.focus();
          dateInput.addEventListener("change", function () {
            cell.textContent = dateInput.value;
            saveRegularizacaoData();
          });
          dateInput.addEventListener("blur", function () {
            cell.textContent = dateInput.value || oldValue;
            saveRegularizacaoData();
          });
          dateInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") dateInput.blur();
          });
        } else if (select.value === "Não") {
          cell.textContent = "Não";
          saveRegularizacaoData();
        } else {
          cell.textContent = oldValue;
          saveRegularizacaoData();
        }
      });
      select.addEventListener("blur", function () {
        if (!changed) {
          cell.textContent = oldValue;
          saveRegularizacaoData();
        }
      });
      setTimeout(() => {
        cell.removeEventListener("click", promiseHandler);
        attachPromiseListener(cell, row);
      }, 500);
    });
  }

  // ====== FUNÇÃO PARA POPULAR A TABELA ======
  function populateTable(data, skipHeader = false) {
    if (!tbody) return;
    tbody.innerHTML = "";
    const rowsData = skipHeader ? data.slice(1) : data;
    rowsData.forEach(rowData => {
      const tr = document.createElement("tr");
      const numCols = rowData.length;
      rowData.forEach((cellData, index) => {
        const td = document.createElement("td");
        if (index === numCols - 2) {
          const valor = String(cellData).toLowerCase();
          const isSim = (valor === "1" || valor === "sim");
          td.textContent = isSim ? "Sim" : "Não";
          td.style.color = isSim ? "green" : "red";
        } else if (index === numCols - 1) {
          td.textContent = cellData !== undefined ? cellData : "";
        } else {
          td.textContent = cellData !== undefined ? cellData : "";
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
      if (tr.cells.length >= 2) {
        attachProductionListener(tr);
        attachPromiseListener(tr.cells[tr.cells.length - 1], tr);
      }
    });
    saveRegularizacaoData();
  }

  // ====== CARREGA DADOS DO LOCALSTORAGE ======
  function loadRegularizacaoData() {
    const stored = localStorage.getItem("regularizacaoData");
    if (stored) {
      let data;
      try {
        data = JSON.parse(stored);
      } catch (e) {
        console.error("Erro ao interpretar dados salvos:", e);
        return;
      }
      populateTable(data, false);
    } else {
      console.log("Nenhum dado salvo para regularização.");
    }
  }
  loadRegularizacaoData();

  // ====== FILTRO DE PESQUISA ======
  if (searchInput && tbody) {
    searchInput.addEventListener("input", function () {
      const term = this.value.toLowerCase();
      Array.from(tbody.rows).forEach(row => {
        const rowText = row.textContent.toLowerCase();
        row.style.display = rowText.includes(term) ? "" : "none";
      });
    });
  }

  // ====== PROCESSAMENTO DO ARQUIVO EXCEL (UPLOAD) ======
  if (loadExcelBtn && excelFileInput) {
    loadExcelBtn.addEventListener("click", function () {
      excelFileInput.click();
    });
    excelFileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (!file) {
        console.log("Nenhum arquivo selecionado.");
        return;
      }
      console.log("Arquivo selecionado:", file.name);
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const dataArray = new Uint8Array(e.target.result);
          const workbook = XLSX.read(dataArray, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          // Utiliza defval para que células vazias sejam lidas como ""
          const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          console.log("Dados extraídos do Excel:", rawJson);
          // Define o número de colunas esperado com base no cabeçalho (ou um número fixo, ex.: 11)
          const numColsEsperadas = rawJson[0].length; // ou: const numColsEsperadas = 11;
          // Processa todas as linhas EXCETO a primeira (cabeçalho)
          const jsonData = rawJson.slice(1).map(row => {
            let newRow = Array.from({ length: numColsEsperadas }, (_, i) => {
              return row[i] === undefined || row[i] === null ? "" : row[i];
            });
            // Força a coluna "TIPO" (índice 4) para ""
            if (newRow.length >= 5) {
              newRow[4] = "";
            }
            return newRow;
          });
          // Recupera os dados já salvos
          const storedDataStr = localStorage.getItem("regularizacaoData");
          let storedData = storedDataStr ? JSON.parse(storedDataStr) : [];
          // Para cada linha nova, compara pelo penumber (sétima coluna, índice 6)
          jsonData.forEach(newRow => {
            // Se a coluna de produção (penúltima, coluna 10) for "1", "sim", "0" ou "não", limpa a coluna da promessa (última coluna)
            const prodVal = newRow[newRow.length - 2].toString().toLowerCase();
            if (prodVal === "1" || prodVal === "sim" || prodVal === "0" || prodVal === "não") {
              newRow[newRow.length - 1] = "";
            }
            // Converte o penumber da sétima coluna para string para comparação
            const penumber = newRow[6].toString();
            const index = storedData.findIndex(row => row[6].toString() === penumber);
            if (index === -1) {
              // Se o penumber não existe, adiciona a nova linha
              storedData.push(newRow);
            } else {
              // Se já existe, não atualiza a coluna de produção se já estiver com "1" ou "sim"
              const prodIndex = newRow.length - 2;
              const existingProdVal = storedData[index][prodIndex].toString().toLowerCase();
              if (existingProdVal !== "1" && existingProdVal !== "sim") {
                if (
                  newRow[prodIndex].toString().toLowerCase() === "1" ||
                  newRow[prodIndex].toString().toLowerCase() === "sim" ||
                  newRow[prodIndex].toString().toLowerCase() === "0" ||
                  newRow[prodIndex].toString().toLowerCase() === "não"
                ) {
                  storedData[index][prodIndex] = newRow[prodIndex];
                }
              }
              // Se na tabela a coluna 10 já estiver "1" ou "sim", ou se for "0" ou "não", limpa a coluna 11 (promessa)
              if (
                storedData[index][prodIndex].toString().toLowerCase() === "1" ||
                storedData[index][prodIndex].toString().toLowerCase() === "sim" ||
                storedData[index][prodIndex].toString().toLowerCase() === "0" ||
                storedData[index][prodIndex].toString().toLowerCase() === "não"
              ) {
                storedData[index][newRow.length - 1] = "";
              }
            }
          });
          localStorage.setItem("regularizacaoData", JSON.stringify(storedData));
          populateTable(storedData, false);
          excelFileInput.value = "";
        } catch (error) {
          console.error("Erro ao processar o arquivo Excel:", error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  } else {
    console.error("Elemento de upload do Excel não encontrado.");
  }

  // ====== MÓDULO DE EXCLUSÃO DA TABELA (TODOS OS DADOS) ======
  if (deleteBtn) {
    deleteBtn.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja excluir todos os dados da tabela de regularização?")) {
        if (table) {
          const tbody = table.querySelector("tbody");
          if (tbody) {
            tbody.innerHTML = "";
            localStorage.setItem("regularizacaoData", JSON.stringify([]));
            alert("Tabela excluída com sucesso.");
          } else {
            alert("Corpo da tabela não encontrado.");
          }
        } else {
          alert("Tabela de regularização não encontrada.");
        }
      }
    });
  } else {
    console.error("Botão de delete (deleteBtn) não encontrado.");
  }

  // ====== ATUALIZAÇÃO DO DASHBOARD ======
  function updateAtualPercent() {
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const totalRows = rows.length;
    let countSim = 0;
    rows.forEach(row => {
      const cells = row.getElementsByTagName("td");
      if (cells.length >= 2) {
        const prodCell = cells[cells.length - 2];
        if (prodCell && prodCell.textContent.trim().toLowerCase() === "sim") {
          countSim++;
        }
      }
    });
    let percentual = totalRows > 0 ? (countSim / totalRows) * 100 : 0;
    const formattedPercent = percentual.toFixed(2).replace('.', ',') + '%';
    const percentAtualBtn = document.getElementById("percentAtualBtn");
    if (percentAtualBtn) {
      percentAtualBtn.innerText = `% Atual: ${formattedPercent}`;
    }
    const percentualDiv = document.querySelector("div.percentual");
    if (percentualDiv) {
      percentualDiv.textContent = formattedPercent;
    }
    localStorage.setItem('percentualProducao', formattedPercent);
  }

  function updatePromessasPercent() {
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const totalRows = rows.length;
    let countProdSim = 0;
    let countPromessas = 0;
    rows.forEach(row => {
      const cells = row.getElementsByTagName("td");
      if (cells.length >= 2) {
        const prodCell = cells[cells.length - 2];
        const promessaCell = cells[cells.length - 1];
        if (prodCell && prodCell.textContent.trim().toLowerCase() === "sim") {
          countProdSim++;
        }
        if (promessaCell && promessaCell.textContent.trim() !== "" && promessaCell.textContent.trim().toLowerCase() !== "não") {
          countPromessas++;
        }
      }
    });
    const totalCount = countProdSim + countPromessas;
    let percentual = totalRows > 0 ? (totalCount / totalRows) * 100 : 0;
    const formattedPercent = percentual.toFixed(2).replace('.', ',') + '%';
    const percentPromessasBtn = document.getElementById("percentPromessasBtn");
    if (percentPromessasBtn) {
      percentPromessasBtn.innerText = `% Promessas: ${formattedPercent}`;
    }
    localStorage.setItem('percentualPromessas', formattedPercent);
  }

  function updateDashboardStats() {
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const totalRows = rows.length;
    let countProdSim = 0;
    let countPromessas = 0;
    rows.forEach(row => {
      const cells = row.getElementsByTagName("td");
      if (cells.length >= 2) {
        const prodCell = cells[cells.length - 2];
        const promessaCell = cells[cells.length - 1];
        if (prodCell && prodCell.textContent.trim().toLowerCase() === "sim") {
          countProdSim++;
        }
        if (promessaCell && promessaCell.textContent.trim() !== "" && promessaCell.textContent.trim().toLowerCase() !== "não") {
          countPromessas++;
        }
      }
    });
    const totalCasosBtn = document.getElementById("totalCasosBtn");
    if (totalCasosBtn) {
      totalCasosBtn.innerText = `Total de Casos: ${totalRows}`;
    }
    const regularizadosBtn = document.getElementById("regularizadosBtn");
    if (regularizadosBtn) {
      regularizadosBtn.innerText = `Regularizados: ${countProdSim}`;
    }
    const promessasBtn = document.getElementById("promessasBtn");
    if (promessasBtn) {
      promessasBtn.innerText = `Promessas: ${countPromessas}`;
    }
    const expectedRegularizations = Math.ceil(totalRows * 0.75);
    const faltamAtual = Math.max(0, expectedRegularizations - countProdSim);
    const faltamAtualElement = document.getElementById("regularizacaoMonthAtual");
    if (faltamAtualElement) {
      faltamAtualElement.innerText = faltamAtual;
    }
    const faltamPromessasElement = document.getElementById("regularizacaoMonthPromessas");
    if (faltamPromessasElement) {
      faltamPromessasElement.innerText = countPromessas;
    }
  }

  updateAtualPercent();
  updatePromessasPercent();
  updateDashboardStats();

  if (tbody) {
    const observer = new MutationObserver(function () {
      updateAtualPercent();
      updatePromessasPercent();
      updateDashboardStats();
    });
    observer.observe(tbody, { childList: true, subtree: true, characterData: true });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Função para atualizar a porcentagem de "Promessas" (cálculo válido)
  function updatePromessasPercent() {
    const tbody = document.querySelector("#regularizacaoTable tbody");
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const totalRows = rows.length;
    let countProdSim = 0;
    let countPromessas = 0;
    rows.forEach(row => {
      const cells = row.getElementsByTagName("td");
      if (cells.length >= 2) {
        const prodCell = cells[cells.length - 2];
        const promessaCell = cells[cells.length - 1];
        if (prodCell && prodCell.textContent.trim().toLowerCase() === "sim") {
          countProdSim++;
        }
        if (promessaCell && promessaCell.textContent.trim() !== "" && promessaCell.textContent.trim().toLowerCase() !== "não") {
          countPromessas++;
        }
      }
    });
    const totalCount = countProdSim + countPromessas;
    let percentual = totalRows > 0 ? (totalCount / totalRows) * 100 : 0;
    const formattedPercent = percentual.toFixed(2).replace('.', ',') + '%';
    const promessasBtn = document.getElementById("percentPromessasBtn");
    if (promessasBtn) {
      const percentualElement = promessasBtn.querySelector("div.percentual");
      if (percentualElement) {
        percentualElement.innerText = formattedPercent;
      }
    }
    localStorage.setItem('percentualPromessas', formattedPercent);
  }

  updatePromessasPercent();

  const tbody = document.querySelector("#regularizacaoTable tbody");
  if (tbody) {
    const observer = new MutationObserver(function () {
      updatePromessasPercent();
    });
    observer.observe(tbody, { childList: true, subtree: true, characterData: true });
  }
});
