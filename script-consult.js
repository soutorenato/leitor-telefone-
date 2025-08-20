const receitasCampos = [
  "Salário", "Salário conjuge", "Salário outros", "Aposentadoria de familiar",
  "13º salário/Férias", "Bônus anual", "Renda de imóveis alugados", "Resgate de investimentos",
  "Juros de investimentos", "Rendas extras (bicos/temporários)", "Vendas de bens ou objetos", "Outros"
];

const patrimonioCampos = ["Imóvel", "Veículo", "Investimentos"];

const despesasCategorias = {
  "Casa": ["Aluguel", "Financiamento imobiliário", "IPTU", "Condomínio", "Conta de Água", "Conta de Luz", "Conta de Gás", "Mensalista/diarista", "Conta de internet / TV a cabo", "Conta de telefone fixo", "Conta de celular", "Reformas/consertos", "Seguro da casa", "Animais de estimação (ração, tosa, remédios, etc.)", "Outros"],
  "Alimentação": ["Supermercado", "Açougue", "Hortifruti / feira", "Padaria", "Mercearia", "Restaurante do dia a dia", "Outros"],
  "Saúde e Proteção": ["Convênio Médico", "Médico", "Dentista", "Terapeuta", "Medicamentos e tratamentos", "Seguro de Vida", "Outros"],
  "Transporte": ["Financiamento do automóvel", "Combustível", "Lavagens", "Licenciamento", "Seguro", "IPVA", "Mecânico", "Estacionamento", "Multas", "Transporte público", "Outros"],
  "Educação": ["Matrícula", "Mensalidade escolar", "Material didático", "Uniforme", "Perua escolar", "Cursos / ensino de línguas", "Livros", "Outros"],
  "Cuidados Pessoais": ["Higiene pessoal (sabonete, papel higiênico, etc.)", "Barbeiro / cabeleireiro", "Manicure e depilação", "Vestuário", "Calçados", "Acessórios", "Academia", "Lavanderia", "Outros"],
  "Celebrações e compromissos": ["Buffet Festas (aniversário, casamentos, batizados...)", "Presentes", "Aluguel de roupas", "Celebrações no trabalho (amigo secreto, churrasco)", "Celebrações na igreja", "Dízimos e doações", "Outros"],
  "Lazer e viagens": ["Restaurantes no fim de semana", "Passeios/bares/baladas/cafés", "Livraria", "Cinema", "Jogos", "Assinaturas de aplicativos (Spotify, Netflix)", "Viagens", "Outros"],
  "Dívidas": ["Dívidas em atraso ou negociações", "Empréstimos pessoais e consignados", "Financiamentos atrasados", "Juros de Cheque especial", "Rotativo do Cartão", "Empréstimos familiares", "Outros"],
  "Investimentos": ["Investimentos (quanto $ você guarda)", "Previdência", "Poupança", "Renda fixa (CDB, CDI...)", "Fundos", "Outros"]
};

function abrirModal(tipo) {
  const modalContainer = document.getElementById("modal-container");
  let html = '<div class="modal" style="display:flex;"><div class="modal-content">';
  html += '<span class="close" onclick="fecharModal()">&times;</span>';
  html += `<h3>Atualizar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h3>`;

  if (tipo === "receitas") {
    html += "<table>";
    receitasCampos.forEach(campo => {
      html += `<tr><td>${campo}</td><td><input type="number" id="${campo}" value="${localStorage.getItem(campo) || ""}" /></td></tr>`;
    });
    html += "</table>";
    html += `<button onclick="salvarReceitas()">Salvar</button>`;
  }

  if (tipo === "patrimonio") {
    html += "<table>";
    patrimonioCampos.forEach(campo => {
      html += `<tr><td>${campo}</td><td><input type="number" id="${campo}" value="${localStorage.getItem(campo) || ""}" /></td></tr>`;
    });
    html += "</table>";
    html += `<button onclick="salvarPatrimonio()">Salvar</button>`;
  }

  if (tipo === "despesas") {
    html += '<div class="category-buttons">';
    Object.keys(despesasCategorias).forEach(cat => {
      html += `<button onclick="abrirCategoria('${cat}', this)">${cat}</button>`;
    });
    html += '</div>';
    html += '<div id="categoria-form"></div>';
  }

  html += "</div></div>";
  modalContainer.innerHTML = html;
}

