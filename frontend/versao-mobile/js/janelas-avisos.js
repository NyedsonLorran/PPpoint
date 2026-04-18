function abrirJanelaEncerrado() {
  document.getElementById("janela-dia-encerrado").style.display = "flex";
}

function fecharJanelaEncerrado() {
  document.getElementById("janela-dia-encerrado").style.display = "none";
}

function abrirJanelaBloqueado() {
  document.getElementById("janela-dia-Bloqueado").style.display = "flex";
}

function fecharJanelaBloqueado() { 
  const janela = document.getElementById("janela-dia-Bloqueado");
  if (janela) {
    janela.style.display = "none"; 
  }
}