 function dentroDoEvento(mes, dia) {
  if (mes === 0 && dia >= 3) return true;
  if (mes === 1 && dia <= 5) return true;
  return false;
}

 function obterStatus(mes, dia) {
  if (!dentroDoEvento(mes, dia)) return "fora";

  let mesReal = mes === 0 ? 5 : 6;
  let dataEvento = new Date(ano, mesReal, dia);

  // início 17:00 do próprio dia
  let inicio = new Date(dataEvento);
  inicio.setHours(17, 0, 0, 0);

  // fim 16:59 do dia seguinte
  let fim = new Date(inicio);
  fim.setDate(fim.getDate() + 1);
  fim.setHours(16, 59, 59, 999);

  const agora = getAgora();

  if (agora < inicio) return "bloqueado";
  if (agora >= inicio && agora <= fim) return "disponivel";
  return "encerrado";
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
    const email = usuario.usuario.toLowerCase().trim();
    registros = registros.filter(r =>
      r && r.usuario && r.data &&
      r.usuario.toLowerCase().trim() === email
    );
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

