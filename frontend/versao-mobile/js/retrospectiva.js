let slides = [];
let slideAtual = 0;
let tempo = 6000;
let intervaloSlide;

function initRetrospectiva() {
  const btn = document.getElementById("btnAbrirRetro");

  if (!eventoFinalizado()) {
    iniciarContadorRetro();
    return;
  }

  liberarRetro();

  if (btn) {
    btn.style.display = "block";
    btn.onclick = abrirRetrospectiva;
  }
}

function iniciarContadorRetro() {
  const el = document.getElementById("contadorRetro");
  if (!el) return;

  const intervalo = setInterval(() => {
    if (eventoFinalizado()) {
      clearInterval(intervalo);
      liberarRetro();
      return;
    }

    const agora = new Date();
    const fim = new Date(2026, 6, 6, 16, 59, 59);

    const diff = fim - agora;

    if (diff <= 0) {
      el.innerText = "Disponível agora";
      return;
    }

    const dias = Math.floor(diff / 86400000);
    const horas = Math.floor((diff / 3600000) % 24);
    const min = Math.floor((diff / 60000) % 60);
    const seg = Math.floor((diff / 1000) % 60);

    const format = (n) => String(n).padStart(2, "0");

    el.innerText =
      `${dias} dias ${format(horas)}horas ${format(min)}min ${format(seg)}s`;

  }, 1000);
}

function liberarRetro() {
  const bloqueado = document.getElementById("retroBloqueado");
  const btn = document.getElementById("btnAbrirRetro");

  if (bloqueado) bloqueado.style.display = "none";
  if (btn) btn.style.display = "block";

  montarSlides();
}

function montarSlides() {
  slides = [
    `<div class="retro-card bg-intro">Intro</div>`,

    `<div class="retro-card bg-dias">Dias</div>`,

    `<div class="retro-card bg-midias">Fotos</div>`,

    `<div class="retro-card bg-amigos">Amigos</div>`,

    `<div class="retro-card bg-bebidas">Bebidas</div>`,

    `<div class="retro-card bg-shows">Shows</div>`,

    `<div class="retro-card bg-resumo">Resumo</div>`
  ];
}

function abrirRetrospectiva() {
  const el = document.getElementById("retroStories");
  if (!el) return;

  el.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  slideAtual = 0;

  criarBarras();
  renderizarSlide();
  iniciarAuto();
}

function fecharRetrospectiva() {
  const el = document.getElementById("retroStories");
  if (el) el.classList.add("hidden");

  document.body.style.overflow = "auto";
  clearInterval(intervaloSlide);
}

function renderizarSlide() {
  const container = document.getElementById("slideContainer");
  if (!container) return;

  container.innerHTML = slides[slideAtual];
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
    b.style.width = i < slideAtual ? "100%" : "0%";
    b.style.transition = "none";
  });

  const atual = barras[slideAtual];
  if (!atual) return;

  setTimeout(() => {
    atual.style.transition = "width 6s linear";
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
  } else {
    fecharRetrospectiva();
  }
}

function anteriorSlide() {
  if (slideAtual > 0) {
    slideAtual--;
    renderizarSlide();
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

      iniciarAuto();
    });
  }
});