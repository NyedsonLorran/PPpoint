// ─── Auxiliares internos ──────────────────────────────────────────────────────

let _emailPendente = "";
let _tipoCodigo = "REGISTRO";

function _esconderPaineis() {
  ["loginForm", "registerForm", "codigoVerificacaoForm",
   "codigoResetForm", "novaSenhaForm"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

function _finalizarLogin(data, email, nome) {
  sessionStorage.setItem("token", data.token);
  sessionStorage.setItem("role", data.role);

  localStorage.setItem("usuarioLogado", JSON.stringify({
    usuario: email,
    email:   email,
    nome:    nome || email
  }));

  fecharLoginCadastro();
  definirLogado(true);
  carregarDiasDisponiveis().then(() => {
    irParaDiaAtual();
    renderizarProgramacao();
  });
  renderizarCalendario();
}

// ─── Funções originais + novas ────────────────────────────────────────────────

function usuarioLogado() {
  const btn = document.getElementById("btnLogin");
  return btn && btn.dataset.logged === "true";
}

function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem("usuarioLogado"));
}

function abrirLoginCadastro() {
  mostrarLogin();
  document.getElementById("janela-login").style.display = "flex";
}

function fecharLoginCadastro() {
  document.getElementById("janela-login").style.display = "none";
}

function mostrarLogin() {
  _esconderPaineis();
  document.getElementById("loginForm").style.display = "block";
}

function mostrarCadastro() {
  _esconderPaineis();
  document.getElementById("registerForm").style.display = "block";
}

async function registrar() {
  const email = document.getElementById("cadastroEmail").value;
  const senha = document.getElementById("cadastroSenha").value;
  const usuario = document.getElementById("cadastroUsuario").value;
  const senhaConf = document.getElementById("cadastroSenhaConfirm").value;

  if (!email || !senha || !usuario || !senhaConf) {
    alert("Preencha todos os campos!");
    return;
  }

  if (senha !== senhaConf) {
    alert("As senhas não conferem!");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usuario,
        email,
        password: senha,
        confirmPassword: senhaConf
      })
    });

    if (res.status === 201 || res.status === 202) {
      _emailPendente = email;
      _tipoCodigo = "REGISTRO";
      _esconderPaineis();
      document.getElementById("labelEmailCodigo").innerText =
        `Código enviado para ${email}`;
      document.getElementById("inputCodigo").value = "";
      document.getElementById("codigoVerificacaoForm").style.display = "block";
    } else {
      const data = await res.json();
      alert("Erro: " + data.message);
    }

  } catch (e) {
    alert("Erro ao conectar com o servidor.");
  }
}

// NOVA — verificação de email após cadastro ou login bloqueado
async function verificarCodigo() {
  const codigo = document.getElementById("inputCodigo").value.trim();
  if (codigo.length !== 6) { alert("Digite o código de 6 dígitos."); return; }

  try {
    const res = await fetch(`${API_URL}/auth/email-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: _emailPendente, codigo })
    });

    const data = await res.json();

    if (res.ok) {
      _finalizarLogin(data, _emailPendente);
    } else {
      alert("Erro: " + (data.message || "Código inválido"));
    }
  } catch (e) {
    alert("Erro ao conectar com o servidor.");
  }
}

// NOVA — reenvio de código de verificação de email
async function reenviarCodigo() {
  try {
    await fetch(`${API_URL}/auth/resend-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: _emailPendente, tipo: _tipoCodigo })
    });
    alert("Código reenviado!");
  } catch (e) {
    alert("Erro ao reenviar código.");
  }
}

async function fazerLogin() {
  const emailInput = document.getElementById("loginUsuario").value;
  const senhaInput = document.getElementById("loginSenha").value;

  if (!emailInput || !senhaInput) { 
    alert("Preencha todos os campos!"); 
    return; 
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput,
        password: senhaInput
      })
    });

    if (res.ok) {
      const data = await res.json();
      _finalizarLogin(data, emailInput);
    } else if (res.status === 403) {
      const data = await res.json();
      if (data.message === "EMAIL_NAO_VERIFICADO") {
        _emailPendente = data.email || emailInput;
        _tipoCodigo = "REGISTRO";
        _esconderPaineis();
        document.getElementById("labelEmailCodigo").innerText =
          `Código enviado para ${_emailPendente}`;
        document.getElementById("inputCodigo").value = "";
        document.getElementById("codigoVerificacaoForm").style.display = "block";
      }
    } else {
      const data = await res.json();
      alert("Erro: " + (data.message || "Tente novamente"));
    }

  } catch (e) {
    console.error(e);
    alert("Erro ao conectar com o servidor.");
  }
}

let googleButtonRendered = false;

