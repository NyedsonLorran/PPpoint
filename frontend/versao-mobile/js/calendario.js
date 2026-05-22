function dentroDoEvento(mes, dia) {
  return true;
}

function obterStatus(mes, dia) {
  return "disponivel";
}
function renderizarCalendario() {
  const containerDias = document.getElementById("dias");
  const labelMes = document.getElementById("Mes");

  if (!containerDias) return;
  containerDias.innerHTML = "";
  labelMes.innerText = nomesMeses[mesAtual];

  let mesReal = mesAtual === 0 ? 5 : 6;
  let primeiroDia = new Date(ano, mesReal, 1).getDay();
  let totalDias = new Date(ano, mesReal + 1, 0).getDate();

  let usuario = getUsuarioLogado();
  let registros = [];

  if (usuario && usuario.usuario) {
    registros = JSON.parse(localStorage.getItem("registros_" + usuario.usuario)) || [];
  }
  
  if (usuario && usuario.usuario) {
    registros = JSON.parse(localStorage.getItem("registros_" + usuario.usuario)) || [];
  } else {
    registros = [];
  }


  for (let i = 0; i < primeiroDia; i++) {
    containerDias.innerHTML += "<div></div>";
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    let flag = document.createElement("div");
    flag.classList.add("flag");
    flag.innerText = dia;

    let status = obterStatus(mesAtual, dia);

    let dataFormatada = `${ano}-${String(mesReal + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

    let jaRegistrado = registros.some(r => r.data === dataFormatada);

    flag.classList.remove("disponivel", "bloqueado", "encerrado", "fora");

    if (jaRegistrado) {
      flag.classList.add("encerrado");
    } else {
      flag.classList.add(status);
    }

    flag.onclick = () => {
      if (jaRegistrado) {
        abrirJanelaEncerrado();
        return;
      }

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

 function proximoMes() {
  if (mesAtual < nomesMeses.length - 1)
    { mesAtual++; renderizarCalendario(); }
}

 function mesAnterior() { 
  if (mesAtual > 0) {
    mesAtual--; renderizarCalendario();
  }
}