function fecharModal() {
  document.getElementById("modal-container").innerHTML = "";
}

function salvarReceitas() {
  let total = 0;
  receitasCampos.forEach(campo => {
    const input = document.getElementById(campo);
    const val = parseFloat(input.value) || 0;
    localStorage.setItem(campo, input.value);
    total += val;
  });
  document.getElementById("valor-receitas").innerText = "R$ " + total.toLocaleString("pt-BR", {minimumFractionDigits: 2});
  localStorage.setItem("receitasTotal", total);
  atualizarGrafico(receitasChart, receitasCampos, receitasCampos.map(c => parseFloat(document.getElementById(c).value) || 0));
  fecharModal();
}

function salvarPatrimonio() {
  let total = 0;
  patrimonioCampos.forEach(campo => {
    const input = document.getElementById(campo);
    const val = parseFloat(input.value) || 0;
    localStorage.setItem(campo, input.value);
    total += val;
  });
  document.getElementById("valor-patrimonio").innerText = "R$ " + total.toLocaleString("pt-BR", {minimumFractionDigits: 2});
  localStorage.setItem("patrimonioTotal", total);
  atualizarGrafico(patrimonioChart, patrimonioCampos, patrimonioCampos.map(c => parseFloat(document.getElementById(c).value) || 0));
  fecharModal();
}

let despesasTotais = {};
function abrirCategoria(cat, btn) {
  document.querySelectorAll(".category-buttons button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const formDiv = document.getElementById("categoria-form");
  let html = "<table>";
  despesasCategorias[cat].forEach(campo => {
    html += `<tr><td>${campo}</td><td><input type="number" id="${campo}" value="${localStorage.getItem(campo) || ""}" /></td></tr>`;
  });
  html += "</table>";
  html += `<button onclick="salvarDespesas('${cat}', this)">Salvar</button>`;
  formDiv.innerHTML = html;
}

function salvarDespesas(cat, btn) {
  let total = 0;
  despesasCategorias[cat].forEach(campo => {
    const input = document.getElementById(campo);
    const val = parseFloat(input.value) || 0;
    localStorage.setItem(campo, input.value);
    total += val;
  });
  despesasTotais[cat] = total;
  localStorage.setItem("despesasTotais", JSON.stringify(despesasTotais));
  btn.classList.add("active");
  btn.style.background = "green";
  btn.style.color = "white";
  btn.style.borderColor = "green";
  const totalGeral = Object.values(despesasTotais).reduce((a,b) => a+b, 0);
  document.getElementById("valor-despesas").innerText = "R$ " + totalGeral.toLocaleString("pt-BR", {minimumFractionDigits: 2});
  atualizarGrafico(despesasChart, Object.keys(despesasTotais), Object.values(despesasTotais));
  fecharModal();
}

function atualizarGrafico(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

let receitasChart, despesasChart, patrimonioChart;

window.onload = function() {
  receitasChart = new Chart(document.getElementById('grafico-receitas'), {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ['#4caf50','#2196f3','#ff9800','#e91e63','#9c27b0','#00bcd4','#ffc107','#8bc34a','#ff5722','#607d8b','#795548','#3f51b5']
      }]
    }
  });
  despesasChart = new Chart(document.getElementById('grafico-despesas'), {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ['#f44336','#e91e63','#9c27b0','#673ab7','#3f51b5','#2196f3','#03a9f4','#00bcd4','#009688','#4caf50','#8bc34a','#cddc39']
      }]
    }
  });
  patrimonioChart = new Chart(document.getElementById('grafico-patrimonio'), {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ['#ff9800','#ff5722','#795548']
      }]
    }
  });

  // Recuperar dados do localStorage
  const receitasSalvas = parseFloat(localStorage.getItem("receitasTotal"));
  if (!isNaN(receitasSalvas)) {
    document.getElementById("valor-receitas").innerText = "R$ " + receitasSalvas.toLocaleString("pt-BR", {minimumFractionDigits: 2});
  }

  const patrimonioSalvo = parseFloat(localStorage.getItem("patrimonioTotal"));
  if (!isNaN(patrimonioSalvo)) {
    document.getElementById("valor-patrimonio").innerText = "R$ " + patrimonioSalvo.toLocaleString("pt-BR", {minimumFractionDigits: 2});
  }

  const despesasSalvas = JSON.parse(localStorage.getItem("despesasTotais"));
  if (despesasSalvas) {
    despesasTotais = despesasSalvas;
    const totalGeral = Object.values(despesasTotais).reduce((a,b) => a+b, 0);
    document.getElementById("valor-despesas").innerText = "R$ " + totalGeral.toLocaleString("pt-BR", {minimumFractionDigits: 2});
  }
};



