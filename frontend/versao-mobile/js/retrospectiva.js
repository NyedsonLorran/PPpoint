let slides = [];
let slidesPrecarregados = {}; 
let slideAtual = 0;
let tempo = 6000;
let intervaloSlide;

let isPaused = false;
let tempoRestante = tempo; 
let startTimer; 

let audioRetro = new Audio("./css/Pagina-Retrospectiva/stories/css/musicas/olha-pro-ceu.mp3");

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

            const usuario = getUsuarioLogado();
            const texto = divBloqueado.querySelector(".sub");

            if (usuario && texto) {
                const nome = usuario.nome || usuario.usuario || "Usuário";
              texto.innerHTML = `
  <span class="frase-retro">SUA RETROSPECTIVA ESTARÁ</span><br>
  <span class="frase-retro">DISPONÍVEL EM</span>
`;
            }

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
      <button onclick="abrirLoginCadastro()" class="btn-entrar-retro">Entrar ou Cadastrar</button>
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
    const containerAcesso = document.getElementById("containerAcessoRetro");
    const btn = document.getElementById("btnAbrirRetro");

    if (bloqueado) bloqueado.style.display = "none"; 
    
    if (containerAcesso) {
        containerAcesso.style.display = "flex";
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
    "./css/Pagina-Retrospectiva/stories/html/resumo.html",
    "./css/Pagina-Retrospectiva/stories/html/compartilhar.html"
  ];
}

async function abrirRetrospectiva() {
  const el = document.getElementById("retroStories");
  const loading = document.getElementById("retroLoading");
  const textoLoading = document.querySelector("#retroLoading p"); 
  if (!el) return;

  try {
    if (!audioRetro) {
      audioRetro = new Audio("./olha-pro-ceu.mp3");
      audioRetro.loop = true;
    }
    audioRetro.currentTime = 0;
    audioRetro.play().catch(e => console.log(e));
  } catch (err) {}

  if (loading) loading.classList.remove("hidden");
  if (textoLoading) textoLoading.innerText = "Iniciando retrospectiva...";

  const tempoMinimo = new Promise(resolve => setTimeout(resolve, 2000));

  setTimeout(() => {
    if (textoLoading) textoLoading.innerText = "Carregando seus momentos...";
  }, 800);

  const carregarSlides = slides.map(async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const html = await res.text();
    slidesPrecarregados[url] = html;
  });

  try {
    await Promise.all([...carregarSlides, tempoMinimo]);
  } catch (e) {
    console.error("Erro ao pré-carregar os stories", e);
    await tempoMinimo; 
  }

  if (loading) loading.classList.add("hidden");
  el.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  slideAtual = 0;
  tempoRestante = tempo;

  criarBarras();
  await renderizarSlide();
}

function fecharRetrospectiva() {
  const el = document.getElementById("retroStories");
  if (el) el.classList.add("hidden");

  document.body.style.overflow = "auto";
  clearInterval(intervaloSlide);

  if (audioRetro) {
    try {
      audioRetro.pause();
      audioRetro.currentTime = 0;
    } catch (e) {}
  }
}

async function renderizarSlide() {
  const container = document.getElementById("slideContainer");
  const progress = document.getElementById("retroProgress");
  if (!container) return;

  const url = slides[slideAtual];
  
  if (slidesPrecarregados[url]) {
    container.innerHTML = slidesPrecarregados[url];
  } else {
    container.innerHTML = `<div class="retro-slide">Erro ao carregar stories</div>`;
  }

  tempoRestante = tempo;
  atualizarBarras(); 
  
  if (slideAtual === slides.length - 1) {
    clearInterval(intervaloSlide);
    if (progress) progress.style.display = 'none'; 
    if (audioRetro) {
      try {
        audioRetro.pause();
        audioRetro.currentTime = 0;
      } catch (e) {}
    }
    preencherEMostrarCarrossel();
  } else {
    if (progress) progress.style.display = 'flex'; 
    if (audioRetro && audioRetro.paused) {
      audioRetro.play().catch(err => console.log(err));
    }
    setTimeout(() => {
        iniciarAuto(tempo);
    }, 10);
  }

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
    if (i < slideAtual) {
        b.style.width = "100%";
    } else {
        b.style.width = "0%";
    }
  });

  void barras[0].offsetWidth;
}

