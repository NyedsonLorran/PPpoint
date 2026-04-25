let slides = [];
let slideAtual = 0;
let tempo = 6000;
let intervaloSlide;

function initRetrospectiva() {
    const logado = localStorage.getItem("usuarioLogado");
    
    const divNaoLogado = document.getElementById("retroNaoLogado");
    const divBloqueado = document.getElementById("retroBloqueado");
    const divAcessoPronto = document.getElementById("containerAcessoRetro");

    if (divNaoLogado) divNaoLogado.style.display = "none";
    if (divBloqueado) divBloqueado.style.display = "none";
    if (divAcessoPronto) divAcessoPronto.style.display = "none";

    if (!logado) {
        if (divNaoLogado) {
            divNaoLogado.style.display = "flex"; 
            divNaoLogado.classList.remove("hidden"); 
        }
    } 
    else if (!eventoFinalizado()) {
        if (divBloqueado) {
            divBloqueado.style.display = "flex";
            divBloqueado.classList.remove("hidden");
            iniciarContadorRetro();
        }
    } 
    else {
        if (divAcessoPronto) {
            divAcessoPronto.style.display = "flex";
            divAcessoPronto.classList.remove("hidden");
            
            const btn = document.getElementById("btnAbrirRetro");
            if (btn) btn.onclick = abrirRetrospectiva;
        }
        montarSlides();
    }
}

function renderizarExplicacaoPublica() {
  const container = document.getElementById("retro-container-dinamico");
  container.innerHTML = `
    <div class="retro-info-card">
      <h3>Sua Retrospectiva PPpoint</h3>
      <p>Registre seus momentos no festival para gerar um resumo exclusivo ao final do evento!</p>
      <button onclick="abrirLoginCadastro()" class="btn-entrar-retro">Entrar ou Cadastrar</author>
    </div>
  `;
}

function renderizarContadorPrivado() {
  const container = document.getElementById("retro-container-dinamico");
  const user = getUsuarioLogado();
  
  container.innerHTML = `
    <div class="retro-info-card">
      <h3>Olá, ${user.nome || 'Programador'}!</h3>
      <p>Estamos preparando seus momentos. Ela estará disponível em:</p>
      <div id="contadorRetro" class="cronometro">--d --h --m --s</div>
    </div>
  `;
}

function iniciarContadorRetro() {
    const el = document.getElementById("contadorRetro");
    if (!el) return;

    if (window.intervaloRetro) clearInterval(window.intervaloRetro);

    window.intervaloRetro = setInterval(() => {
        const agora = getAgora();
        const fim = new Date(2026, 6, 6, 17, 0, 0); 
        const diff = fim - agora;

        if (diff <= 0) {
            clearInterval(window.intervaloRetro);
            initRetrospectiva();
            return;
        }

        const dias = Math.floor(diff / 86400000);
        const horas = Math.floor((diff / 3600000) % 24);
        const min = Math.floor((diff / 60000) % 60);
        const seg = Math.floor((diff / 1000) % 60);

        const format = (n) => String(n).padStart(2, "0");
        el.innerText = `${dias}d ${format(horas)}h ${format(min)}m ${format(seg)}s`;
    }, 1000);
}

function liberarRetro() {
    const bloqueado = document.getElementById("retroBloqueado");
    const containerAcesso = document.getElementById("containerAcessoRetro"); // ID da nova Div
    const btn = document.getElementById("btnAbrirRetro");

    if (bloqueado) bloqueado.style.display = "none"; 
    
    if (containerAcesso) {
        containerAcesso.style.display = "flex"; // Usa FLEX para centralizar igual aos outros
    }

    if (btn) {
        btn.onclick = abrirRetrospectiva;
    }

    montarSlides();
}

function montarSlides() {
  slides = [
    "./css/Pagina-Retrospectiva/stories/html/intro.html",
    "./css/Pagina-Retrospectiva/stories/html/dias.html",
    "./css/Pagina-Retrospectiva/stories/html/midias.html",
    "./css/Pagina-Retrospectiva/stories/html/amigos.html",
    "./css/Pagina-Retrospectiva/stories/html/bebidas.html",
    "./css/Pagina-Retrospectiva/stories/html/shows.html",
    "./css/Pagina-Retrospectiva/stories/html/resumo.html"
  ];
}

async function abrirRetrospectiva() {
  const el = document.getElementById("retroStories");
  if (!el) return;

  el.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  slideAtual = 0;

  criarBarras();
  await renderizarSlide();
  iniciarAuto();
}

function fecharRetrospectiva() {
  const el = document.getElementById("retroStories");
  if (el) el.classList.add("hidden");

  document.body.style.overflow = "auto";
  clearInterval(intervaloSlide);
}

async function renderizarSlide() {
  const container = document.getElementById("slideContainer");
  if (!container) return;

  const url = slides[slideAtual];

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const html = await res.text();
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = `<div class="retro-slide">Erro ao carregar stories</div>`;
  }

  atualizarBarras();
  atualizarBotaoCompartilhar();
}

function criarBarras() {
  const progress = document.getElementById("retroProgress");
  if (!progress) return;

  progress.innerHTML = "";

  slides.forEach(() => {
    const bar = document.createElement("div");
    bar.className = "retro-bar";

    const fill = document.createElement("div");
    fill.className = "retro-bar-fill";

    bar.appendChild(fill);
    progress.appendChild(bar);
  });
}

function atualizarBarras() {
  const barras = document.querySelectorAll(".retro-bar-fill");
  if (!barras.length) return;

  barras.forEach((b, i) => {
    b.style.transition = "none";
    b.style.width = i < slideAtual ? "100%" : "0%";
  });

  const atual = barras[slideAtual];
  if (!atual) return;

  void atual.offsetWidth;

  setTimeout(() => {
    atual.style.transition = `width ${tempo}ms linear`;
    atual.style.width = "100%";
  }, 50);
}

function iniciarAuto() {
  clearInterval(intervaloSlide);
  intervaloSlide = setInterval(() => {
    proximoSlide();
  }, tempo);
}

function proximoSlide() {
  if (slideAtual < slides.length - 1) {
    slideAtual++;
    renderizarSlide();
    iniciarAuto();
  } else {
    fecharRetrospectiva();
  }
}

function anteriorSlide() {
  if (slideAtual > 0) {
    slideAtual--;
    renderizarSlide();
    iniciarAuto();
  }
}

function atualizarBotaoCompartilhar() {
  const btn = document.getElementById("btnCompartilhar");
  if (!btn) return;

  btn.style.display = "block";
  btn.onclick = (e) => {
    e.stopPropagation();
    compartilharInstagram();
  };
}

function compartilharInstagram() {
  const el = document.getElementById("slideContainer");
  if (!el) return;

  html2canvas(el, {
    backgroundColor: null,
    scale: 2,
    useCORS: true
  }).then(canvas => {
    canvas.toBlob((blob) => {
      const file = new File([blob], "story.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: "Minha retrospectiva"
        });
      } else {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "story.png";
        link.click();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initRetrospectiva();

  const retro = document.getElementById("retroStories");

  if (retro) {
    retro.addEventListener("click", (e) => {
      const btn = document.getElementById("btnCompartilhar");
      if (btn && btn.contains(e.target)) return;

      const meio = window.innerWidth / 2;

      if (e.clientX > meio) proximoSlide();
      else anteriorSlide();
    });
  }
});