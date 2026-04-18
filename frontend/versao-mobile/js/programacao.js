// Busca os nomes dos cantores do dia selecionado para o formulário de registro
async function getProgramacaoPorDia(dia, mes) {
  const mesReal = mes === 0 ? 5 : 6; // mesAtual 0=Jun(5), 1=Jul(6)
  const dataIso = `${ano}-${String(mesReal + 1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
  const dados = await buscarProgramacaoDoDia(dataIso);
  return dados.map(s => s.nome || "Artista");
}

function atualizarProgramacao() {
  const programacaoDias = Array.from(document.querySelectorAll('.programacao-dia'));
  if (programacaoDias.length === 0) return;
  const base = getAgora();
  const hoje = new Date(base.getFullYear(), base.getMonth(), base.getDate());
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

//  PROGRAMAÇÃO DINÂMICA (busca do backend) 
let diasDisponiveis = [];   // lista de datas retornadas pelo backend ex: ["2026-06-03", ...]
let programacaoCache = {};  // cache: { "2026-06-03": [{cantorId, nome, foto, horario}, ...] }
let indiceAtual = 0;

const nomesMesesProg = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const diasSemana = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];

// Busca do backend todos os dias com programação cadastrada
async function carregarDiasDisponiveis() {
  try {
    const res = await fetch(`${API_URL}/programacao/dias`);
    if (!res.ok) throw new Error("Erro ao buscar dias");
    diasDisponiveis = await res.json(); // ["2026-06-03", "2026-06-04", ...]
  } catch (e) {
    console.error("Erro ao carregar dias:", e);
    diasDisponiveis = [];
  }
}

// Busca do backend a programação de uma data específica (com cache)
async function buscarProgramacaoDoDia(dataIso) {
  if (programacaoCache[dataIso]) return programacaoCache[dataIso];

  try {
    const res = await fetch(`${API_URL}/programacao?data=${dataIso}`);
    if (!res.ok) throw new Error("Erro ao buscar programação");
    const dados = await res.json();
    programacaoCache[dataIso] = dados;
    return dados;
  } catch (e) {
    console.error("Erro ao buscar programação do dia:", e);
    return [];
  }
}

async function renderizarProgramacao() {

  console.log("Renderizando programação...");

  if (usuarioEAdmin()) {
  }

  const grid = document.getElementById("gridProgramacao");
  if (!grid) return;

  if (diasDisponiveis.length === 0) {
    grid.innerHTML = `<div class="card-dia"><div class="conteudo-dia"><div class="show">Carregando...</div></div></div>`;
    await carregarDiasDisponiveis();
  }

  const grupo = diasDisponiveis.slice(indiceAtual, indiceAtual + 3);
  const programacoes = await Promise.all(grupo.map(d => buscarProgramacaoDoDia(d)));

  grid.innerHTML = "";

  const hoje = new Date(agoraFixo.getFullYear(), agoraFixo.getMonth(), agoraFixo.getDate());

  grupo.forEach((dataIso, i) => {
    const shows = programacoes[i];

    const [anoD, mesD, diaD] = dataIso.split("-").map(Number);
    const dataEvento = new Date(anoD, mesD - 1, diaD);

    let classeStatus = "futuro";
    if (dataEvento.getTime() === hoje.getTime()) classeStatus = "hoje";
    else if (dataEvento < hoje) classeStatus = "passado";

    const diaSemanaTexto = diasSemana[dataEvento.getDay()];
    const diaFormatado = String(diaD).padStart(2, '0');
    const mesTexto = nomesMesesProg[mesD - 1].toUpperCase();

    const div = document.createElement("div");
    div.classList.add("card-dia", classeStatus);

    // AQUI CRIA O BOTÃO
    let botaoEditar = "";

    if (usuarioEAdmin() === true) {
      botaoEditar = `
        <button class="btn-editar-dia" onclick="abrirEdicao('${dataIso}')">
          Editar
        </button>
      `;
    }

    const showsHtml = shows.length > 0
      ? shows.map(s => {
          const hora = s.horario ? s.horario.substring(0, 5) : "--:--";
          const artista = s.nome || "Artista";
          const fotoHtml = s.foto
            ? `<img src="${s.foto}" alt="${artista}" class="foto-cantor" onerror="this.style.display='none'">`
            : "";
          return `
            <div class="show">
              ${fotoHtml}
              <span class="hora">${hora}</span>
              <span class="artista">${artista}</span>
            </div>
          `;
        }).join("")
      : `<div class="show"><span class="artista">A confirmar</span></div>`;

    //  INSERE O BOTÃO DE EDITAR NO CARD SE FOR ADMIN
    div.innerHTML = `
      <div class="data-dia">
        <span class="semana">${diaSemanaTexto}</span>
        <span class="dia">${diaFormatado}</span>
        <span class="mes">${mesTexto}</span>

        ${botaoEditar}
      </div>

      <div class="conteudo-dia">
        ${showsHtml}
      </div>
    `;

    grid.appendChild(div);
  });
}

function avancarProgramacao() {
  if (indiceAtual + 3 < diasDisponiveis.length) {
    indiceAtual += 3;
    renderizarProgramacao();
  }
}

function voltarProgramacao() {
  if (indiceAtual - 3 >= 0) {
    indiceAtual -= 3;
    renderizarProgramacao();
  }
}

async function abrirEdicao(dataIso) {
  if (!usuarioEAdmin()) return;

  const modal = document.getElementById("modalEditar");
  const lista = document.getElementById("listaEdicao");
  const titulo = document.getElementById("tituloEdicao");
  if (!modal || !lista || !titulo) return;

  const [anoD, mesD, diaD] = dataIso.split("-").map(Number);

  titulo.innerText = `Editar Dia - ${String(diaD).padStart(2,"0")} ${nomesMesesProg[mesD-1].toUpperCase()}`;
  modal.dataset.data = dataIso;
  modal.style.display = "flex";

  lista.innerHTML = `<p class="texto-carregando">Carregando...</p>`;

  try {
    const token = sessionStorage.getItem("token");

    const res = await fetch(`${API_URL}/programacao/admin?data=${dataIso}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error();

    const shows = await res.json();

    lista.innerHTML = "";

    if (shows.length === 0) {
      lista.innerHTML = `<p class="texto-vazio">Sem shows cadastrados.</p>`;
    }

    shows.forEach(show => {
      const div = document.createElement("div");
      div.classList.add("item-edicao");
      div.dataset.id = show.programacaoId;

      div.innerHTML = `
        <input type="text" value="${show.nome || ""}" placeholder="Cantor">
        <input type="time" value="${show.horario ? show.horario.substring(0,5) : ""}">
        
        <button class="btn-edicao btn-deletar"
                onclick="deletarItemEdicao('${show.programacaoId}', this, '${dataIso}')"
                title="Remover">
          X
        </button>
      `;

      lista.appendChild(div);
    });

    // BLOCO NOVO SHOW
    const divNovo = document.createElement("div");
    divNovo.classList.add("novo-show");

    divNovo.innerHTML = `

      <div class="item-edicao">
        <input type="text" id="novoCantor" placeholder="Cantor">
        <input type="time" id="novoHorario">

        <button class="btn-edicao btn-adicionar"
                onclick="adicionarItemEdicao('${dataIso}')">
          ✓
        </button>
      </div>
    `;

    lista.appendChild(divNovo);

  } catch (e) {
    lista.innerHTML = `<p class="texto-erro">Erro ao carregar shows.</p>`;
  }
}

