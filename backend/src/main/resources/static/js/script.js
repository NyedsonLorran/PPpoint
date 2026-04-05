const nomesMeses = ["Jun", "Jul"];
let mesAtual = 0; // 0 para Junho, 1 para Julho
const ano = 2026;
const agoraFixo = new Date(2026, 5, 9, 12, 0, 0); // Simulação de data atual
let diaSelecionado = null;
let streamRecurso = null;
let fotoCapturada = null;

function usuarioLogado() {
  const btn = document.getElementById("btnLogin");
  return btn && btn.dataset.logged === "true";
}

function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem("usuarioLogado"));
}

function dentroDoEvento(mes, dia) {
  if (mes === 0 && dia >= 3) return true;
  if (mes === 1 && dia <= 5) return true;
  return false;
}

function obterStatus(mes, dia) {
  if (!dentroDoEvento(mes, dia)) return "fora";

  let mesReal = mes === 0 ? 5 : 6;
  let dataEvento = new Date(ano, mesReal, dia);

  let inicio = new Date(dataEvento);
  inicio.setDate(inicio.getDate() + 1);
  inicio.setHours(0,0,0,0);

  let fim = new Date(inicio);
  fim.setHours(23,59,59,999);

  if (agoraFixo < inicio) return "bloqueado";
  if (agoraFixo >= inicio && agoraFixo <= fim) return "disponivel";
  return "encerrado";
}

function renderizarCalendario() {
  const containerDias = document.getElementById("dias");
  const labelMes = document.getElementById("Mes");

  if(!containerDias) return;
  containerDias.innerHTML = "";
  labelMes.innerText = nomesMeses[mesAtual];

  let mesReal = mesAtual === 0 ? 5 : 6;
  let primeiroDia = new Date(ano, mesReal, 1).getDay();
  let totalDias = new Date(ano, mesReal + 1, 0).getDate();

  let usuario = getUsuarioLogado();
  let registros = [];

  if (usuario) {
    let chave = "registros_" + usuario.usuario;
    registros = JSON.parse(localStorage.getItem(chave)) || [];
  }

  for (let i = 0; i < primeiroDia; i++) {
    containerDias.innerHTML += "<div></div>";
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    let flag = document.createElement("div");
    flag.classList.add("flag");
    flag.innerText = dia;

    let status = obterStatus(mesAtual, dia);
    let jaRegistrado = registros.some(r => r.dia === dia && r.mes === mesAtual);

    if (jaRegistrado) {
      flag.classList.add("encerrado");
    } else {
      flag.classList.add(status);
    }

    flag.onclick = () => {
      if (jaRegistrado && status === "disponivel") {
        alert("Você já registrou esse dia!");
        return;
      }
      if (jaRegistrado) return;

      if (status === "disponivel") {
        if (!usuarioLogado()) {
          abrirLoginCadastro();
          return;
        }
        diaSelecionado = dia;
        abrirJanelaRegistrarDia();
      } else if (status === "encerrado") {
        abrirJanelaEncerrado();
      } else if (status === "bloqueado") {
        abrirJanelaBloqueado();
      }
    };
    containerDias.appendChild(flag);
  }
}

function proximoMes() { if (mesAtual < nomesMeses.length - 1) { mesAtual++; renderizarCalendario(); } }
function mesAnterior() { if (mesAtual > 0) { mesAtual--; renderizarCalendario(); } }

function mostrarPagina(pagina) {
  document.querySelectorAll(".pagina").forEach(p => p.classList.remove("active"));
  document.getElementById(pagina).classList.add("active");

  document.querySelectorAll(".menu button").forEach(btn => btn.classList.remove("active"));
  if (pagina === "programacao") document.getElementById("btnProgramacao").classList.add("active");
  if (pagina === "ponto") document.getElementById("btnPonto").classList.add("active");
  if (pagina === "retrospectiva") document.getElementById("btnRetrospectiva").classList.add("active");

  document.body.classList.remove("fundo-programacao","fundo-ponto","fundo-retro");
  if (pagina === "programacao") document.body.classList.add("fundo-programacao");
  if (pagina === "ponto") document.body.classList.add("fundo-ponto");
  if (pagina === "retrospectiva") document.body.classList.add("fundo-retro");
}

