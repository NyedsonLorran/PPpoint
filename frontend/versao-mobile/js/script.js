// Substituir https://backenddeploy.com pela url real quando em produção
const DEV_ORIGINS = ["localhost", "127.0.0.1"];
const API_URL = DEV_ORIGINS.includes(window.location.hostname) 
  ? "http://localhost:8080" 
  : "https://backenddeploy.com";

const nomesMeses = ["Jun", "Jul"];
let mesAtual = 0; 
const ano = 2026;
                        //  A   M   D  H   M  S 
const agoraFixo = new Date(2026, 6, 6, 17, 0, 0); //  para testes
let diaSelecionado = null;
let streamRecurso = null;
let fotoCapturada = null;  
let ultimoIndex = 1;

const ordemPaginas = {
    "programacao": 0,
    "ponto": 1,
    "retrospectiva": 2
};


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
    const track = document.getElementById('fundoTrack');
    const indexAlvo = ordemPaginas[pagina];
    
    if (!track || indexAlvo === undefined) return;

    const vindoDaPontaParaPonta = Math.abs(indexAlvo - ultimoIndex) > 1;

    if (vindoDaPontaParaPonta) {
        track.style.transition = "none";
        
        if (ultimoIndex === 2 && indexAlvo === 0) {
            track.appendChild(track.firstElementChild); 
            track.style.transform = "translateX(-100vw)";
        } else if (ultimoIndex === 0 && indexAlvo === 2) {
            track.insertBefore(track.lastElementChild, track.firstChild);
            track.style.transform = "translateX(-100vw)";
        }

        track.offsetHeight; 

        track.style.transition = "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
        track.style.transform = (ultimoIndex === 2) ? "translateX(-200vw)" : "translateX(0vw)";
        
        setTimeout(() => {
            track.style.transition = "none";
            const p = track.querySelector('.programacao');
            const pt = track.querySelector('.point');
            const r = track.querySelector('.retrospectiva');
            track.appendChild(p);
            track.appendChild(pt);
            track.appendChild(r);
            track.style.transform = `translateX(-${indexAlvo * 100}vw)`;
        }, 600);

    } else {
        track.style.transition = "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
        track.style.transform = `translateX(-${indexAlvo * 100}vw)`;
    }

    ultimoIndex = indexAlvo;

    const paginas = document.querySelectorAll(".pagina");
    paginas.forEach(p => p.classList.remove("active"));
    
    const paginaAlvo = document.getElementById(pagina);
    if (paginaAlvo) paginaAlvo.classList.add("active");

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

    if (pagina === "retrospectiva" && typeof initRetrospectiva === "function") {
        initRetrospectiva();
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