async function fecharEdicao() {
  const modal = document.getElementById("modalEditar");
  const lista = document.getElementById("listaEdicao");

  if (!modal || !lista) return;

  modal.style.display = "none";
  modal.dataset.data = "";

  lista.innerHTML = "";
}

async function salvarEdicao() {
  const modal = document.getElementById("modalEditar");
  const dataIso = modal.dataset.data;
  const token = sessionStorage.getItem("token");

  const itens = document.querySelectorAll("#listaEdicao .item-edicao[data-id]");

  for (let item of itens) {
    const inputs = item.querySelectorAll("input");
    const nome = inputs[0].value.trim();
    const hora = inputs[1].value;
    if (!nome || !hora) { alert("Preencha nome e horário de todos os shows!"); return; }

    const [h] = hora.split(":").map(Number);
    const valido = (h >= 17 && h <= 23) || (h >= 0 && h <= 4);
    if (!valido) { alert("Horário inválido! Use entre 17:00 e 04:00"); return; }
  }

  const promessas = Array.from(itens).map(item => {
    const programacaoId = item.dataset.id;
    const inputs = item.querySelectorAll("input");
    const nomeCantor = inputs[0].value.trim();
    const horario = inputs[1].value + ":00";
    return fetch(`${API_URL}/programacao/admin/${programacaoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ nomeCantor, horario })
    });
  });

  try {
    const resultados = await Promise.all(promessas);
    if (resultados.some(r => !r.ok)) { alert("Erro ao salvar alguns shows."); return; }
    delete programacaoCache[dataIso];
    fecharEdicao();
    await renderizarProgramacao();
    alert("Programação salva!");
  } catch(e) {
    alert("Erro ao conectar ao servidor.");
  }
}

async function deletarItemEdicao(programacaoId, btn, dataIso) {
  if (!confirm("Remover este show?")) return;
  btn.disabled = true;
  const token = sessionStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/programacao/admin/${programacaoId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      btn.closest(".item-edicao").remove();
      delete programacaoCache[dataIso];
      await renderizarProgramacao();
    } else {
      alert("Erro ao remover show.");
      btn.disabled = false;
    }
  } catch(e) {
    alert("Erro ao conectar ao servidor.");
    btn.disabled = false;
  }
}

async function adicionarItemEdicao(dataIso) {
  const nomeCantor = document.getElementById("novoCantor").value.trim();
  const horario = document.getElementById("novoHorario").value;
  if (!nomeCantor || !horario) { alert("Preencha o cantor e o horário!"); return; }
  const token = sessionStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/programacao/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ data: dataIso, nomeCantor, horario: horario + ":00" })
    });
    if (res.ok) {
      delete programacaoCache[dataIso];
      await abrirEdicao(dataIso); // recarrega o modal com os dados atualizados
      await renderizarProgramacao();
    } else {
      alert("Erro ao adicionar show.");
    }
  } catch(e) {
    alert("Erro ao conectar ao servidor.");
  }
}

function irParaDiaAtual() {
  const base = getAgora();
  const hoje = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const hojeIso = hoje.toISOString().split("T")[0];

  let index = diasDisponiveis.indexOf(hojeIso);

  if (index === -1) {
    index = diasDisponiveis.findIndex(d => d >= hojeIso);
  }

  if (index !== -1) {
    indiceAtual = Math.floor(index / 3) * 3;
  }
}