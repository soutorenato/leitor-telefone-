// scriptSalvar.js
document.addEventListener("DOMContentLoaded", () => {
  // Check for or create a timer display element
  let timerDisplay = document.getElementById("timerDisplay");
  if (!timerDisplay) {
    timerDisplay = document.createElement("div");
    timerDisplay.id = "timerDisplay";
    timerDisplay.textContent = "00:00:00";
    document.body.prepend(timerDisplay);
  }

  // Create the export button
  const exportButton = document.createElement("button");
  exportButton.id = "exportAllExcel";
  exportButton.className = "btn btn-primary btn-sm ms-2";
  exportButton.textContent = "Salvar Excel";
  timerDisplay.insertAdjacentElement("afterend", exportButton);

  exportButton.addEventListener("click", () => {
    // Retrieve the sales data from localStorage (assumes sales are stored under "vendasData")
    const salesData = JSON.parse(localStorage.getItem("vendasData")) || [];

    // Filter the sales data based on the atendimento field
    const vendaData = salesData.filter(item => item.atendimento === "Venda");
    const pipelineData = salesData.filter(item => item.atendimento === "Pipeline");
    const leadData = salesData.filter(item => item.atendimento === "Lead");

    // Get the Regularização table from the DOM (if exists)
    const regTable = document.getElementById("regularizacaoTable");

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create and append sheets for Venda, Pipeline and Lead using JSON to sheet conversion
    const sheetVenda = XLSX.utils.json_to_sheet(vendaData);
    const sheetPipeline = XLSX.utils.json_to_sheet(pipelineData);
    const sheetLead = XLSX.utils.json_to_sheet(leadData);

    XLSX.utils.book_append_sheet(wb, sheetVenda, "Venda");
    XLSX.utils.book_append_sheet(wb, sheetPipeline, "Pipeline");
    XLSX.utils.book_append_sheet(wb, sheetLead, "Lead");

    // For Regularização, if the DOM element exists, convert it; otherwise, add an empty sheet.
    if (regTable) {
      const sheetReg = XLSX.utils.table_to_sheet(regTable);
      XLSX.utils.book_append_sheet(wb, sheetReg, "Regularização");
    } else {
      const sheetReg = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(wb, sheetReg, "Regularização");
    }

    // Write workbook to an array buffer and trigger the download of the Excel file
    const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([arrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "dados_exportados.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  });
});	