function abrirLoginCadastro() { document.getElementById("janela-login").style.display = "flex"; }
function fecharLoginCadastro() { document.getElementById("janela-login").style.display = "none"; }
function mostrarLogin() { document.getElementById("loginForm").style.display = "block"; document.getElementById("registerForm").style.display = "none"; }
function mostrarCadastro() { document.getElementById("loginForm").style.display = "none"; document.getElementById("registerForm").style.display = "block"; }

async function registrar() {
  const email = document.getElementById("cadastroEmail").value;
  const senha = document.getElementById("cadastroSenha").value;
  const usuario = document.getElementById("cadastroUsuario").value;
  const senhaConf = document.getElementById("cadastroSenhaConfirm").value;

  if (!email || !senha || !usuario || !senhaConf) { alert("Preencha todos os campos!"); return; }
  if(senha !== senhaConf){ alert("As senhas não conferem!"); return; }

    try {
        const res = await fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: usuario,
                email,
                password: senha,
                confirmPassword: senhaConf
            })
        });

        if (res.status === 201) {
            alert("Conta criada com sucesso!");
            mostrarLogin();
        } else {
            const data = await res.json();
            alert("Erro: " + data.message);
        }
    } catch (e) {
        alert("Erro ao conectar com o servidor.");
    }
}

async function fazerLogin() {
  const emailInput = document.getElementById("loginUsuario").value;
  const senhaInput = document.getElementById("loginSenha").value;

    if (!emailInput || !senhaInput) { alert("Preencha todos os campos!"); return; }

    try {
        const res = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: emailInput,
                password: senhaInput
            })
        });

        if (res.ok) {
            const data = await res.json();
            sessionStorage.setItem("token", data.token);
            localStorage.setItem("usuarioLogado", JSON.stringify({
                usuario: emailInput,
                email: emailInput
            }));
            fecharLoginCadastro();
            definirLogado(true);
            renderizarCalendario();
        } else {
            const data = await res.json();
            alert("Erro: " + data.message);
        }
    } catch (e) {
        alert("Erro ao conectar com o servidor.");
    }
}

function definirLogado(estado) {
  const botao = document.getElementById("btnLogin");
  botao.dataset.logged = estado;
  botao.innerText = estado ? "Sair" : "Entrar";
  if (!estado) { localStorage.removeItem("usuarioLogado"); location.reload(); }
}

