// Substituir https://backenddeploy.com pela url real quando em produção
const DEV_ORIGINS = [
    "localhost",
    "127.0.0.1",
];

const API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname) ? "http://localhost:8080" : "https://backenddeploy.com";

const nomesMeses = ["Jun", "Jul"];
let mesAtual = 0; 
const ano = 2026;
const agoraFixo = new Date(2026, 5, 5, 17, 0, 0); //  para testes
let diaSelecionado = null;
let streamRecurso = null;
let fotoCapturada = null;  

function getAgora() {
  return agoraFixo || new Date();
}

function eventoFinalizado() {
  const agora = getAgora();
  const fim = new Date(2026, 6, 6, 16, 59, 59);

  if (agora < fim) return false;

  for (let mes = 0; mes <= 1; mes++) {
    for (let dia = 1; dia <= 31; dia++) {
      if (dentroDoEvento(mes, dia)) {
        if (obterStatus(mes, dia) === "disponivel") {
          return false;
        }
      }
    }
  }

  return true;
}

function mostrarPagina(pagina) {
  const paginas = document.querySelectorAll(".pagina");
  paginas.forEach(p => p.classList.remove("active"));
  
  const paginaAlvo = document.getElementById(pagina);
  if (paginaAlvo) {
    paginaAlvo.classList.add("active");
  }

  document.querySelectorAll(".nav-bottom button").forEach(btn => btn.classList.remove("active"));

  let botaoId = "";
  if (pagina === "programacao") botaoId = "btnProgramacao";
  else if (pagina === "ponto") botaoId = "btnPonto";
  else if (pagina === "retrospectiva") botaoId = "btnRetrospectiva";

  const botao = document.getElementById(botaoId);
  if (botao) {
    botao.classList.add("active");
    
    const titulo = document.getElementById("titulo-topo");
    if (titulo) {
      const span = botao.querySelector("span");
      if (span) titulo.innerText = span.innerText;
    }
  }

  document.body.classList.remove("fundo-programacao", "fundo-ponto", "fundo-retro");
  if (pagina === "programacao") document.body.classList.add("fundo-programacao");
  if (pagina === "ponto") document.body.classList.add("fundo-ponto");
  if (pagina === "retrospectiva") {
    document.body.classList.add("fundo-retro");
    if (typeof initRetrospectiva === "function") {
      initRetrospectiva();
    }
  }

  const btnLogin = document.getElementById("btnLogin");
  if (btnLogin) {
    btnLogin.style.display = (pagina === "ponto") ? "block" : "none";
  }
}

window.onload = function() {
  mostrarPagina("ponto");
};

window.addEventListener("DOMContentLoaded", async () => {
  if (localStorage.getItem("usuarioLogado")) definirLogado(true);

  renderizarCalendario();
  atualizarProgramacao();

  // Carrega dias do backend, posiciona no dia atual e renderiza
  await carregarDiasDisponiveis();
  irParaDiaAtual();
  renderizarProgramacao();

  document.querySelectorAll(".fechar").forEach(b => {
    b.onclick = () => {
      fecharJanelaRegistrarDia(); 
      fecharLoginCadastro();
      fecharJanelaEncerrado(); 
      fecharJanelaBloqueado();
      fecharEsqueciSenha(); 
    };
  });

  const btnL = document.getElementById("btnLogin");
  if(btnL) {
    btnL.onclick = () => {
      if (btnL.dataset.logged === "true") definirLogado(false);
      else abrirLoginCadastro();
    };
  }
});