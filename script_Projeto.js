/* ===========================================================
   UTILITÁRIOS GERAIS
=========================================================== */
function formatBRL(v){
  return "R$ " + (Number(v||0)).toLocaleString("pt-BR",{minimumFractionDigits:2, maximumFractionDigits:2});
}
function parseValorBR(v){
  if (typeof v === "number") return v;
  const s = String(v||"").replace(/\s/g,"").replace(/^r\$\s?/i,"").replace(/\./g,"").replace(",",".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
function norm(s){
  return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
}

/* ===========================================================
   DADOS DO FORMULÁRIO
=========================================================== */
const RECEITAS_FIXAS = [
  "Salário","Salário conjuge","Salário outros",
  "Aposentadoria de familiar","Renda de imóveis alugados","Juros de investimentos"
];
const RECEITAS_VARIAVEIS = [
  "13º salário/Férias","Bônus anual","Resgate de investimentos",
  "Rendas extras (bicos/temporários)","Vendas de bens ou objetos","Outros"
];
const receitasCampos = [...RECEITAS_FIXAS, ...RECEITAS_VARIAVEIS];

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

/* ===========================================================
   PLUGIN: TEXTO NO CENTRO DOS DONUTS (Chart.js)
=========================================================== */
(function registerCenterTextPlugin(){
  function doRegister(){
    if (!window.Chart || window.__centerTextRegistered) return;
    const CenterTextPlugin = {
      id: 'centerText',
      afterDraw(chart) {
        const opts = chart?.options?.plugins?.centerText;
        if (!opts || !opts.text) return;

        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const x = (chartArea.left + chartArea.right) / 2;
        const y = (chartArea.top + chartArea.bottom) / 2;

        const family = opts.fontFamily || getComputedStyle(document.body).fontFamily || 'Inter, sans-serif';
        const mainSize = opts.fontSize || 18;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = opts.color || '#495057';
        ctx.font = `${opts.fontWeight || 700} ${mainSize}px ${family}`;
        ctx.fillText(String(opts.text), x, y);

        if (opts.subtext) {
          ctx.fillStyle = opts.subColor || '#878a99';
          ctx.font = `400 ${Math.round(mainSize * 0.7)}px ${family}`;
          ctx.fillText(String(opts.subtext), x, y + mainSize * 0.9);
        }
        ctx.restore();
      }
    };
    Chart.register(CenterTextPlugin);
    window.__centerTextRegistered = true;
  }
  if (window.Chart) doRegister();
  else window.addEventListener('load', doRegister);
})();

/* ===========================================================
   MODAIS (RECEITAS / DESPESAS / PATRIMÔNIO)
=========================================================== */
function abrirModal(tipo) {
  const modalContainer = document.getElementById("modal-container");
  let html = '<div class="modal" style="display:flex;"><div class="modal-content">';
  html += '<button class="close" onclick="fecharModal()" aria-label="Fechar">&times;</button>';
  html += `<h3 style="margin-bottom:8px">Atualizar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h3>`;

  if (tipo === "receitas") {
    html += "<table>";
    receitasCampos.forEach(campo => {
      html += `<tr><td>${campo}</td><td><input type="number" step="0.01" id="${campo}" value="${localStorage.getItem(campo) || ""}" /></td></tr>`;
    });
    html += "</table>";
    html += `<button onclick="salvarReceitas()">Salvar</button>`;
  }

  if (tipo === "patrimonio") {
    html += "<table>";
    patrimonioCampos.forEach(campo => {
      html += `<tr><td>${campo}</td><td><input type="number" step="0.01" id="${campo}" value="${localStorage.getItem(campo) || ""}" /></td></tr>`;
    });
    html += "</table>";
    html += `<button onclick="salvarPatrimonio()">Salvar</button>`;
  }

  if (tipo === "despesas") {
    html += '<div class="category-buttons" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">';
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

/* ===========================================================
   SALVAR FORMULÁRIOS
=========================================================== */
function salvarReceitas() {
  let total = 0;
  receitasCampos.forEach(campo => {
    const input = document.getElementById(campo);
    const val = parseFloat(input?.value) || 0;
    if (input && input.value === "") localStorage.removeItem(campo); else localStorage.setItem(campo, input?.value ?? "");
    total += val;
  });
  localStorage.setItem("receitasTotal", total);

  window.refreshReceitasDonut?.();
  window.updateTopWidgets?.();
  window.syncInsightsToPanel?.();
  window.notifyDataChanged?.();

  fecharModal();
}

function salvarPatrimonio() {
  let total = 0;
  patrimonioCampos.forEach(campo => {
    const input = document.getElementById(campo);
    const val = parseFloat(input?.value) || 0;
    if (input && input.value === "") localStorage.removeItem(campo); else localStorage.setItem(campo, input?.value ?? "");
    total += val;
  });
  localStorage.setItem("patrimonioTotal", total);

  window.refreshPatrimonioDonut?.();
  window.updateTopWidgets?.();
  window.atualizarCard4Diagnostico?.();
  window.syncInsightsToPanel?.();
  window.notifyDataChanged?.();

  fecharModal();
}

let despesasTotais = {};
function abrirCategoria(cat, btn) {
  document.querySelectorAll(".category-buttons button").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  const formDiv = document.getElementById("categoria-form");
  let html = "<table>";
  despesasCategorias[cat].forEach(campo => {
    const key = `${cat}:${campo}`;
    const v = localStorage.getItem(key) ?? localStorage.getItem(campo) ?? "";
    html += `<tr><td>${campo}</td><td><input type="number" step="0.01" id="${key}" value="${v}" /></td></tr>`;
  });
  html += "</table>";
  html += `<button onclick="salvarDespesas('${cat}', this)">Salvar</button>`;
  formDiv.innerHTML = html;
}

function salvarDespesas(cat, btn) {
  // carrega o agregado atual
  try { despesasTotais = JSON.parse(localStorage.getItem("despesasTotais") || "{}"); } catch { despesasTotais = {}; }

  // detalhado
  let detalhadas = {};
  try { detalhadas = JSON.parse(localStorage.getItem("despesasDetalhadas") || "{}"); } catch { detalhadas = {}; }
  detalhadas[cat] = detalhadas[cat] || {};

  let total = 0;
  despesasCategorias[cat].forEach(campo => {
    const key = `${cat}:${campo}`;
    const input = document.getElementById(key);
    const val = parseFloat(input?.value) || 0;

    // mantém valores em branco realmente limpos
    if (input && input.value === "") {
      localStorage.removeItem(key);
      delete detalhadas[cat][campo];
    } else {
      localStorage.setItem(key, input?.value ?? "");
      detalhadas[cat][campo] = input?.value ?? "";
    }
    total += val;
  });

  despesasTotais[cat] = total;
  localStorage.setItem("despesasTotais", JSON.stringify(despesasTotais));
  localStorage.setItem("despesasDetalhadas", JSON.stringify(detalhadas));

  // feedback visual opcional
  if (btn) {
    btn.classList.add("active");
    btn.style.background = "green";
    btn.style.color = "white";
    btn.style.borderColor = "green";
    setTimeout(()=>{ if(btn){ btn.removeAttribute("style"); btn.classList.remove("active"); }}, 900);
  }

  window.refreshDespesasDonut?.();
  window.updateTopWidgets?.();
  window.atualizarCard4Diagnostico?.();
  window.syncInsightsToPanel?.();
  window.refreshNotifications?.();
  window.notifyDataChanged?.();

  fecharModal();
}

/* ===========================================================
   WIDGETS SUPERIORES (4 cards)
=========================================================== */
function getTotalReceitasLS(){
  const ag = localStorage.getItem("receitasTotal");
  if (ag!=null && ag!=="") return parseValorBR(ag);
  // Fallback: somar campos
  return receitasCampos.reduce((acc,k)=> acc + parseValorBR(localStorage.getItem(k)), 0);
}
function getTotalDespesasLS(){
  try{
    const tot = JSON.parse(localStorage.getItem("despesasTotais")||"{}");
    return Object.values(tot).reduce((a,b)=> a + parseValorBR(b), 0);
  }catch{ return 0; }
}
function getTotalPatrimonioLS(){
  const t = localStorage.getItem("patrimonioTotal");
  if (t!=null && t!=="") return parseValorBR(t);
  return patrimonioCampos.reduce((acc,k)=> acc + parseValorBR(localStorage.getItem(k)), 0);
}
function animateCurrency(el, toValue, duration=900){
  if (!el) return;
  const startText = (el.textContent||"").replace(/[^\d,.-]/g,"").replace(/\./g,"").replace(",",".");
  const start = isNaN(parseFloat(startText)) ? 0 : parseFloat(startText);
  const t0 = performance.now();
  const fmt = new Intl.NumberFormat("pt-BR",{minimumFractionDigits:2, maximumFractionDigits:2});
  function step(t){
    const p = Math.min(1, (t - t0)/duration);
    const val = start + (toValue - start)*p;
    el.textContent = "R$ " + fmt.format(val);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function animateInt(el, toValue, duration=800){
  if (!el) return;
  const start = parseInt((el.textContent||"").replace(/\D/g,"")||"0",10);
  const t0 = performance.now();
  function step(t){
    const p = Math.min(1,(t - t0)/duration);
    el.textContent = Math.round(start + (toValue - start)*p);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function updateTopWidgets(){
  animateCurrency(document.getElementById("stat-receitas"), getTotalReceitasLS());
  animateCurrency(document.getElementById("stat-despesas"), getTotalDespesasLS());
  animateCurrency(document.getElementById("stat-patrimonio"), getTotalPatrimonioLS());
  animateInt(document.getElementById("stat-diagnosticos"), contarDiagnosticosAtivos());
}

/* ===========================================================
   DIAGNÓSTICOS + INSIGHTS + NOTIFICAÇÕES
=========================================================== */
function getDet(){ try{ return JSON.parse(localStorage.getItem("despesasDetalhadas")||"{}"); }catch{ return {}; } }
function lerCasaItem(nome){
  const det = getDet();
  if (det?.Casa && det.Casa[nome]!=null) return parseValorBR(det.Casa[nome]);
  const v = localStorage.getItem("Casa:"+nome) ?? localStorage.getItem(nome);
  return parseValorBR(v);
}
function lerCatItem(cat,item){
  const det = getDet();
  for (const [nomeCat, itens] of Object.entries(det||{})){
    if (norm(nomeCat)===norm(cat)){
      for (const [lbl, raw] of Object.entries(itens||{})){
        if (norm(lbl)===norm(item)) return parseValorBR(raw);
      }
    }
  }
  const k1 = `${cat}:${item}`, k2 = `${norm(cat)}:${item}`, k3 = `${cat}:${norm(item)}`;
  return parseValorBR(localStorage.getItem(k1) || localStorage.getItem(k2) || localStorage.getItem(k3) || localStorage.getItem(item));
}
function contarDiagnosticosAtivos(){
  let n = 0;
  const luz = lerCasaItem("Conta de Luz");
  if (luz >= 250) n++;
  const segCasa = lerCasaItem("Seguro da casa");
  if (segCasa === 0) n++;
  const segVida = lerCatItem("Saúde e Proteção", "Seguro de Vida");
  if (segVida === 0) n++;
  const combust = lerCatItem("Transporte", "Combustível") || lerCatItem("Transporte", "Combustivel");
  if (combust > 0) n++;
  const presentes = lerCatItem("Celebrações e compromissos", "Presentes") || lerCatItem("Celebracoes e compromissos","Presentes");
  if (presentes > 0) n++;
  return n;
}

function obterValorContaDeLuz() {
  let v = localStorage.getItem("Conta de Luz");
  if (v != null) return parseFloat(v) || 0;
  v = localStorage.getItem("Casa:Conta de Luz");
  if (v != null) return parseFloat(v) || 0;
  try {
    const det = JSON.parse(localStorage.getItem("despesasDetalhadas") || "{}");
    if (det?.Casa && det.Casa["Conta de Luz"] != null) {
      return parseFloat(det.Casa["Conta de Luz"]) || 0;
    }
  } catch (_) {}
  return 0;
}
function obterValorSeguroDaCasa() {
  let v = localStorage.getItem("Seguro da casa");
  if (v != null && v !== "") return parseValorBR(v);
  const alternativas = ["Seguro da Casa", "Casa:Seguro da casa", "Casa:Seguro da Casa"];
  for (const k of alternativas) {
    v = localStorage.getItem(k);
    if (v != null && v !== "") return parseValorBR(v);
  }
  return 0;
}
function obterValorAnimaisEstimacao() {
  const key = "Animais de estimação (ração, tosa, remédios, etc.)";
  let v = localStorage.getItem(key);
  if (v != null && v !== "") return parseValorBR(v);
  v = localStorage.getItem("Casa:" + key);
  if (v != null && v !== "") return parseValorBR(v);
  try {
    const det = JSON.parse(localStorage.getItem("despesasDetalhadas") || "{}");
    for (const categoria of Object.values(det || {})) {
      for (const [label, raw] of Object.entries(categoria || {})) {
        const L = norm(label);
        if (L.startsWith("animais de estimacao")) {
          const n = parseValorBR(raw);
          if (n > 0) return n;
        }
      }
    }
  } catch {}
  return 0;
}
function getCategoria(det, nomeAlvo) {
  const alvo = norm(nomeAlvo);
  for (const [nome, obj] of Object.entries(det || {})) {
    if (norm(nome) === alvo) return obj || {};
  }
  return {};
}
function getDespesasDetalhadas() {
  try { return JSON.parse(localStorage.getItem("despesasDetalhadas") || "{}"); }
  catch { return {}; }
}
function obterValorSeguroDeVida() {
  const det = getDespesasDetalhadas();
  const catSaude = getCategoria(det, "Saúde e Proteção");
  for (const [label, raw] of Object.entries(catSaude||{})) {
    const L = norm(label);
    if (L === "seguro de vida" || (L.includes("seguro") && L.includes("vida"))) {
      return parseValorBR(raw);
    }
  }
  const chaves = ["Saúde e Proteção:Seguro de Vida","Saude e Protecao:Seguro de Vida","Seguro de Vida"];
  for (const k of chaves) {
    const v = localStorage.getItem(k);
    if (v != null && v !== "") return parseValorBR(v);
  }
  return 0;
}
function obterTotalPatrimonio() {
  try {
    const pat = JSON.parse(localStorage.getItem("patrimonioDetalhado") || "{}");
    if (pat && typeof pat === "object" && Object.keys(pat).length) {
      return Object.values(pat).reduce((acc, v) => acc + parseValorBR(v), 0);
    }
  } catch {}
  let total = 0;
  for (const k of patrimonioCampos) {
    const v = localStorage.getItem(k);
    if (v != null && v !== "") total += parseValorBR(v);
  }
  return total;
}
function obterTotalDespesasCAE() {
  try {
    const tot = JSON.parse(localStorage.getItem("despesasTotais") || "{}");
    if (tot && typeof tot === "object" && Object.keys(tot).length) {
      const somaTotais =
        parseValorBR(tot["Casa"]) +
        (tot["Alimentação"] != null ? parseValorBR(tot["Alimentação"]) : parseValorBR(tot["Alimentacao"])) +
        (tot["Educação"]   != null ? parseValorBR(tot["Educação"])   : parseValorBR(tot["Educacao"]));
      if (somaTotais > 0) return somaTotais;
    }
  } catch {}
  try {
    const det = JSON.parse(localStorage.getItem("despesasDetalhadas") || "{}");
    const categoriasAlvo = ["Casa", "Alimentação", "Alimentacao", "Educação", "Educacao"].map(norm);
    let total = 0;
    for (const [nomeCat, itens] of Object.entries(det || {})) {
      if (!categoriasAlvo.includes(norm(nomeCat))) continue;
      for (const val of Object.values(itens || {})) total += parseValorBR(val);
    }
    if (total > 0) return total;
  } catch {}
  let totalPrefixos = 0;
  const prefixos = ["Casa:", "Alimentação:", "Alimentacao:", "Educação:", "Educacao:"];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i) || "";
    if (prefixos.some(p => k.startsWith(p))) {
      totalPrefixos += parseValorBR(localStorage.getItem(k));
    }
  }
  return totalPrefixos;
}
function arredondarParaCimaMultiplo(valor, multiplo) {
  if (multiplo <= 0) return valor;
  return Math.ceil((valor || 0) / multiplo) * multiplo;
}

/* chips no card + fonte invisível para painel lateral */
function ensureDiagSource(){
  let el = document.getElementById('diagnostico-source');
  if (!el) {
    el = document.createElement('div');
    el.id = 'diagnostico-source';
    el.style.display = 'none';
    document.body.appendChild(el);
  }
  return el;
}

function atualizarCard4Diagnostico() {
  const valorLuz         = obterValorContaDeLuz();
  const valorSeguroCasa  = obterValorSeguroDaCasa();
  const valorPet         = obterValorAnimaisEstimacao();
  const valorSeguroVida  = obterValorSeguroDeVida();
  const valorCombustivel = lerCatItem("Transporte", "Combustível") || lerCatItem("Transporte","Combustivel");
  const valorPresentes   = lerCatItem("Celebrações e compromissos", "Presentes") || lerCatItem("Celebracoes e compromissos","Presentes");

  const chips = [];

  if (valorLuz >= 250) {
    const economia10 = valorLuz * 0.10;
    const economia15 = valorLuz * 0.15;
    chips.push(`
      <div class="indicacao" data-type="diag">
        <button type="button" class="chip-produto">FIT Energia</button>
        <div class="tooltip">Conta de energia <b>${formatBRL(valorLuz)}</b>. Economia estimada: <b>${formatBRL(economia10)}</b> a <b>${formatBRL(economia15)}</b>/mês.</div>
      </div>`);
  }
  if (valorSeguroCasa === 0) {
    chips.push(`
      <div class="indicacao" data-type="diag">
        <button type="button" class="chip-produto">Seguro Residencial</button>
        <div class="tooltip">${valorPet > 0
          ? "Possui custos com moradia. Considere seguro residencial e as assistências Pet."
          : "Possui custos com moradia. Considere seguro residencial."}
        </div>
      </div>`);
  }
  if (valorSeguroVida === 0) {
    const totalPatrimonio   = obterTotalPatrimonio();
    const totalDespesasCAE  = obterTotalDespesasCAE();
    const capitalBase       = (totalPatrimonio * 0.10) + (totalDespesasCAE * 60);
    const capitalSugerido   = arredondarParaCimaMultiplo(capitalBase, 50000);
    chips.push(`
      <div class="indicacao" data-type="diag">
        <button type="button" class="chip-produto">Seguro Vida</button>
        <div class="tooltip">Capital sugerido: <b>${formatBRL(capitalSugerido)}</b> (com base em despesas e patrimônio).</div>
      </div>`);
  }
  if (valorCombustivel > 0) {
    chips.push(`
      <div class="indicacao" data-type="insight">
        <button type="button" class="chip-produto">Auto Compara</button>
        <div class="tooltip">Agende o vencimento do seguro auto.</div>
      </div>`);
  }
  if (valorPresentes > 0) {
    chips.push(`
      <div class="indicacao" data-type="insight">
        <button type="button" class="chip-produto">Esfera</button>
        <div class="tooltip">Descontos para presentes nas lojas parceiras do Esfera.</div>
      </div>`);
  }

  const src = ensureDiagSource();
  src.innerHTML = chips.length ? chips.join('') : '<p class="sem-indicacao">Nenhuma indicação no momento.</p>';

  window.syncInsightsToPanel?.();
}

/* ===== Central de Notificações ===== */
function collectNotifications() {
  const container = ensureDiagSource();
  const items = Array.from(container.querySelectorAll('.indicacao'));
  const all = [];
  for (const it of items) {
    const type = it.getAttribute('data-type') || 'insight';
    const title = it.querySelector('.chip-produto')?.textContent?.trim() || 'Notificação';
    const body = it.querySelector('.tooltip')?.textContent?.trim() || '';
    all.push({type, title, body});
  }

  // insights “genéricos” se tudo estiver zerado
  if (getTotalReceitasLS() === 0) all.push({type:'insight', title:'Comece pelas Receitas', body:'Informe suas fontes para liberar os gráficos.'});
  if (getTotalDespesasLS() === 0) all.push({type:'insight', title:'Registre as Despesas', body:'Classifique gastos para ver oportunidades.'});
  if (getTotalPatrimonioLS() === 0) all.push({type:'insight', title:'Patrimônio', body:'Liste bens e investimentos para acompanhar evolução.'});

  const diag = all.filter(n => n.type === 'diag');
  const insights = all.filter(n => n.type === 'insight');

  return { all, diag, insights };
}

function renderNotificationsDropdown() {
  const { all, diag, insights } = collectNotifications();

  const ulAll = document.getElementById('notif-list-all');
  const ulD   = document.getElementById('notif-list-diag');
  const ulI   = document.getElementById('notif-list-insights');

  const makeLi = (n)=>(
    `<li class="list-item">
      <div class="list-row">
        <div class="list-left">
          <span class="avatar-xs"><i class="${n.type==='diag'?'ri-alert-line':'ri-lightbulb-flash-line'}"></i></span>
          <div class="list-text">
            <h6 class="mb-1">${n.title}</h6>
            <p class="mb-0">${n.body}</p>
          </div>
        </div>
      </div>
    </li>`
  );

  if (ulAll) ulAll.innerHTML = all.length ? all.map(makeLi).join('') : '<li class="list-item"><div class="list-row"><div class="list-left"><div class="list-text"><p class="mb-0">Sem notificações.</p></div></div></div></li>';
  if (ulD)   ulD.innerHTML   = diag.length ? diag.map(makeLi).join('') : '<li class="list-item"><div class="list-row"><div class="list-left"><div class="list-text"><p class="mb-0">Sem diagnósticos.</p></div></div></div></li>';
  if (ulI)   ulI.innerHTML   = insights.length ? insights.map(makeLi).join('') : '<li class="list-item"><div class="list-row"><div class="list-left"><div class="list-text"><p class="mb-0">Sem insights.</p></div></div></div></li>';

  // badges
  const b1 = document.getElementById('notif-badge');
  const b2 = document.getElementById('notif-badge-total');
  const cAll = document.getElementById('notif-count-all');
  const cD   = document.getElementById('notif-count-diag');
  const cI   = document.getElementById('notif-count-insights');

  if (cAll) cAll.textContent = String(all.length);
  if (cD)   cD.textContent   = String(diag.length);
  if (cI)   cI.textContent   = String(insights.length);
  if (b1)   b1.textContent   = String(all.length);
  if (b2)   b2.textContent   = `${all.length} novas`;
}

window.refreshNotifications = renderNotificationsDropdown;

/* ===========================================================
   PAINEL LATERAL (espelha chips)
=========================================================== */
(function(){
  const BTN_ID = 'btn-rightside';
  const PANEL_ID = 'rightside-panel';
  const BACKDROP_ID = 'rightside-backdrop';

  function ensureRightside(){
    if (document.getElementById(PANEL_ID)) return;
    const backdrop = document.createElement('div');
    backdrop.id = BACKDROP_ID; backdrop.className = 'rightside-backdrop';
    const panel = document.createElement('aside');
    panel.id = PANEL_ID; panel.className = 'rightside-panel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true');
    panel.innerHTML = `
      <div class="rightside-header">
        <div class="rightside-title">Painel lateral</div>
        <button type="button" class="rightside-close" aria-label="Fechar">&times;</button>
      </div>
      <div class="rightside-body" id="rightside-content"></div>`;
    const close = ()=>{ panel.classList.remove('open'); backdrop.classList.remove('show'); setBtnExpanded(false); };
    backdrop.addEventListener('click', close);
    panel.querySelector('.rightside-close').addEventListener('click', close);
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') close(); });
    document.body.append(backdrop, panel);
  }
  function getPanel(){ return document.getElementById(PANEL_ID); }
  function getBackdrop(){ return document.getElementById(BACKDROP_ID); }
  function openRightside(){ ensureRightside(); getPanel().classList.add('open'); getBackdrop().classList.add('show'); setBtnExpanded(true); }
  function toggleRightside(){ const p=getPanel(); if (!p || !p.classList.contains('open')) openRightside(); else { p.classList.remove('open'); getBackdrop().classList.remove('show'); setBtnExpanded(false);} }
  function setBtnExpanded(v){ const btn=document.getElementById(BTN_ID); if (btn) btn.setAttribute('aria-expanded', v?'true':'false'); }

  function collectInsightsHTML(){
    const src = document.getElementById('diagnostico-source');
    if (!src) return '<p class="sem-indicacao">Nenhuma indicação no momento.</p>';
    const chips = Array.from(src.querySelectorAll('.indicacao'));
    if (!chips.length) return '<p class="sem-indicacao">Nenhuma indicação no momento.</p>';
    return chips.map(ch => {
      const label = ch.querySelector('.chip-produto')?.textContent?.trim() || 'Produto';
      const tipHtml = ch.querySelector('.tooltip')?.innerHTML || '';
      return `
        <div class="insight-item" style="border-bottom:1px solid #e9ebec;padding:10px 0;">
          <div style="font-weight:600;color:#495057">${label}</div>
          <div style="color:#64748b;font-size:13px;margin-top:4px;">${tipHtml}</div>
        </div>`;
    }).join('');
  }

  function syncInsightsToPanel(){
    ensureRightside();
    const body = document.getElementById('rightside-content');
    if (!body) return;
    body.innerHTML = `<h4 style="margin:0 0 8px 0;font-size:14px;color:#495057;font-weight:600;">Insights</h4>${collectInsightsHTML()}`;
  }
  function attachObserver(){
    const mo = new MutationObserver(syncInsightsToPanel);
    mo.observe(document.body, { childList:true, subtree:true });
  }
  document.addEventListener('DOMContentLoaded', () => {
    ensureRightside();
    const btn = document.getElementById(BTN_ID);
    if (btn) btn.addEventListener('click', toggleRightside);
    attachObserver();
    syncInsightsToPanel();
  });

  window.syncInsightsToPanel = syncInsightsToPanel;
})();

/* ===========================================================
   DONUTS “COMPOSIÇÃO”
=========================================================== */
/* --- Receitas --- */
function lerReceitasDetalhadas(filtro='todas'){
  let campos = [];
  if (filtro === 'fixas') campos = RECEITAS_FIXAS;
  else if (filtro === 'variaveis') campos = RECEITAS_VARIAVEIS;
  else campos = [...RECEITAS_FIXAS, ...RECEITAS_VARIAVEIS];

  const itens = [];
  for (const k of campos) {
    const n = parseValorBR(localStorage.getItem(k));
    if (n > 0) itens.push({ label: k, valor: n });
  }
  return itens;
}
function topComOutras(itens, N = 8){
  if (itens.length <= N) return itens;
  const ordenado = [...itens].sort((a,b)=> b.valor - a.valor);
  const top = ordenado.slice(0, N);
  const resto = ordenado.slice(N);
  const somaResto = resto.reduce((acc, it)=> acc + it.valor, 0);
  if (somaResto > 0) top.push({ label: "Outras", valor: somaResto });
  return top;
}
let chartReceitasDonut = null;
function renderReceitasDonut(filtro='todas'){
  const elCanvas = document.getElementById('donut-receitas');
  const elLista  = document.getElementById('lista-receitas');
  if (!elCanvas || !elLista) return;

  const itens = topComOutras( lerReceitasDetalhadas(filtro), 8 );
  const total = itens.reduce((a,b)=> a+b.valor, 0);

  elLista.innerHTML = '';
  if (chartReceitasDonut) { try{ chartReceitasDonut.destroy(); }catch{} chartReceitasDonut = null; }

  if (!total || !itens.length){
    elLista.innerHTML = `
      <li class="list-item">
        <div class="list-row">
          <div class="list-left">
            <span class="avatar-xs"><i class="ri-error-warning-line"></i></span>
            <div class="list-text">
              <h6>Nenhuma receita informada</h6>
              <p class="mb-0">Preencha o formulário para ver a composição.</p>
            </div>
          </div>
        </div>
      </li>`;
    if (window.Chart){
      chartReceitasDonut = new Chart(elCanvas.getContext('2d'), {
        type: 'doughnut',
        data: { labels: ["Sem dados"], datasets: [{ data: [1] }] },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '65%', radius: '92%',
          plugins: { legend:{display:false}, centerText:{ text: formatBRL(0), subtext:'Total', fontSize:16 } }
        }
      });
    }
    return;
  }

  const labels = itens.map(i => i.label);
  const data   = itens.map(i => i.valor);

  if (window.Chart) {
    chartReceitasDonut = new Chart(elCanvas.getContext('2d'), {
      type: 'doughnut',
      data: { labels, datasets: [{ data, borderWidth: 0 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '65%', radius: '92%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => {
            const val = ctx.parsed || 0;
            const pct = total ? (val/total*100) : 0;
            return `${formatBRL(val)} (${pct.toFixed(1)}%)`;
          }}},
          centerText: { text: formatBRL(total), subtext: 'Total', fontSize: 16 }
        }
      }
    });
  }

  itens.forEach(it => {
    const pct = total ? (it.valor/total*100) : 0;
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `
      <div class="list-row">
        <div class="list-left">
          <span class="avatar-xs"><i class="ri-bank-card-line"></i></span>
          <div class="list-text">
            <h6 class="mb-1">${it.label}</h6>
            <p class="mb-0"></p>
          </div>
        </div>
        <div class="list-right">
          <div class="val">${formatBRL(it.valor)}</div>
          <div class="pct ${pct>0 ? 'up' : 'neutral'}">${pct.toFixed(1)}%</div>
        </div>
      </div>`;
    elLista.appendChild(li);
  });
}

/* --- Despesas --- */
const DESPESAS_CATEGORIAS = Object.keys(despesasCategorias);
const DESPESAS_ESSENCIAIS = ["Casa","Alimentação","Saúde e Proteção","Transporte","Educação","Dívidas"];
const DESPESAS_VARIAVEIS  = ["Cuidados Pessoais","Celebrações e compromissos","Lazer e viagens","Investimentos"];

function getDespesasTotais(){ try { return JSON.parse(localStorage.getItem("despesasTotais") || "{}"); } catch { return {}; } }
function getSomaCategoriaFromDetalhadas(categoria){
  try {
    const det = JSON.parse(localStorage.getItem("despesasDetalhadas") || "{}");
    const mapa = det && det[categoria];
    if (!mapa || typeof mapa !== "object") return 0;
    return Object.values(mapa).reduce((acc, raw)=> acc + parseValorBR(raw), 0);
  } catch { return 0; }
}
function lerDespesasPorCategoria(filtro='todas'){
  const base = filtro === 'essenciais' ? DESPESAS_ESSENCIAIS : filtro === 'variaveis' ? DESPESAS_VARIAVEIS : DESPESAS_CATEGORIAS;
  const totais = getDespesasTotais();
  const itens = [];
  for (const cat of base) {
    let n = 0;
    if (Object.prototype.hasOwnProperty.call(totais, cat)) n = parseValorBR(totais[cat]);
    else n = getSomaCategoriaFromDetalhadas(cat);
    if (n > 0) itens.push({ label: cat, valor: n });
  }
  return itens;
}
function topComOutrasDespesas(itens, N = 8){
  if (itens.length <= N) return itens;
  const sorted = [...itens].sort((a,b)=> b.valor - a.valor);
  const top = sorted.slice(0, N);
  const resto = sorted.slice(N);
  const somaResto = resto.reduce((acc, it)=> acc + it.valor, 0);
  if (somaResto > 0) top.push({ label: "Outras", valor: somaResto });
  return top;
}
let chartDespesasDonut = null;
function renderDespesasDonut(filtro='todas'){
  const elCanvas = document.getElementById('donut-despesas');
  const elLista  = document.getElementById('lista-despesas');
  if (!elCanvas || !elLista) return;

  const itens = topComOutrasDespesas( lerDespesasPorCategoria(filtro), 8 );
  const total = itens.reduce((a,b)=> a + b.valor, 0);

  elLista.innerHTML = '';
  if (chartDespesasDonut) { try{ chartDespesasDonut.destroy(); }catch{} chartDespesasDonut = null; }

  if (!total || !itens.length){
    elLista.innerHTML = `
      <li class="list-item">
        <div class="list-row">
          <div class="list-left">
            <span class="avatar-xs"><i class="ri-error-warning-line"></i></span>
            <div class="list-text">
              <h6>Nenhuma despesa informada</h6>
              <p class="mb-0">Preencha o formulário para ver a composição.</p>
            </div>
          </div>
        </div>
      </li>`;
    if (window.Chart){
      chartDespesasDonut = new Chart(elCanvas.getContext('2d'), {
        type:'doughnut',
        data:{ labels:["Sem dados"], datasets:[{ data:[1], borderWidth:0 }] },
        options:{
          responsive:true, maintainAspectRatio:false, cutout:'65%', radius:'92%',
          plugins:{ legend:{display:false}, centerText:{ text: formatBRL(0), subtext:'Total', fontSize:16 } }
        }
      });
    }
    return;
  }

  const labels = itens.map(i=> i.label);
  const data   = itens.map(i=> i.valor);

  if (window.Chart){
    chartDespesasDonut = new Chart(elCanvas.getContext('2d'), {
      type:'doughnut',
      data:{ labels, datasets:[{ data, borderWidth:0 }] },
      options:{
        responsive:true, maintainAspectRatio:false, cutout:'65%', radius:'92%',
        plugins:{
          legend:{ display:false },
          tooltip:{ callbacks:{ label:(ctx)=> {
            const val = ctx.parsed||0, pct = total ? (val/total*100) : 0;
            return `${formatBRL(val)} (${pct.toFixed(1)}%)`;
          }}},
          centerText:{ text: formatBRL(total), subtext: 'Total', fontSize:16 }
        }
      }
    });
  }

  itens.forEach(it=>{
    const pct = total ? (it.valor/total*100) : 0;
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `
      <div class="list-row">
        <div class="list-left">
          <span class="avatar-xs"><i class="ri-shopping-bag-3-line"></i></span>
          <div class="list-text">
            <h6 class="mb-1">${it.label}</h6>
            <p class="mb-0"></p>
          </div>
        </div>
        <div class="list-right">
          <div class="val">${formatBRL(it.valor)}</div>
          <div class="pct ${pct>0 ? 'up' : 'neutral'}">${pct.toFixed(1)}%</div>
        </div>
      </div>`;
    elLista.appendChild(li);
  });
}

/* --- Patrimônio --- */
function lerPatrimonioItens(filtro = 'todas') {
  const labelsPadrao = ["Imóvel","Imovel","Veículo","Veiculo","Investimentos"];

  const isBem = (label) => /im[óo]vel|imovel|ve[íi]culo|veiculo/i.test(label || "");
  const isInvest = (label) => /invest/i.test(label || "");

  const itens = [];
  try {
    const det = JSON.parse(localStorage.getItem("patrimonioDetalhado") || "{}");
    if (det && typeof det === "object") {
      for (const k of labelsPadrao) {
        const val = parseValorBR(det[k]);
        if (val > 0) itens.push({ label: k, valor: val });
      }
    }
  } catch {}

  if (!itens.length) {
    for (const k of labelsPadrao) {
      const val = parseValorBR(localStorage.getItem(k));
      if (val > 0) itens.push({ label: k, valor: val });
    }
  }

  if (filtro === 'bens') return itens.filter(it => isBem(it.label));
  if (filtro === 'investimentos') return itens.filter(it => isInvest(it.label));
  return itens; // todas
}

let chartPatrimonioDonut = null;
function renderPatrimonioDonut(filtro = 'todas'){
  const elCanvas = document.getElementById('donut-patrimonio');
  const elLista  = document.getElementById('lista-patrimonio');
  if (!elCanvas || !elLista) return;

  const itens = lerPatrimonioItens(filtro);
  const total = itens.reduce((a,b)=> a + b.valor, 0);

  elLista.innerHTML = '';
  if (chartPatrimonioDonut) { try{ chartPatrimonioDonut.destroy(); }catch{} chartPatrimonioDonut = null; }

  if (!total || !itens.length){
    elLista.innerHTML = `
      <li class="list-item">
        <div class="list-row">
          <div class="list-left">
            <span class="avatar-xs"><i class="ri-error-warning-line"></i></span>
            <div class="list-text">
              <h6>Nenhum patrimônio informado</h6>
              <p class="mb-0">Preencha o formulário para ver a composição.</p>
            </div>
          </div>
        </div>
      </li>`;
    if (window.Chart){
      chartPatrimonioDonut = new Chart(elCanvas.getContext('2d'), {
        type:'doughnut',
        data:{ labels:["Sem dados"], datasets:[{ data:[1], borderWidth:0 }] },
        options:{
          responsive:true, maintainAspectRatio:false, cutout:'65%', radius:'92%',
          plugins:{ legend:{display:false}, centerText:{ text: formatBRL(0), subtext:'Total', fontSize:16 } }
        }
      });
    }
    return;
  }

  const labels = itens.map(i=> i.label);
  const data   = itens.map(i=> i.valor);

  if (window.Chart){
    chartPatrimonioDonut = new Chart(elCanvas.getContext('2d'), {
      type:'doughnut',
      data:{ labels, datasets:[{ data, borderWidth:0 }] },
      options:{
        responsive:true, maintainAspectRatio:false, cutout:'65%', radius:'92%',
        plugins:{
          legend:{ display:false },
          tooltip:{ callbacks:{ label:(ctx)=>{
            const val = ctx.parsed||0, pct = total ? (val/total*100) : 0;
            return `${formatBRL(val)} (${pct.toFixed(1)}%)`;
          }}},
          centerText:{ text: formatBRL(total), subtext: 'Total', fontSize: 16 }
        }
      }
    });
  }

  const iconFor = (label) => {
    const l = (label||"").toLowerCase();
    if (l.includes("imó") || l.includes("imo")) return "ri-home-3-line";
    if (l.includes("veíc") || l.includes("veic") || l.includes("carro")) return "ri-car-line";
    if (l.includes("invest")) return "ri-line-chart-line";
    return "ri-donut-chart-line";
  };
  itens.forEach(it=>{
    const pct = total ? (it.valor/total*100) : 0;
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `
      <div class="list-row">
        <div class="list-left">
          <span class="avatar-xs"><i class="${iconFor(it.label)}"></i></span>
          <div class="list-text">
            <h6 class="mb-1">${it.label}</h6>
            <p class="mb-0"></p>
          </div>
        </div>
        <div class="list-right">
          <div class="val">${formatBRL(it.valor)}</div>
          <div class="pct ${pct>0 ? 'up' : 'neutral'}">${pct.toFixed(1)}%</div>
        </div>
      </div>`;
    elLista.appendChild(li);
  });
}

/* ===========================================================
   DROPDOWNS DO TOPO — APENAS CLIQUE
=========================================================== */
(function () {
  const CONTAINER_SEL = '.topbar [data-dropdown]';
  const TOGGLE_SEL    = '[data-toggle="dropdown"]';

  function containers() { return document.querySelectorAll(CONTAINER_SEL); }
  function toggles()    { return document.querySelectorAll(CONTAINER_SEL + ' ' + TOGGLE_SEL); }

  function closeAll(except) {
    containers().forEach(c => { if (c !== except) c.classList.remove('show'); });
    toggles().forEach(b => b.setAttribute('aria-expanded', 'false'));
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest(TOGGLE_SEL);
    const host = btn ? btn.closest(CONTAINER_SEL) : null;

    if (btn && host) {
      e.preventDefault();
      const willOpen = !host.classList.contains('show');
      closeAll(host);
      host.classList.toggle('show', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
      return;
    }

    if (!e.target.closest(CONTAINER_SEL)) closeAll();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  // Abas do dropdown de notificações
  document.addEventListener('click', (e)=>{
    const tab = e.target.closest('.dropdown-tab');
    if (!tab) return;
    const wrap = tab.closest('#notif-menu');
    if (!wrap) return;
    wrap.querySelectorAll('.dropdown-tab').forEach(t=> t.classList.remove('active'));
    tab.classList.add('active');

    const target = tab.getAttribute('data-tab');
    wrap.querySelectorAll('.tab-pane').forEach(p=>{
      p.classList.remove('active');
      if (p.getAttribute('data-pane') === target) p.classList.add('active');
    });
  });
})();

/* ===========================================================
   DROPDOWNS "like" dos CARDS (filtros ⋮)
=========================================================== */
(function(){
  function closeAll(){ document.querySelectorAll('.dropdown-like.open').forEach(d => d.classList.remove('open')); }
  document.addEventListener('click', (e)=>{
    const dd = e.target.closest('.dropdown-like');
    if (dd) {
      if (e.target.closest('.btn')) dd.classList.toggle('open');
    } else closeAll();
  });

  // Receitas: filtro
  document.addEventListener('click', (e)=>{
    const item = e.target.closest('.receitas-filter-item');
    if (!item) return;
    const filtro = item.getAttribute('data-filter') || 'todas';
    item.closest('.dropdown-like')?.classList.remove('open');
    renderReceitasDonut(filtro);
  });

  // Despesas: filtro
  document.addEventListener('click', (e)=>{
    const item = e.target.closest('.despesas-filter-item');
    if (!item) return;
    const filtro = item.getAttribute('data-filter') || 'todas';
    item.closest('.dropdown-like')?.classList.remove('open');
    renderDespesasDonut(filtro);
  });

  // Patrimônio: filtro
  document.addEventListener('click', (e)=>{
    const item = e.target.closest('.patrimonio-filter-item');
    if (!item) return;
    const filtro = item.getAttribute('data-filter') || 'todas';
    item.closest('.dropdown-like')?.classList.remove('open');
    renderPatrimonioDonut(filtro);
  });
})();

/* ===========================================================
   E-MAIL (com prints dos donuts)
=========================================================== */
function enviarEmail() {
  const getPNG = (id)=> document.getElementById(id)?.toDataURL?.() || "";
  const imgReceitas   = getPNG('donut-receitas');
  const imgDespesas   = getPNG('donut-despesas');
  const imgPatrimonio = getPNG('donut-patrimonio');

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

  const corpoEmail = `
<p>Olá,</p>
<p>Segue um resumo inicial com Receitas, Despesas e Patrimônio.</p>
${tabelaGraficos}
<p>Para aprofundar, atualize os valores nos formulários e gere um novo relatório.</p>
<p>Atenciosamente,</p>`;

  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>Copiar análise para e-mail</title></head>
    <body>
      <h2>Copie e cole o conteúdo abaixo no corpo do e-mail:</h2>
      ${corpoEmail}
      <p style="margin-top:16px;">
        <button onclick="copiarConteudo()">Copiar conteúdo</button>
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

/* ===========================================================
   BIND: cards abrem modal no clique/teclado
=========================================================== */
function makeCardOpenModal(cards, modalTipo) {
  cards.forEach(card => {
    if (!card) return;
    if (card.dataset.boundModal === modalTipo) return;
    card.dataset.boundModal = modalTipo;

    card.classList.add('is-clickable-card');
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');

    const onClick = (e) => {
      if (e.target.closest('button, a, input, select, textarea, label, .dropdown-like, .dropdown-like-menu')) return;
      abrirModal(modalTipo);
    };
    const onKey = (e) => {
      const inDropdown = document.activeElement.closest('.dropdown-like');
      if (inDropdown) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirModal(modalTipo); }
    };

    card.addEventListener('click', onClick);
    card.addEventListener('keydown', onKey);
  });
}
function bindAbrirModaisPorCard() {
  const receitasStat = Array.from(document.querySelectorAll('.stats-row .stat-card')).find(c=> (c.textContent||'').toLowerCase().includes('receitas'));
  const despesasStat = Array.from(document.querySelectorAll('.stats-row .stat-card')).find(c=> (c.textContent||'').toLowerCase().includes('despesas'));
  const patrimonioStat = Array.from(document.querySelectorAll('.stats-row .stat-card')).find(c=> (c.textContent||'').toLowerCase().includes('patrimônio'));

  const compReceitas = document.querySelector('.receitas-card');
  const compDespesas = document.getElementById('card-despesas-donut');
  const compPat      = document.getElementById('card-patrimonio-donut');

  makeCardOpenModal([receitasStat, compReceitas], 'receitas');
  makeCardOpenModal([despesasStat, compDespesas], 'despesas');
  makeCardOpenModal([patrimonioStat, compPat], 'patrimonio');
}

/* ===========================================================
   RESET GERAL (zerar tudo e deixar formulários em branco)
=========================================================== */
function resetAllData() {
  try { localStorage.clear(); } catch {}
  // força UI para zero/sem dados
  renderReceitasDonut('todas');
  renderDespesasDonut('todas');
  renderPatrimonioDonut('todas');
  updateTopWidgets();
  atualizarCard4Diagnostico();
  renderNotificationsDropdown();
  syncInsightsToPanel();
  // dispara eventos para outras abas (se houver)
  notifyDataChanged();
}

/* ===========================================================
   MODAL DE BOAS-VINDAS (fullscreen) — sempre ao iniciar
=========================================================== */
function openWelcomeModal() {
  const modal = document.getElementById('welcome-modal');
  if (!modal) return;
  modal.removeAttribute('hidden');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeWelcomeModal() {
  const modal = document.getElementById('welcome-modal');
  if (!modal) return;
  modal.setAttribute('hidden','true');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

/* ===========================================================
   BROADCAST REFRESH
=========================================================== */
function refreshAllVisuals() {
  updateTopWidgets();
  renderReceitasDonut('todas');
  renderDespesasDonut('todas');
  renderPatrimonioDonut('todas');
  atualizarCard4Diagnostico();
  renderNotificationsDropdown();
  syncInsightsToPanel();
}
function notifyDataChanged() {
  window.dispatchEvent(new Event('dados:atualizados'));
  try{ localStorage.setItem('__lastUpdate', String(Date.now())); }catch{}
}
window.addEventListener('dados:atualizados', refreshAllVisuals);
window.addEventListener('storage', (e) => { if (e.key === '__lastUpdate') refreshAllVisuals(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshAllVisuals(); });

/* ===========================================================
   INICIALIZAÇÃO
=========================================================== */
window.addEventListener('DOMContentLoaded', () => {
  // 1) Sempre iniciar zerado (campos em branco + gráficos zerados)
  resetAllData();

  // 2) Bind dos cards
  bindAbrirModaisPorCard();

  // 3) Notificações iniciais
  renderNotificationsDropdown();

  // 4) Modal de boas-vindas
  openWelcomeModal();

  // Fechar ou resetar pelo modal de boas-vindas
  document.querySelectorAll('[data-close-welcome]').forEach(btn=>{
    btn.addEventListener('click', closeWelcomeModal);
  });
  const resetBtn = document.getElementById('welcome-reset-all');
  if (resetBtn) resetBtn.addEventListener('click', ()=>{ resetAllData(); });

  // Ação "Sair" no menu do usuário → limpar tudo e voltar ao modal
  const logout = document.getElementById('action-logout');
  if (logout) logout.addEventListener('click', (e)=>{
    e.preventDefault();
    resetAllData();
    openWelcomeModal();
  });

  // Render inicial dos donuts (redundante mas seguro)
  renderReceitasDonut('todas');
  renderDespesasDonut('todas');
  renderPatrimonioDonut('todas');
  updateTopWidgets();
  atualizarCard4Diagnostico();
  renderNotificationsDropdown();
});