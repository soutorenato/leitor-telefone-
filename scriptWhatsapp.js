// scriptMensagens.js
// Este arquivo contém as mensagens enviadas por WhatsApp agradecendo o contato
// para a contratação do produto que está na linha da tabela.

const mensagensWhatsApp = {
  "Abertura de Conta": "Sua conta corrente foi aberta com sucesso!\n\nPara ativá-la, será necessário efetuar um depósito em conta. Se precisar de qualquer ajuda, você pode contar com o nosso chat disponível a qualquer horário no App Santander > Menu Atendimento > Chat.\n\nEstamos sempre prontos para auxiliá-lo!",
  "Câmbio": "Sua operação de câmbio foi realizada com sucesso!\n\nSugerimos que você abra a conta do Select Global para aproveitar benefícios exclusivos, como taxas competitivas, atendimento especializado e facilidades para transações internacionais. Para contratar, acesse nosso site: www.selectglobal.com.",
  "Captação Líquida": "Obrigado por contratar o serviço de Captação Líquida. Nossa equipe analisará sua solicitação e retornará em breve.",
  "Cartão Novo": "Agradecemos o seu contato para a emissão de um Cartão Novo. Estamos preparando tudo para atendê-lo com excelência.",
  "Cartão Upgrade": "Obrigado por solicitar o Cartão Upgrade. Em breve retornaremos com mais informações sobre o seu pedido.",
  "COE": "Agradecemos o seu interesse no COE. Nossa equipe de especialistas estará em contato para esclarecer todas as dúvidas.",
  "Consórcio": "Obrigado por solicitar informações sobre Consórcio. Em breve nossa equipe entrará em contato para orientá-lo.",
  "Crédito Imobiliário": "Agradecemos o seu contato para contratação de Crédito Imobiliário. Estamos analisando sua solicitação e retornaremos em breve.",
  "Crédito Pessoal": "Obrigado pelo seu interesse no Crédito Pessoal. Nossa equipe entrará em contato em breve para os próximos passos.",
  "Crédito Pessoal Com Garantia": "Agradecemos o seu contato para contratação de Crédito Pessoal Com Garantia. Em breve você receberá mais informações.",
  "Crédito Pessoal Preventivo": "Obrigado pelo seu interesse em nosso Crédito Pessoal Preventivo. Nossa equipe entrará em contato para orientá-lo.",
  "Open Finance": "Agradecemos o seu contato para contratação do Open Finance. Em breve nossa equipe entrará em contato para mais detalhes.",
  "Parcelamento de Fatura": "Obrigado pelo seu interesse no Parcelamento de Fatura. Em instantes, um de nossos consultores retornará com mais informações.",
  "Previdência": "Agradecemos o seu contato para contratação de Previdência. Nossa equipe entrará em contato para auxiliá-lo.",
  "Seguro Auto": "Obrigado pelo seu contato para contratação de Seguro Auto. Em breve retornaremos com todos os detalhes.",
  "Seguro Casa": "Agradecemos o seu interesse em nosso Seguro Casa. Nossa equipe entrará em contato para dar continuidade à sua solicitação.",
  "Seguro Demais": "Obrigado pelo seu contato sobre Seguro Demais. Em instantes, um de nossos consultores falará com você.",
  "Seguro Vida": "Agradecemos o seu interesse em Seguro Vida. Nossa equipe entrará em contato para fornecer mais informações.",
  "Use Casa": "Obrigado pelo seu contato para contratação do Use Casa. Em breve retornaremos com os detalhes do seu atendimento."
};

/**
 * Retorna a mensagem de WhatsApp para um dado produto.
 *
 * @param {string} produto - O nome do produto.
 * @param {string} nomeCliente - O primeiro nome do cliente para personalizar a mensagem.
 * @returns {string} Mensagem personalizada para enviar via WhatsApp.
 */
function getMensagemWhatsApp(produto, nomeCliente) {
  const mensagemBase = mensagensWhatsApp[produto];
  if (mensagemBase) {
    return `Olá ${nomeCliente},\n\n${mensagemBase}\n\nAgradecemos pela sua preferência!`;
  } else {
    return `Olá ${nomeCliente},\n\nObrigado pelo seu contato. Em breve nossa equipe retornará com mais informações.`;
  }
}

// Exemplo de uso:
// const mensagem = getMensagemWhatsApp("Câmbio", "Carlos");
// console.log(mensagem);

// Exporta a função para uso em módulos (Node.js) ou a torna global para uso no browser.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getMensagemWhatsApp
  };
} else {
  window.getMensagemWhatsApp = getMensagemWhatsApp;
}