function iniciarAuto(duracao) {
    clearInterval(intervaloSlide);
    
    intervaloSlide = setInterval(() => {
        proximoSlide();
    }, duracao);

    const barras = document.querySelectorAll(".retro-bar-fill");
    const atual = barras[slideAtual];
    if (atual) {
        atual.style.transition = `width ${duracao}ms linear`;
        atual.style.width = "100%";
    }
}

function proximoSlide() {
    clearInterval(intervaloSlide);
    if (slideAtual < slides.length - 1) {
        slideAtual++;
        renderizarSlide();
    } else {
        fecharRetrospectiva();
    }
}

function anteriorSlide() {
    clearInterval(intervaloSlide);
    if (slideAtual > 0) {
        slideAtual--;
        renderizarSlide();
    }
}

function atualizarBotaoCompartilhar() {
  const btn = document.getElementById("btnCompartilhar");
  if (btn) btn.style.display = "none"; 
}

async function preencherEMostrarCarrossel() {
  const track = document.querySelector('.carousel-track');
  const slideFinal = document.querySelector('.slide-final-compartilhar');
  if (!track || !slideFinal) return;

  track.innerHTML = ''; 

  const btnFecharExibido = slideFinal.querySelector('.btn-fechar-retro');
  if (!btnFecharExibido) {
    const btnFechar = document.createElement('button');
    btnFechar.innerHTML = '&#10005;'; 
    btnFechar.className = 'btn-fechar-retro';
    btnFechar.onclick = (e) => {
      e.stopPropagation();
      fecharRetrospectiva();
    };
    slideFinal.appendChild(btnFechar);
  }

  for (let i = 0; i < slides.length - 1; i++) {
    const urlStory = slides[i];
    const htmlStory = slidesPrecarregados[urlStory];

    if (htmlStory) {
      const card = document.createElement('div');
      card.className = 'carousel-card';
      
      const miniStoryContainer = document.createElement('div');
      miniStoryContainer.className = 'mini-story-container';
      
      miniStoryContainer.innerHTML = htmlStory;

      const retroSlideReal = miniStoryContainer.querySelector('.retro-slide');
      if (retroSlideReal) {
        retroSlideReal.classList.add('mini-story-scaled');
      }

      card.appendChild(miniStoryContainer);
      track.appendChild(card);
    }
  }

  inicializarCarrosselLogica();
}

function inicializarCarrosselLogica() {
  const track = document.querySelector('.carousel-track');
  const cards = document.querySelectorAll('.carousel-card');
  const slideFinal = document.querySelector('.slide-final-compartilhar');
  
  if (!track || !cards.length || !slideFinal) return;

  const deterInterferencia = (e) => {
    e.stopPropagation();
  };

  slideFinal.addEventListener('touchstart', deterInterferencia, { passive: false });
  slideFinal.addEventListener('touchmove', deterInterferencia, { passive: false });
  slideFinal.addEventListener('touchend', deterInterferencia);
  slideFinal.addEventListener('mousedown', deterInterferencia);
  slideFinal.addEventListener('click', deterInterferencia);

  const atualizarCardAtivo = () => {
    const centroCarrossel = track.getBoundingClientRect().left + (track.offsetWidth / 2);
    let cardMaisProximo = null;
    let menorDistancia = Infinity;

    cards.forEach(card => {
      const centroCard = card.getBoundingClientRect().left + (card.offsetWidth / 2);
      const distancia = Math.abs(centroCarrossel - centroCard);
      
      card.classList.remove('active');
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        cardMaisProximo = card;
      }
    });

    if (cardMaisProximo) {
      cardMaisProximo.classList.add('active');
    }
  };

  track.addEventListener('scroll', atualizarCardAtivo);
  track.scrollLeft = 0;
  setTimeout(atualizarCardAtivo, 100);

  const btnComp = document.getElementById("btnConfirmarCompartilhar");
  if (btnComp) {
    btnComp.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation(); 
      
      const cardAtivo = document.querySelector('.carousel-card.active');
      if (cardAtivo) {
        const miniStoryReal = cardAtivo.querySelector('.mini-story-container .retro-slide');
        if (miniStoryReal) {
            compartilharStoryReal(miniStoryReal);
        }
      }
    };
  }
}