function loginComGoogle() {
    const btnGoogle = document.getElementById("btnGoogleLogin");
    const container = document.getElementById("google-btn-container");

    if (!container) {
        console.error("Container Google não encontrado.");
        return;
    }

    // Remove o botão customizado do layout
    if (btnGoogle) {
        btnGoogle.style.visibility = "hidden";
        btnGoogle.style.opacity = "0";
        btnGoogle.style.pointerEvents = "none";
        btnGoogle.style.height = "0";
        btnGoogle.style.margin = "0";
        btnGoogle.style.padding = "0";
        btnGoogle.style.border = "0";
    }

    container.style.display = "block";

    // Evita múltiplos renderButton()
    if (googleButtonRendered) {
        return;
    }

    googleButtonRendered = true;

    try {
        google.accounts.id.initialize({
            client_id: "24281345430-ctit3iu4en7otpu2kjfakopamsf9pclf.apps.googleusercontent.com",
            callback: handleGoogleCredential,
        });

        google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            width: 260,
            shape: "pill",
            text: "signin_with"
        });

    } catch (error) {
        console.error("Erro login Google:", error);
        alert("Erro ao carregar login Google.");
    }
}

async function handleGoogleCredential(response) {
    const idToken = response.credential;

    try {
        const res = await fetch(`${API_URL}/auth/login/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: idToken })
        });

        const data = await res.json(); 

        if (res.ok) {
            const payload = JSON.parse(atob(idToken.split('.')[1]));
            _finalizarLogin(data, payload.email, payload.name || payload.email);
        } else {
            alert("Erro no login com Google: " + (data.message || "Tente novamente"));
        }

    } catch (e) {
        console.error(e);
        alert("Erro ao conectar com o servidor");
    }
}

function definirLogado(estado) {
  const botao = document.getElementById("btnLogin");
  botao.dataset.logged = estado;
  botao.innerText = estado ? "Sair" : "Entrar";

  if (document.getElementById("retrospectiva").classList.contains("active")) {
      initRetrospectiva();
  }

  if (!estado) {
    localStorage.removeItem("usuarioLogado");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role"); 
    location.reload();
  }
}

function toggleSenha() {
  const input = document.getElementById("loginSenha");
  const icon = document.getElementById("iconSenha");

  const hidden = input.type === "password";

  input.type = hidden ? "text" : "password";

  icon.classList.toggle("fa-eye");
  icon.classList.toggle("fa-eye-slash");
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

async function enviarRecuperacao() {
  const email = document.getElementById("emailRecuperacao").value;
  if (!email) { alert("Digite um email válido!"); return; }

  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    if (res.ok) {
      _emailPendente = email;
      fecharEsqueciSenha();
      document.getElementById("janela-login").style.display = "flex";
      _esconderPaineis();
      document.getElementById("labelEmailReset").innerText =
        `Código enviado para ${email}`;
      document.getElementById("inputCodigoReset").value = "";
      document.getElementById("codigoResetForm").style.display = "block";
    } else {
      const data = await res.json();
      alert("Erro: " + (data.message || "Tente novamente"));
    }
  } catch (e) {
    alert("Erro ao conectar com o servidor.");
  }
}

// NOVA — verificação do código de reset de senha
async function verificarCodigoReset() {
  const codigo = document.getElementById("inputCodigoReset").value.trim();
  if (codigo.length !== 6) { alert("Digite o código de 6 dígitos."); return; }

  try {
    const res = await fetch(`${API_URL}/auth/check-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: _emailPendente, codigo })
    });

    if (res.ok) {
      document.getElementById("inputCodigoNovaSenha").value = codigo;
      _esconderPaineis();
      document.getElementById("novaSenhaForm").style.display = "block";
    } else {
      const data = await res.json();
      alert("Erro: " + (data.message || "Código inválido"));
    }
  } catch (e) {
    alert("Erro ao conectar com o servidor.");
  }
}

// NOVA — reenvio do código de reset de senha
async function reenviarCodigoReset() {
  try {
    await fetch(`${API_URL}/auth/resend-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: _emailPendente, tipo: "RESET_SENHA" })
    });
    alert("Código reenviado!");
  } catch (e) {
    alert("Erro ao reenviar código.");
  }
}

// NOVA — redefinição da nova senha
async function redefinirSenha() {
  const novaSenha      = document.getElementById("inputNovaSenha").value;
  const confirmarSenha = document.getElementById("inputConfirmarSenha").value;
  const codigo         = document.getElementById("inputCodigoNovaSenha").value;

  if (!novaSenha || !confirmarSenha) { alert("Preencha todos os campos!"); return; }
  if (novaSenha !== confirmarSenha)  { alert("As senhas não conferem!"); return; }
  if (novaSenha.length < 6)          { alert("Mínimo 6 caracteres."); return; }

  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: _emailPendente,
        codigo,
        novaSenha,
        confirmarSenha
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Senha redefinida com sucesso!");
      _finalizarLogin(data, _emailPendente);
    } else {
      alert("Erro: " + (data.message || "Tente novamente"));
    }
  } catch (e) {
    alert("Erro ao conectar com o servidor.");
  }
}

function usuarioEAdmin() {
  const role = sessionStorage.getItem("role");
  const token = sessionStorage.getItem("token");

  if (!token) return false;
  if (!role) return false;

  return role.toUpperCase() === "ADMIN";
}