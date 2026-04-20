let usandoFrontal = false;

let amigosSelecionados = [];

window.addEventListener("DOMContentLoaded", () => {
  const inputAmigos = document.getElementById("inputAmigos");

  if (!inputAmigos) return;

  inputAmigos.value = "@";

  function adicionarAmigo() {
    let valor = inputAmigos.value.replace(/@/g, "").trim();

    if (!valor) return;

    valor = "@" + valor;

    if (amigosSelecionados.includes(valor)) {
      inputAmigos.value = "@";
      return;
    }

    amigosSelecionados.push(valor);
    renderizarAmigos();

    inputAmigos.value = "@";
  }

  inputAmigos.addEventListener("input", function () {
    let valor = this.value;

    if (valor.includes(" ")) {
      valor = valor.replace(/\s/g, "");
      this.value = "@" + valor;
      adicionarAmigo();
      return;
    }

    valor = valor.replace(/@/g, "").replace(/\s/g, "");
    this.value = "@" + valor;
  });

  inputAmigos.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      adicionarAmigo();
    }
  });
});;

async function abrirJanelaRegistrarDia() {
  document.getElementById("fundoTransparente").style.display = "block";
  document.getElementById("janela-registrar-dia").style.display = "flex";

  amigosSelecionados = [];
  renderizarAmigos();

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
  document.getElementById("tituloRegistro").innerText = `REGISTRAR DIA ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}

function fecharJanelaRegistrarDia() {
  document.getElementById("fundoTransparente").style.display = "none";
  document.getElementById("janela-registrar-dia").style.display = "none";
  if (streamRecurso) { streamRecurso.getTracks().forEach(t => t.stop()); streamRecurso = null; }
}

function removerAmigo(index) {
  amigosSelecionados.splice(index, 1);
  renderizarAmigos();
}

function selecionarDaGaleria(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    fotoCapturada = e.target.result;

    const preview = document.getElementById("previewFoto");

    if (preview) {
      preview.src = fotoCapturada;
      preview.style.display = "block";
    }
  };

  reader.readAsDataURL(file);
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

async function getEstruturaBebidas() {
  try {
    const res = await fetch(`${API_URL}/bebidas`);
    if (!res.ok) throw new Error("Erro ao buscar bebidas");
    return await res.json();
  } catch (e) {
    console.error("Erro ao carregar bebidas:", e);
    return [];
  }
}

async function carregarDadosFormulario() {
  let shows = await getProgramacaoPorDia(diaSelecionado, mesAtual);
  let estrutura = await getEstruturaBebidas();
  const containerNotas = document.getElementById("notasShows");
  const containerBebidas = document.getElementById("listaBebidas");

  containerNotas.innerHTML = "";
  containerBebidas.innerHTML = "";

  let notaMaximaDada = false; 
  shows.forEach(show => {
    const div = document.createElement("div");
    div.classList.add("item");
    div.innerHTML = `<p class="nome-show" style="margin-top:15px; margin-bottom:5px;">${show}</p><div class="notaShow-container"></div>`;
    const cont = div.querySelector(".notaShow-container");

    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML = "★";
      btn.style.position = "relative";

      btn.onclick = (e) => {
        const clickX = e.offsetX;
        const width = btn.offsetWidth;
        let nota = i; 

        if (clickX < width / 2) nota = i - 0.5;

        if (nota === 5 && notaMaximaDada) {
          alert("Você só pode dar nota 5 para um show da noite!");
          nota = 4.5;
        }

        cont.querySelectorAll("button").forEach((b, j) => {
          b.classList.remove("active");
          b.classList.remove("meia");

          if (j + 1 < nota) b.classList.add("active");
          else if (j + 1 === Math.ceil(nota) && nota % 1 !== 0) b.classList.add("meia");
          else if (j + 1 <= nota) b.classList.add("active");
        });

        div.dataset.nota = nota;

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
    cat.bebidas.forEach(bebida => {
      const item = document.createElement("div");
      item.classList.add("card-bebida");
      const idLimpo = bebida.id;
      item.innerHTML = `
        <span class="nome-bebida">${bebida.nome}</span>
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

function coletarBebidas() {
  const inputs = document.querySelectorAll(".bebidaQtd");
  let bebidas = [];

  inputs.forEach(input => {
    const qtd = parseInt(input.value);

    if (qtd > 0) {
      const nome = input.closest(".card-bebida")
        .querySelector(".nome-bebida").innerText;

      bebidas.push({
        nome: nome,
        quantidade: qtd
      });
    }
  });

  return bebidas;
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

      if (usandoFrontal) {
        video.classList.add("video-frontal");
      } else {
        video.classList.remove("video-frontal");
      }
    }

    document.getElementById('cameraFullscreen').style.display = "block";
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

  if (usandoFrontal) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(video, 0, 0);

  const imagem = canvas.toDataURL("image/png");

  // 🔥 salva foto
  fotoCapturada = imagem;

  // 🔥 mostra preview
  const preview = document.getElementById("previewFoto");
  if (preview) {
    preview.src = imagem;
    preview.style.display = "block";
  }

  // 🔥 fecha câmera automaticamente
  fecharCamera();
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

async function enviarRegistro() {
  let user = getUsuarioLogado();

  if (!user) {
    alert("Usuário não logado");
    return;
  }

  const payload = {
    usuario: user.usuario,
    data: formatarData(),
    amigos: amigosSelecionados || [],
    notasShows: coletarNotasShows() || [],
    bebidas: coletarBebidas() || [],
    foto: fotoCapturada || null
  };

  console.log("ENVIANDO:", payload);

  try { 
    const resposta = await fetch(`${API_URL}/api/registros-diarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!resposta.ok) throw new Error();

    alert("Registro enviado com sucesso!");
    fecharJanelaRegistrarDia();
    renderizarCalendario();

  } catch (e) {
    console.error(e);
    alert("Erro ao enviar");
  }
}

function formatarData() {
  let mesReal = mesAtual === 0 ? 5 : 6;
  const d = new Date(ano, mesReal, diaSelecionado);
  return d.toISOString().split("T")[0];
}

function trocarCamera() {
  usandoFrontal = !usandoFrontal;

  if (streamRecurso) {
    streamRecurso.getTracks().forEach(t => t.stop());
  }

  ativarCamera();
}

function coletarNotasShows() {
  const itens = document.querySelectorAll("#notasShows .item");
  let notas = [];

  itens.forEach(item => {
    const nome = item.querySelector(".nome-show").innerText;
    const nota = parseFloat(item.dataset.nota || 0);

    if (nota > 0) {
      notas.push({ show: nome, nota: nota });
    }
  });

  return notas;
}

function renderizarAmigos() {
  const lista = document.getElementById("listaAmigos");

  if (!lista) return;

  lista.innerHTML = "";

  amigosSelecionados.forEach((amigo, index) => {
    const tag = document.createElement("span");
    tag.classList.add("tag-amigo");

    tag.innerHTML = `
      ${amigo}
      <button type="button" class="btn-remover-amigo">×</button>
    `;

    const btn = tag.querySelector(".btn-remover-amigo");

    btn.onclick = (e) => {
      e.stopPropagation(); 
      removerAmigo(index);
    };

    lista.appendChild(tag);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const inputGaleria = document.getElementById("inputGaleria");

  if (inputGaleria) {
    inputGaleria.addEventListener("change", selecionarDaGaleria);
  }
});