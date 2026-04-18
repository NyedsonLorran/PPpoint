


function usuarioLogado() {
  const btn = document.getElementById("btnLogin");
  return btn && btn.dataset.logged === "true";
}

function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem("usuarioLogado"));
}

function abrirLoginCadastro() {
  document.getElementById("janela-login").style.display = "flex";
}

function fecharLoginCadastro() {
  document.getElementById("janela-login").style.display = "none";
}

function mostrarLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
}

function mostrarCadastro() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
}

async function registrar() {
  const email = document.getElementById("cadastroEmail").value;
  const senha = document.getElementById("cadastroSenha").value;
  const usuario = document.getElementById("cadastroUsuario").value;
  const senhaConf = document.getElementById("cadastroSenhaConfirm").value;

  if (!email || !senha || !usuario || !senhaConf) { alert("Preencha todos os campos!"); return; }
  if(senha !== senhaConf){ alert("As senhas não conferem!"); return; }

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

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("role", (data.role || "").toUpperCase());

      localStorage.setItem("usuarioLogado", JSON.stringify({
        usuario: emailInput,
        email: emailInput
      }));

      

      fecharLoginCadastro();
      definirLogado(true);
      await carregarDiasDisponiveis();
      irParaDiaAtual();
      renderizarProgramacao();
      renderizarCalendario();

    } else {
      const data = await res.json();
      alert("Erro: " + data.message);
    }

  } catch (e) {
    alert("Erro ao conectar com o servidor.");
  }
}

function loginComGoogle() {
    google.accounts.id.initialize({
        client_id: "24281345430-ctit3iu4en7otpu2kjfakopamsf9pclf.apps.googleusercontent.com",
        callback: handleGoogleCredential,
        use_fedcm_for_prompt: true
    });

    google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {

            google.accounts.id.renderButton(
                document.getElementById("google-btn-container"),
                { theme: "outline", size: "large", width: 260 }
            );

        }
    });
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

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("role", data.role);

            const payload = JSON.parse(atob(idToken.split('.')[1]));

            localStorage.setItem("usuarioLogado", JSON.stringify({
                usuario: payload.email,
                email: payload.email,
                nome: payload.name || payload.email
            }));

            fecharLoginCadastro();
            definirLogado(true);
            renderizarCalendario();
            renderizarProgramacao();

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

function enviarRecuperacao() {
  const email = document.getElementById("emailRecuperacao").value;
  if (!email) { alert("Digite um email válido!"); return; }
  alert(`Instruções de recuperação enviadas para ${email} `);
  fecharEsqueciSenha();
}

function usuarioEAdmin() {
  const role = sessionStorage.getItem("role");
  const token = sessionStorage.getItem("token");

  if (!token) return false;
  if (!role) return false;

  return role.toUpperCase() === "ADMIN";
}