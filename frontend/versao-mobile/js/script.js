const nomesMeses = ["Jun", "Jul"];
let mesAtual = 0;
const ano = 2026;
const agoraFixo = new Date(2026, 5, 16, 12, 0, 0);
let paginaAtual = "ponto";


renderizarCalendario();


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

  containerDias.innerHTML = "";
  labelMes.innerText = nomesMeses[mesAtual];

  let mesReal = mesAtual === 0 ? 5 : 6;
  let primeiroDia = new Date(ano, mesReal, 1).getDay();
  let totalDias = new Date(ano, mesReal + 1, 0).getDate();

  for (let i = 0; i < primeiroDia; i++) {
    containerDias.innerHTML += "<div></div>";
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    let flag = document.createElement("div");
    flag.classList.add("flag");
    flag.innerText = dia;

    let status = obterStatus(mesAtual, dia);
    flag.classList.add(status);

    flag.onclick = () => {
      if (status === "disponivel") abrirLoginCadastro();
      else if (status === "encerrado") abrirJanelaEncerrado();
      else if (status === "bloqueado") abrirJanelaBloqueado();
    };

    containerDias.appendChild(flag);
  }
}

function proximoMes() {
  if (mesAtual < 1) {
    mesAtual++;
    renderizarCalendario();
  }
}

function mesAnterior() {
  if (mesAtual > 0) {
    mesAtual--;
    renderizarCalendario();
  }
}

function mostrarPagina(alvo) {
  if (alvo === paginaAtual) return;

  document.getElementById(paginaAtual).classList.remove("active");
  document.getElementById(alvo).classList.add("active");

  paginaAtual = alvo;
  atualizarMenu(alvo);
}

function atualizarMenu(ativo) {
  document.querySelectorAll(".menu-wrapper button")
    .forEach(btn => btn.classList.remove("active"));

  document.getElementById("btn" + ativo.charAt(0).toUpperCase() + ativo.slice(1))
    .classList.add("active");
}

function abrirLoginCadastro() {
  document.getElementById("janela-login/cadastro").style.display = "block";
}

function fecharLoginCadastro() {
  document.getElementById("janela-login/cadastro").style.display = "none";
}

function abrirJanelaEncerrado() {
  document.getElementById("janela-dia-encerrado").style.display = "block";
}

function fecharJanelaEncerrado() {
  document.getElementById("janela-dia-encerrado").style.display = "none";
}

function abrirJanelaBloqueado() {
  document.getElementById("janela-dia-Bloqueado").style.display = "block";
}

function fecharJanelaBloqueado() {
  document.getElementById("janela-dia-Bloqueado").style.display = "none";
}

function abrirJanelaRegistrarDia() {
  document.getElementById("janela-registrar-dia").style.display = "block";
}

function fecharJanelaRegistrarDia() {
  document.getElementById("janela-registrar-dia").style.display = "none";
}

function mostrarLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";

  const botoes = document.querySelectorAll(".botoes-logar-registrar button");
  botoes.forEach(btn => btn.classList.remove("active"));
  botoes[0].classList.add("active");
}

function mostrarCadastro() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";

  const botoes = document.querySelectorAll(".botoes-logar-registrar button");
  botoes.forEach(btn => btn.classList.remove("active"));
  botoes[1].classList.add("active");
}

function registrar() {
  const email = document.getElementById("cadastroEmail").value;
  const senha = document.getElementById("cadastroSenha").value;
  const insta = document.getElementById("cadastroInstagram").value;

  if (!email || !senha || !insta) {
    alert("Preencha tudo!");
    return;
  }

  localStorage.setItem("usuario", JSON.stringify({ email, senha, insta }));
  alert("Conta criada!");
  fecharLoginCadastro();
}

function fazerLogin() {
  const usuario = document.getElementById("loginUsuario").value;
  const senha = document.getElementById("loginSenha").value;
  const dados = JSON.parse(localStorage.getItem("usuario"));

  if (dados && senha === dados.senha &&
      (usuario === dados.email || usuario === dados.insta)) {

    alert("Login OK!");
    fecharLoginCadastro();
    definirLogado(true);

  } else {
    alert("Erro no login!");
  }
}

function definirLogado(estado) {
  const botao = document.getElementById("btn-login-topo");
  botao.dataset.logged = estado;
  botao.innerText = estado ? "Sair" : "Entrar";
}

window.addEventListener("DOMContentLoaded", () => {
  const botao = document.getElementById("btn-login-topo");

  if (botao) {
    botao.addEventListener("click", () => {
      const logado = botao.dataset.logged === "true";
      if (logado) definirLogado(false);
      else abrirLoginCadastro();
    });
  }
});