function abrirJanelaEncerrado() { document.getElementById("janela-dia-encerrado").style.display = "flex"; }
function fecharJanelaEncerrado() { document.getElementById("janela-dia-encerrado").style.display = "none"; }
function abrirJanelaBloqueado() { document.getElementById("janela-dia-Bloqueado").style.display = "flex"; }
function fecharJanelaBloqueado() { 
  const janela = document.getElementById("janela-dia-Bloqueado");
  if (janela) {
    janela.style.display = "none"; 
  }
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

function getProgramacaoPorDia(dia, mes) {
  const programacao = { 
    "0-8": ["Calcinha Preta", "Zé Cantor", "Garota Safada"], 
    "0-9": ["Wesley Safadão", "Taty Girl", "Limão com Mel"] 
  };
  return programacao[`${mes}-${dia}`] || ["Show Geral"];
}

function getEstruturaBebidas() {
  return [
    { nome: "Beats", sabores: ["Azul", "Vermelha", "Verde", "Beats 1L"] },
    { nome: "Matuta", sabores: ["Mel e Limão", "Canela", "Cristal", "Coco"] },
    { nome: "Cerveja", sabores: ["Brahma", "Heineken", "Skol"] },
    { nome: "Outros", sabores: ["Água", "Refrigerante"] }
  ];
}

function carregarDadosFormulario() {
  let shows = getProgramacaoPorDia(diaSelecionado, mesAtual);
  let estrutura = getEstruturaBebidas();
  const containerNotas = document.getElementById("notasShows");
  const containerBebidas = document.getElementById("listaBebidas");

  containerNotas.innerHTML = "";
  containerBebidas.innerHTML = "";

  // --- RENDER NOTAS (5 ESTRELAS COM MEIA, SÓ UM 5 POR NOITE) ---
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

  // --- RENDER BEBIDAS COM ACORDEÃO ---
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

function ajustarQtd(id, mudanca) {
  const input = document.getElementById(`qtd-${id}`);
  let v = (parseInt(input.value) || 0) + mudanca;
  if (v < 0) v = 0;
  input.value = v;
  const card = input.closest('.card-bebida');
  v > 0 ? card.classList.add('com-item') : card.classList.remove('com-item');
}

function abrirJanelaRegistrarDia() {
  document.getElementById("fundoTransparente").style.display = "block";
  document.getElementById("janela-registrar-dia").style.display = "flex";
  const usuario = getUsuarioLogado();
  const areaCam = document.getElementById("areaCamera");
  if (usuario && areaCam) {
    const registros = JSON.parse(localStorage.getItem("registros_" + usuario.usuario)) || [];
    areaCam.style.display = (registros.length === 0) ? "block" : "none";
  }
  carregarDadosFormulario(); 
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

      // 🔥 controla espelho
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

  // 🔥 AGORA FUNCIONA
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

let usandoFrontal = false;

function trocarCamera() {
  usandoFrontal = !usandoFrontal;

  if (streamRecurso) {
    streamRecurso.getTracks().forEach(t => t.stop());
  }

  ativarCamera();
}

function fecharEsqueciSenha() {
  const container = document.getElementById("janela-esqueci-senha");
  if (container) {
    container.style.setProperty("display", "none", "important");
  }

  const janelas = document.querySelectorAll(".janela-recuperacao");
  janelas.forEach(janela => {
    janela.style.setProperty("display", "none", "important");
  });
}

function abrirEsqueciSenha() {
  const container = document.getElementById("janela-esqueci-senha");
  const janela = document.querySelector(".janela-recuperacao");

  if (container) {
    container.style.setProperty("display", "flex", "important");
  }
  if (janela) {
    janela.style.setProperty("display", "block", "important");
  }
}
const fundoRecuperacao = document.getElementById("janela-esqueci-senha");
if(fundoRecuperacao){
  fundoRecuperacao.addEventListener("click", function(e){
    if(e.target === this){ 
      fecharEsqueciSenha();
    }
  });
}



function enviarRecuperacao() {
  const email = document.getElementById("emailRecuperacao").value;
  if (!email) { alert("Digite um email válido!"); return; }
  alert(`Instruções de recuperação enviadas para ${email} `);
  fecharEsqueciSenha();
}

function atualizarProgramacao() {
  const programacaoDias = Array.from(document.querySelectorAll('.programacao-dia'));
  if (programacaoDias.length === 0) return;
  const hoje = new Date(agoraFixo.getFullYear(), agoraFixo.getMonth(), agoraFixo.getDate());
  programacaoDias.forEach(diaDiv => {
    const diaNum = parseInt(diaDiv.querySelector('.dia-numero').innerText);
    const mesStr = diaDiv.querySelector('.mes').innerText;
    const meses = { 'Jun': 5, 'Jul': 6 };
    const dataEvento = new Date(2026, meses[mesStr], diaNum);
    diaDiv.classList.remove('encerrado','disponivel','normal');
    if (dataEvento < hoje) diaDiv.classList.add('encerrado');
    else if (dataEvento.getTime() === hoje.getTime()) diaDiv.classList.add('disponivel');
    else diaDiv.classList.add('normal');
  });
}

const inputGaleria = document.getElementById("inputGaleria");

if (inputGaleria) {
  inputGaleria.addEventListener("change", function(e) {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function(ev) {
        const preview = document.getElementById("previewFoto");
        if (preview) {
          preview.src = ev.target.result;
          preview.style.display = "block";
        }
      };

      reader.readAsDataURL(file);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("usuarioLogado")) definirLogado(true);
  renderizarCalendario();
  atualizarProgramacao();
  
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
  if(btnL) btnL.onclick = () => { if (btnL.dataset.logged === "true") definirLogado(false); else abrirLoginCadastro(); };
});