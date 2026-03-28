const monthNames = ["Jun", "Jul"];
let currentMonth = 0;
const year = 2026;

const now = new Date(2026, 5, 16, 12, 0, 0); //dia fake

function dentroDoEvento(month, day) {
  if (month === 0 && day >= 3) return true;
  if (month === 1 && day <= 5) return true;
  return false;
}

function getStatus(month, day) {
  if (!dentroDoEvento(month, day)) return "fora";

  let realMonth = month === 0 ? 5 : 6;
  let dataEvento = new Date(year, realMonth, day);

  let inicio = new Date(dataEvento);
  inicio.setDate(inicio.getDate() + 1);
  inicio.setHours(0, 0, 0, 0);

  let fim = new Date(inicio);
  fim.setHours(23, 59, 59, 999);

  if (now < inicio) return "bloqueado";
  if (now >= inicio && now <= fim) return "disponivel";
  return "encerrado";
}

function renderCalendar() {
  const daysContainer = document.getElementById("dias");
  const monthLabel = document.getElementById("Mes");

  daysContainer.innerHTML = "";
  monthLabel.innerText = monthNames[currentMonth];

  let realMonth = currentMonth === 0 ? 5 : 6;
  let firstDay = new Date(year, realMonth, 1).getDay();
  let totalDays = new Date(year, realMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    daysContainer.innerHTML += "<div></div>";
  }

  for (let day = 1; day <= totalDays; day++) {
    let flag = document.createElement("div");
    flag.classList.add("flag");
    flag.innerText = day;

    let status = getStatus(currentMonth, day);
    flag.classList.add(status);

    // CONTROLE DE CLIQUE 
    flag.onclick = () => {
      if (flag.classList.contains("disponivel")) {
        openModal();
      } 
      else if (flag.classList.contains("encerrado")) {
        openAviso(); 
      } 
      else if (flag.classList.contains("bloqueado")) {
        openBloqueado();
      }
    };

    daysContainer.appendChild(flag);
  }
}

function openBloqueado() {
  document.getElementById("modalBloqueado").style.display = "block";
}

function closeBloqueado() {
  document.getElementById("modalBloqueado").style.display = "none";
}

function nextMonth() {
  if (currentMonth < 1) {
    currentMonth++;
    renderCalendar();
  }
}

function prevMonth() {
  if (currentMonth > 0) {
    currentMonth--;
    renderCalendar();
  }
}

let currentView = "ponto";

function showPage(target) {
  if (target === currentView) return;

  const ordemPaginas = ["ponto", "programacao", "retrospectiva"];

  const atualIndex = ordemPaginas.indexOf(currentView);
  const novoIndex = ordemPaginas.indexOf(target);

  // define direção
  const direcao = novoIndex > atualIndex ? "esquerda" : "direita";

  document.getElementById(currentView).classList.remove("active");
  document.getElementById(target).classList.add("active");

  currentView = target;
  updateMenu(target);

  if (target === "ponto") {
    trocarFundo("/frontend/imagens/fundo-point.png");
  }

  if (target === "programacao") {
    trocarFundo("/frontend/imagens/fundo-progamação.png");
  }

  if (target === "retrospectiva") {
    trocarFundo("/frontend/imagens/fundo-retrospectiva.png");
  }
  }

function updateMenu(active) {
  document.querySelectorAll(".menu-wrapper button").forEach(btn => {
    btn.classList.remove("active");
  });

  document.getElementById("btn" + capitalize(active)).classList.add("active");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

renderCalendar();

/* MODAL LOGIN */
function openModal() {
  document.getElementById("authModal").style.display = "block";
}

function closeModal() {
  document.getElementById("authModal").style.display = "none";
}

/* MODAL AVISO (ENCERRADO) */

function openAviso() {
  document.getElementById("modalAviso").style.display = "block";
}

function closeAviso() {
  document.getElementById("modalAviso").style.display = "none";
}


window.onclick = (e) => {
  if (e.target.id === "modalAviso") closeAviso();
  if (e.target.id === "modalBloqueado") closeBloqueado();
  if (e.target.id === "authModal") closeModal();
};

/* TABS LOGIN */

function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
}

function showRegister() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
}

/* REGISTRO */