function compartilharStoryReal(elementoStory) {
  const width = 1080;
  const height = 1920;
  const loading = document.getElementById('retroLoading');

  if (loading) loading.classList.remove('hidden');

  const wrapperParaRender = document.createElement('div');
  wrapperParaRender.style.position = 'fixed';
  wrapperParaRender.style.top = '0';
  wrapperParaRender.style.left = '0';
  wrapperParaRender.style.width = width + 'px';
  wrapperParaRender.style.height = height + 'px';
  wrapperParaRender.style.zIndex = '-99999';
  wrapperParaRender.style.overflow = 'hidden';
  wrapperParaRender.style.backgroundColor = '#000';

  const cloneStory = elementoStory.cloneNode(true);
  cloneStory.classList.remove('mini-story-scaled');
  cloneStory.style.transform = 'none';
  cloneStory.style.webkitTransform = 'none';
  cloneStory.style.width = '100%';
  cloneStory.style.height = '100%';
  cloneStory.style.position = 'relative';
  cloneStory.style.top = '0';
  cloneStory.style.left = '0';

  wrapperParaRender.appendChild(cloneStory);
  document.body.appendChild(wrapperParaRender);

  html2canvas(wrapperParaRender, {
    backgroundColor: '#000', 
    scale: 1, 
    useCORS: true,
    allowTaint: true,
    width: width,
    height: height,
    windowWidth: width,
    windowHeight: height
  }).then(canvas => {
    
    document.body.removeChild(wrapperParaRender);
    if (loading) loading.classList.add('hidden');

    canvas.toBlob((blob) => {
      const file = new File([blob], "story.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: "Minha retrospectiva"
        });
      } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob); 
        link.download = "story.png";
        link.click();
      }

    }, "image/png", 1);

  }).catch(err => {
    console.error(err);
    if (document.body.contains(wrapperParaRender)) {
        document.body.removeChild(wrapperParaRender);
    }
    if (loading) loading.classList.add('hidden');
  });
}

const retro = document.getElementById("retroStories");

if (retro) {
    const iniciarPausa = (e) => {
        if (slideAtual === slides.length - 1) return;
        
        isPaused = true;
        startTimer = Date.now();
        clearInterval(intervaloSlide);
        
        if (audioRetro) {
          try {
            audioRetro.pause();
          } catch (err) {}
        }
        
        const barras = document.querySelectorAll(".retro-bar-fill");
        if (barras[slideAtual]) {
            const estiloComputado = window.getComputedStyle(barras[slideAtual]);
            const larguraAtual = estiloComputado.width;
            barras[slideAtual].style.transition = "none";
            barras[slideAtual].style.width = larguraAtual;
        }
    };

    const finalizarPausa = (e) => {
        if (slideAtual === slides.length - 1) return;
        
        if (!isPaused) return;
        
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();

        isPaused = false;
        const duracaoToque = Date.now() - startTimer;

        if (duracaoToque < 250) { 
            const meio = window.innerWidth / 2;
            const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            
            if (x > meio) proximoSlide();
            else anteriorSlide();
        } else { 
            const tempoPassado = duracaoToque; 
            tempoRestante -= tempoPassado;
            
            if (tempoRestante <= 200) {
                proximoSlide();
            } else {
                if (audioRetro && audioRetro.paused) {
                  audioRetro.play().catch(err => console.log(err));
                }
                iniciarAuto(tempoRestante);
            }
        }
    };

    retro.addEventListener("mousedown", iniciarPausa);
    retro.addEventListener("mouseup", finalizarPausa);
    retro.addEventListener("touchstart", iniciarPausa, { passive: false });
    retro.addEventListener("touchend", finalizarPausa, { passive: false });
}