let usandoFrontal = false;

async function abrirJanelaRegistrarDia() {
  document.getElementById("fundoTransparente").style.display = "block";
  document.getElementById("janela-registrar-dia").style.display = "flex";
  const usuario = getUsuarioLogado();
  const areaCam = document.getElementById("areaCamera");
  if (usuario && areaCam) {
    const registros = JSON.parse(localStorage.getItem("registros_" + usuario.usuario)) || [];
    areaCam.style.display = (registros.length === 0) ? "block" : "none";
  }
  await carregarDadosFormulario(); 
  carregarSugestoesAmigos();
  let mesReal = mesAtual === 0 ? 5 : 6;
  let d = new Date(ano, mesReal, diaSelecionado);
  document.getElementById("tituloRegistro").innerText = `Registrar dia ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}

function fecharJanelaRegistrarDia() {
  document.getElementById("fundoTransparente").style.display = "none";
  document.getElementById("janela-registrar-dia").style.display = "none";
  if (streamRecurso) { streamRecurso.getTracks().forEach(t => t.stop()); streamRecurso = null; }
}


function salvarSugestaoAmigo(arroba) {
  if (!arroba || !arroba.includes('@')) return;
  let usuario = getUsuarioLogado();
  if (!usuario) return;
  let chave = "amigos_sugeridos_" + usuario.usuario;
  let amigos = JSON.parse(localStorage.getItem(chave)) || [];
  if (!amigos.includes(arroba)) {
    amigos.push(arroba);
    localStorage.setItem(chave, JSON.stringify(amigos));
  }
}

function carregarSugestoesAmigos() {
  let usuario = getUsuarioLogado();
  const datalist = document.getElementById("sugestoesAmigos");
  if (!usuario || !datalist) return;
  let chave = "amigos_sugeridos_" + usuario.usuario;
  let amigos = JSON.parse(localStorage.getItem(chave)) || [];
  datalist.innerHTML = "";
  amigos.forEach(amigo => {
    let option = document.createElement("option");
    option.value = amigo;
    datalist.appendChild(option);
  });
}

function ajustarQtd(id, mudanca) {
  const input = document.getElementById(`qtd-${id}`);
  let v = (parseInt(input.value) || 0) + mudanca;
  if (v < 0) v = 0;
  input.value = v;
  const card = input.closest('.card-bebida');
  v > 0 ? card.classList.add('com-item') : card.classList.remove('com-item');
}

function getEstruturaBebidas() {
  return [
    { nome: "Beats", sabores: ["Azul", "Vermelha", "Verde", "Beats 1L"] },
    { nome: "Matuta", sabores: ["Mel e Limão", "Canela", "Cristal", "Coco"] },
    { nome: "Cerveja", sabores: ["Brahma", "Heineken", "Skol"] },
    { nome: "Outros", sabores: ["Água", "Refrigerante"] }
  ];
}

async function carregarDadosFormulario() {
  let shows = await getProgramacaoPorDia(diaSelecionado, mesAtual);
  let estrutura = getEstruturaBebidas();
  const containerNotas = document.getElementById("notasShows");
  const containerBebidas = document.getElementById("listaBebidas");

  containerNotas.innerHTML = "";
  containerBebidas.innerHTML = "";

  //  RENDER NOTAS (5 ESTRELAS COM MEIA, SÓ UM 5 POR NOITE)
  let notaMaximaDada = false; // controla se algum show já tem nota 5
  shows.forEach(show => {
    const div = document.createElement("div");
    div.classList.add("item");
    div.innerHTML = `<p style="margin-top:10px; font-weight:bold;">${show}</p><div class="notaShow-container"></div>`;
    const cont = div.querySelector(".notaShow-container");

    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML = "★";
      btn.style.position = "relative";

      btn.onclick = (e) => {
        const clickX = e.offsetX;
        const width = btn.offsetWidth;
        let nota = i; // estrela inteira

        if (clickX < width / 2) nota = i - 0.5;

        if (nota === 5 && notaMaximaDada) {
          alert("Você só pode dar nota 5 para um show da noite!");
          nota = 4.5; // força menos de 5
        }

        cont.querySelectorAll("button").forEach((b, j) => {
          b.classList.remove("active");
          b.classList.remove("meia");

          if (j + 1 < nota) b.classList.add("active");
          else if (j + 1 === Math.ceil(nota) && nota % 1 !== 0) b.classList.add("meia");
          else if (j + 1 <= nota) b.classList.add("active");
        });

        div.dataset.nota = nota;

        // atualiza controle do 5
        if (nota === 5) notaMaximaDada = true;
        else if (nota < 5) {
          notaMaximaDada = Array.from(containerNotas.querySelectorAll('.item')).some(d => parseFloat(d.dataset.nota) === 5);
        }
      };

      cont.appendChild(btn);
    }

    containerNotas.appendChild(div);
  });

  // RENDER BEBIDAS COM ACORDEÃO 
  estrutura.forEach(cat => {
    const catDiv = document.createElement("div");
    catDiv.classList.add("categoria-bebida-wrapper");
    catDiv.innerHTML = `
      <div class="header-categoria" onclick="this.parentElement.classList.toggle('aberto')">
        <span class="nome-cat">${cat.nome}</span> 
        <span class="seta-indicadora">▼</span>
      </div>
      <div class="lista-sub-bebidas"></div>
    `;
    
    const subLista = catDiv.querySelector(".lista-sub-bebidas");
    cat.sabores.forEach(sabor => {
      const item = document.createElement("div");
      item.classList.add("card-bebida");
      const idLimpo = `${cat.nome}-${sabor}`.replace(/\s+/g, '-');
      item.innerHTML = `
        <span class="nome-bebida">${sabor}</span>
        <div class="controles-qtd">
          <button type="button" onclick="ajustarQtd('${idLimpo}', -1)">-</button>
          <input type="number" id="qtd-${idLimpo}" value="0" class="bebidaQtd" readonly>
          <button type="button" onclick="ajustarQtd('${idLimpo}', 1)">+</button>
        </div>
      `;
      subLista.appendChild(item);
    });
    containerBebidas.appendChild(catDiv);
  });
}


async function ativarCamera() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: usandoFrontal ? "user" : "environment"
      }
    });

    streamRecurso = s;

    const video = document.getElementById('videoFullscreen');

    if (video) {
      video.srcObject = s;

      // controla espelho
      if (usandoFrontal) {
        video.classList.add("video-frontal");
      } else {
        video.classList.remove("video-frontal");
      }
    }

    document.getElementById('cameraFullscreen').style.display = "block";

    // esconde modal
    document.getElementById("janela-registrar-dia").style.display = "none";

  } catch (e) {
    alert("Erro ao abrir câmera.");
  }
}

function abrirOuRefazerFoto() {
  fotoCapturada = null;

  const preview = document.getElementById("previewFoto");
  if (preview) preview.style.display = "none";

  ativarCamera();
}

function capturarFoto() {
  const video = document.getElementById('videoFullscreen');
  if (!video) return;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");

  // corrige espelho da frontal
  if (usandoFrontal) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(video, 0, 0);

  const imagem = canvas.toDataURL("image/png");

  const flash = document.getElementById("flashCamera");
if (flash) {
  flash.classList.add("flash-ativo");

  setTimeout(() => {
    flash.classList.remove("flash-ativo");
  }, 250);
}

  const preview = document.getElementById("previewFoto");
  if (preview) {
    preview.src = imagem;
    preview.style.display = "block";
  }

  fecharCamera();

  const btn = document.getElementById("btnAtivarCamera");
  if (btn) {
    btn.innerText = "Tirar outra foto";
  }
}

function fecharCamera() {
  if (streamRecurso) {
    streamRecurso.getTracks().forEach(t => t.stop());
    streamRecurso = null;
  }

  const tela = document.getElementById('cameraFullscreen');
  if (tela) tela.style.display = "none";

  document.getElementById("janela-registrar-dia").style.display = "flex";
}

function enviarRegistro() {
  const arroba = document.getElementById("inputAmigos").value;
  if(arroba) salvarSugestaoAmigo(arroba);
  let user = getUsuarioLogado();
  let chave = "registros_" + user.usuario;
  let regs = JSON.parse(localStorage.getItem(chave)) || [];
  regs.push({ dia: diaSelecionado, mes: mesAtual });
  localStorage.setItem(chave, JSON.stringify(regs));
  alert("Dia registrado!");
  fecharJanelaRegistrarDia(); renderizarCalendario();
}

function trocarCamera() {
  usandoFrontal = !usandoFrontal;

  if (streamRecurso) {
    streamRecurso.getTracks().forEach(t => t.stop());
  }

  ativarCamera();
}