function enviarEmail() {
  // ---- 1) Ler dados salvos no localStorage ----
  const receitasCamposFixas = [
    "Salário", "Salário conjuge", "Salário outros",
    "Aposentadoria de familiar", "Renda de imóveis alugados", "Juros de investimentos"
  ];
  const receitasCamposVariaveis = [
    "13º salário/Férias", "Bônus anual", "Resgate de investimentos",
    "Rendas extras (bicos/temporários)", "Vendas de bens ou objetos", "Outros"
  ];
  const categoriasDespesas = [
    "Casa","Alimentação","Saúde e Proteção","Transporte","Educação",
    "Cuidados Pessoais","Celebrações e compromissos","Lazer e viagens","Dívidas","Investimentos"
  ];
  const patrimonioCampos = ["Imóvel","Veículo","Investimentos"];

  const soma = arr => arr.reduce((a,b)=>a+b,0);
  const getNum = key => parseFloat(localStorage.getItem(key) || "0");

  const totalFixas = soma(receitasCamposFixas.map(getNum));
  const totalVariaveis = soma(receitasCamposVariaveis.map(getNum));
  const totalReceitas = totalFixas + totalVariaveis;

  const pctFixas = totalReceitas > 0 ? (totalFixas / totalReceitas) : 0;
  const compRenda = pctFixas >= 0.6 ? "fontes fixas" : "fontes variáveis";
  const perfilRenda = pctFixas >= 0.6 ? "estabilidade" : "variação";

  const despesasTotais = JSON.parse(localStorage.getItem("despesasTotais") || "{}");
  const getDespesa = cat => Number(despesasTotais[cat] || 0);
  const mapaDespesas = Object.fromEntries(categoriasDespesas.map(c => [c, getDespesa(c)]));
  const totalDespesas = Object.values(mapaDespesas).reduce((a,b)=>a+b,0);

  const mapaPatrimonio = Object.fromEntries(patrimonioCampos.map(campo => [campo, getNum(campo)]));
  const totalPatrimonio = Object.values(mapaPatrimonio).reduce((a,b)=>a+b,0);

  const BRL = v => `R$ ${Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2, maximumFractionDigits:2})}`;

  // ---- 2) Gráficos como tabela ----
  const imgReceitas   = document.getElementById('grafico-receitas')?.toDataURL?.() || "";
  const imgDespesas   = document.getElementById('grafico-despesas')?.toDataURL?.() || "";
  const imgPatrimonio = document.getElementById('grafico-patrimonio')?.toDataURL?.() || "";

  const tabelaGraficos = (imgReceitas && imgDespesas && imgPatrimonio) ? `
<table style="width:100%; border-collapse:collapse; table-layout:fixed; margin:16px 0;">
  <thead>
    <tr style="background-color:transparent;">
      <th style="text-align:center; padding:8px; font-weight:600;">Receitas</th>
      <th style="text-align:center; padding:8px; font-weight:600;">Despesas</th>
      <th style="text-align:center; padding:8px; font-weight:600;">Patrimônio</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color:transparent;">
      <td style="text-align:center; vertical-align:middle; padding:12px;">
        <img src="${imgReceitas}"   alt="Gráfico de Receitas"   style="max-width:220px; height:auto;">
      </td>
      <td style="text-align:center; vertical-align:middle; padding:12px;">
        <img src="${imgDespesas}"   alt="Gráfico de Despesas"   style="max-width:220px; height:auto;">
      </td>
      <td style="text-align:center; vertical-align:middle; padding:12px;">
        <img src="${imgPatrimonio}" alt="Gráfico de Patrimônio" style="max-width:220px; height:auto;">
      </td>
    </tr>
  </tbody>
</table>` : "";

  // ---- 3) Texto do e-mail ----
  const corpoEmail = `
<p>Olá,</p>

<p>Com base nas informações compartilhadas sobre sua realidade financeira, realizei uma análise inicial considerando suas receitas, despesas e patrimônio. Abaixo, apresento os principais pontos observados para apoiar uma avaliação mais clara e estratégica da sua situação financeira.</p>

${tabelaGraficos}

<p><b>1. Receitas</b></p>
<p>A soma total das receitas está em torno de <b>${BRL(totalReceitas)}</b>, provenientes de diferentes fontes como salário, aposentadoria, bônus, aluguéis, entre outras.</p>
<p>Foi possível identificar que a composição da renda é majoritariamente baseada em <b>${compRenda}</b>, o que indica um perfil de <b>${perfilRenda}</b>. Esse entendimento é fundamental para definir o potencial de economia mensal, investimentos e eventual quitação de dívidas.</p>

<p><b>2. Despesas</b></p>
<p>As despesas mensais somam aproximadamente <b>${BRL(totalDespesas)}</b>, distribuídas da seguinte forma:</p>

<p>
Casa: ${BRL(mapaDespesas["Casa"])}<br>
Alimentação: ${BRL(mapaDespesas["Alimentação"])}<br>
Saúde e Proteção: ${BRL(mapaDespesas["Saúde e Proteção"])}<br>
Transporte: ${BRL(mapaDespesas["Transporte"])}<br>
Educação: ${BRL(mapaDespesas["Educação"])}<br>
Cuidados Pessoais: ${BRL(mapaDespesas["Cuidados Pessoais"])}<br>
Celebrações e Compromissos: ${BRL(mapaDespesas["Celebrações e compromissos"])}<br>
Lazer e Viagens: ${BRL(mapaDespesas["Lazer e viagens"])}<br>
Dívidas: ${BRL(mapaDespesas["Dívidas"])}<br>
Investimentos: ${BRL(mapaDespesas["Investimentos"])}
</p>

<p><b>3. Patrimônio</b></p>
<p>
Imóvel: ${BRL(mapaPatrimonio["Imóvel"])}<br>
Veículo: ${BRL(mapaPatrimonio["Veículo"])}<br>
Investimentos: ${BRL(mapaPatrimonio["Investimentos"])}<br>
<b>Total estimado:</b> ${BRL(totalPatrimonio)}
</p>

<p><b>Recomendações iniciais:</b></p>
<ul>
  <li>Definir um orçamento mensal com metas claras de economia.</li>
  <li>Construir ou reforçar a reserva de emergência.</li>
  <li>Avaliar os gastos recorrentes e identificar oportunidades de otimização.</li>
  <li>Redirecionar sobras de receita para investimentos alinhados ao perfil financeiro.</li>
  <li>Reduzir ou eliminar dívidas que impactem negativamente o fluxo mensal.</li>
</ul>

<p>Caso queira aprofundar esta análise ou traçar um plano de ação personalizado, fico à disposição para continuar com o acompanhamento.</p>

<p>Atenciosamente,</p>
`;

  // ---- 4) Janela com copiar/Outlook ----
  const mailto = `mailto:?subject=Consultoria Financeira&body=${encodeURIComponent('Cole o conteúdo copiado no corpo do e-mail.')}`;
  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>Copiar análise para e-mail</title></head>
    <body>
      <h2>Copie e cole o conteúdo abaixo no corpo do e-mail:</h2>
      ${corpoEmail}
      <p style="margin-top:16px;">
        <button onclick="copiarConteudo()">Copiar conteúdo</button>
        <a href="${mailto}" target="_blank"><button>Abrir Outlook</button></a>
      </p>
      <script>
        function copiarConteudo() {
          navigator.clipboard.write([
            new ClipboardItem({
              'text/html': new Blob([\`${corpoEmail}\`], { type: 'text/html' })
            })
          ]).then(() => {
            alert('Conteúdo copiado! Agora cole no e-mail com Ctrl+V.');
          }).catch(() => {
            alert('Não foi possível copiar. Verifique permissões do navegador (HTTPS é necessário).');
          });
        }
      </script>
    </body></html>
  `);
}