function register() {
  const email = document.getElementById("cadastroEmail").value;
  const senha = document.getElementById("cadastroSenha").value;
  const insta = document.getElementById("cadastroInstagram").value;

  if (!email || !senha || !insta) {
    alert("Preencha tudo!");
    return;
  }

  localStorage.setItem("usuario", JSON.stringify({ email, senha, insta }));

  alert("Conta criada!");
  closeModal();
}

/* LOGIN*/

function login() {
  const usuario = document.getElementById("loginUsuario").value;
  const senha = document.getElementById("loginSenha").value;

  const dados = JSON.parse(localStorage.getItem("usuario"));

  if (dados && senha === dados.senha && (usuario === dados.email || usuario === dados.insta)) {
    alert("Login OK!");
    closeModal();
    setLogged(true);
  } else {
    alert("Erro no login!");
  }
}

/* BOTÃO LOGIN TOPO */

window.addEventListener("DOMContentLoaded", () => {

  const btnLoginTopo = document.getElementById("btn-login-topo");

  if (btnLoginTopo) {
    btnLoginTopo.addEventListener("click", () => {
      const logged = btnLoginTopo.dataset.logged === "true";

      if (logged) {
        setLogged(false);
      } else {
        openModal();
      }
    });
  }

});
function setLogged(state) {
  const btnLoginTopo = document.getElementById("btn-login-topo");
  btnLoginTopo.dataset.logged = state;
  btnLoginTopo.innerText = state ? "Sair" : "Entrar";
}

document.body.classList.add("point");

const ordemPaginas = ["ponto", "programacao", "retrospectiva"];

function trocarFundo(novaImagem) {
  const bg1 = document.querySelector(".bg1");
  const bg2 = document.querySelector(".bg2");

  // 🔥 GARANTE QUE O FUNDO ATUAL EXISTE
  if (!bg1.style.backgroundImage) {
    bg1.style.backgroundImage = window.getComputedStyle(bg1).backgroundImage;
  }

  // nova imagem entra da esquerda
  bg2.style.transition = "none";
  bg2.style.transform = "translateX(-100%)";
  bg2.style.backgroundImage = `url(${novaImagem})`;

  // força render
  bg2.offsetHeight;

  // animação: atual → direita | novo → centro
  bg1.style.transition = "transform 0.6s ease-in-out";
  bg2.style.transition = "transform 0.6s ease-in-out";

  bg1.style.transform = "translateX(100%)";
  bg2.style.transform = "translateX(0)";

  setTimeout(() => {
    // fixa novo fundo
    bg1.style.backgroundImage = `url(${novaImagem})`;

    // reset sem quebrar
    bg1.style.transition = "none";
    bg2.style.transition = "none";

    bg1.style.transform = "translateX(0)";
    bg2.style.transform = "translateX(-100%)";
  }, 600);
}

window.addEventListener("DOMContentLoaded", () => {
  const bg1 = document.querySelector(".bg1");
  bg1.style.backgroundImage = 'url("/frontend/imagens/fundo-point.png")';
});


function atualizarTempoRestante() {
  const fimEvento = new Date("2026-06-05T23:59:59"); // coloque a data/hora do fim do evento
  const agora = new Date();
  const diff = fimEvento - agora;

  if (diff <= 0) {
    document.getElementById("tempoRestante").innerText = "O evento terminou!";
    return;
  }

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diff / (1000 * 60)) % 60);
  const segundos = Math.floor((diff / 1000) % 60);

  document.getElementById("tempoRestante").innerText = 
    `${dias} dias, ${horas}h ${minutos}m ${segundos}s restantes`;
}

// Atualiza a cada segundo
setInterval(atualizarTempoRestante, 1000);

function atualizarTempoProgramacao() {
  const inicioProgramacao = new Date("2026-03-31T00:00:00"); // data/hora da programação
  const agora = new Date();
  const diff = inicioProgramacao - agora;

  const elemento = document.getElementById("tempoProgramacao");

  if (diff <= 0) {
    elemento.innerText = "A programação já está disponível!";
    return;
  }

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diff / (1000 * 60)) % 60);
  const segundos = Math.floor((diff / 1000) % 60);

  elemento.innerText = `${dias} dias, ${horas}h ${minutos}m ${segundos}s restantes`;
}

// Atualiza a cada segundo
setInterval(atualizarTempoProgramacao, 1000);