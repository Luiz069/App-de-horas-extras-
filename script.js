let grafico = null;
// ===============================
// CONTROLE DE HORAS EXTRAS
// PARTE 1
// ===============================

let registros = JSON.parse(localStorage.getItem("horasExtras")) || [];

const valorHora = document.getElementById("valorHora");
const data = document.getElementById("data");
const horas = document.getElementById("horas");
const obs = document.getElementById("obs");

const lista = document.getElementById("lista");

const totalHoras = document.getElementById("totalHoras");
const totalValor = document.getElementById("totalValor");
const dias = document.getElementById("dias");

data.valueAsDate = new Date();

if (localStorage.getItem("valorHora")) {
  valorHora.value = localStorage.getItem("valorHora");
}

valorHora.addEventListener("input", () => {
  localStorage.setItem("valorHora", valorHora.value);

  atualizarResumo();
  renderizar();
});

document.getElementById("salvar").addEventListener("click", salvarRegistro);

// ===============================

function salvarRegistro() {
  if (data.value == "") {
    alert("Informe a data");
    return;
  }

  if (horas.value == "") {
    alert("Informe as horas");
    return;
  }

  if (valorHora.value == "") {
    alert("Informe o valor da hora");
    return;
  }

  const registro = {
    id: Date.now(),

    data: data.value,

    horas: Number(horas.value),

    valor: Number(horas.value) * Number(valorHora.value),

    obs: obs.value,
  };

  registros.push(registro);

  salvarLocal();

  limparFormulario();

  renderizar();
}

// ===============================

function salvarLocal() {
  localStorage.setItem("horasExtras", JSON.stringify(registros));
}

// ===============================

function limparFormulario() {
  horas.value = "";
  obs.value = "";

  data.valueAsDate = new Date();
}

// ===============================

function renderizar() {
  lista.innerHTML = "";

  registros.forEach((item) => {
    lista.innerHTML += `

        <tr>

        <td>${formatarData(item.data)}</td>

        <td>${item.horas}h</td>

        <td>${formatarMoeda(item.valor)}</td>

        <td>${item.obs || "-"}</td>

        <td>

        <button
        class="editar"
        onclick="editar(${item.id})">

        <i class="fa-solid fa-pen"></i>

        </button>

        <button
        class="excluir"
        onclick="excluir(${item.id})">

        <i class="fa-solid fa-trash"></i>

        </button>

        </td>

        </tr>

        `;
  });

  atualizarResumo();
  atualizarGrafico();
}

// ===============================

function atualizarResumo() {
  let somaHoras = 0;
  let somaValor = 0;

  registros.forEach((item) => {
    somaHoras += item.horas;
    somaValor += item.valor;
  });

  totalHoras.innerHTML = somaHoras.toFixed(1) + " h";

  totalValor.innerHTML = formatarMoeda(somaValor);

  dias.innerHTML = registros.length;
}

// ===============================

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",

    currency: "BRL",
  });
}

// ===============================

function formatarData(data) {
  return data.split("-").reverse().join("/");
}

// ===============================
// PARTE 2
// Editar e Excluir
// ===============================

function excluir(id) {
  if (!confirm("Deseja realmente excluir este registro?")) {
    return;
  }

  registros = registros.filter((item) => item.id !== id);

  salvarLocal();

  renderizar();
}

// ===============================

function editar(id) {
  const registro = registros.find((item) => item.id === id);

  if (!registro) return;

  data.value = registro.data;

  horas.value = registro.horas;

  obs.value = registro.obs;

  excluirSemPergunta(id);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// ===============================

function excluirSemPergunta(id) {
  registros = registros.filter((item) => item.id !== id);

  salvarLocal();
}

// ===============================
// Pesquisa
// ===============================

document.getElementById("pesquisa").addEventListener("keyup", pesquisar);

function pesquisar() {
  const texto = document.getElementById("pesquisa").value.toLowerCase();

  lista.innerHTML = "";

  registros
    .filter((item) => {
      return (
        formatarData(item.data).toLowerCase().includes(texto) ||
        String(item.horas).includes(texto) ||
        (item.obs || "").toLowerCase().includes(texto)
      );
    })

    .forEach((item) => {
      lista.innerHTML += `

        <tr>

        <td>${formatarData(item.data)}</td>

        <td>${item.horas}h</td>

        <td>${formatarMoeda(item.valor)}</td>

        <td>${item.obs || "-"}</td>

        <td>

        <button
        class="editar"
        onclick="editar(${item.id})">

        <i class="fa-solid fa-pen"></i>

        </button>

        <button
        class="excluir"
        onclick="excluir(${item.id})">

        <i class="fa-solid fa-trash"></i>

        </button>

        </td>

        </tr>

        `;
    });
}

// ===============================
// Ordenar por data (mais recente)
// ===============================

registros.sort((a, b) => {
  return new Date(b.data) - new Date(a.data);
});

renderizar();

// ==============================
renderizar();

// ===============================
// PARTE 3
// Dashboard + Gráfico
// ===============================

function atualizarGrafico() {
  const canvas = document.getElementById("grafico");

  if (!canvas) {
    return;
  }

  if (typeof Chart === "undefined") {
    console.log("Chart.js não carregado");
    return;
  }

  if (grafico !== null) {
    grafico.destroy();

    grafico = null;
  }

  const labels = registros.map((item) => formatarData(item.data));

  const valores = registros.map((item) => item.horas);

  grafico = new Chart(canvas, {
    type: "bar",

    data: {
      labels: labels,

      datasets: [
        {
          label: "Horas Extras",

          data: valores,

          borderWidth: 1,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,
    },
  });
}

// ===============================
// EXPORTAR EXCEL
// ===============================

document.getElementById("excel").onclick = function () {
  if (registros.length === 0) {
    alert("Não existem registros para exportar.");
    return;
  }

  const dados = registros.map((item) => ({
    Data: formatarData(item.data),
    Horas: item.horas,
    Valor: item.valor,
    Observação: item.obs || "",
  }));

  const planilha = XLSX.utils.json_to_sheet(dados);

  const arquivo = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(arquivo, planilha, "Horas Extras");

  XLSX.writeFile(arquivo, "horas_extras.xlsx");
};

// ===============================
// EXPORTAR PDF
// ===============================

document.getElementById("pdf").onclick = function () {
  if (registros.length === 0) {
    alert("Não existem registros para exportar.");
    return;
  }

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF();

  pdf.setFontSize(18);

  pdf.text("Relatório de Horas Extras", 20, 20);

  let y = 40;

  registros.forEach((item) => {
    pdf.setFontSize(12);

    pdf.text(
      `${formatarData(item.data)} - ${item.horas}h - ${formatarMoeda(item.valor)}`,
      20,
      y,
    );

    y += 10;
  });

  pdf.save("horas_extras.pdf");
};

// ===============================
// BACKUP
// ===============================

document.getElementById("backup").onclick = function () {
  const arquivo = new Blob([JSON.stringify(registros)], {
    type: "application/json",
  });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(arquivo);

  link.download = "backup_horas.json";

  link.click();
};

// ===============================
// RESTAURAR
// ===============================

document.getElementById("restaurar").onclick = function () {
  document.getElementById("arquivo").click();
};

document.getElementById("arquivo").onchange = function () {
  const leitor = new FileReader();

  leitor.onload = function (e) {
    try {
      registros = JSON.parse(e.target.result);

      salvarLocal();

      renderizar();

      alert("Backup restaurado com sucesso!");
    } catch {
      alert("Arquivo de backup inválido.");
    }
  };

  leitor.readAsText(this.files[0]);
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => {
        console.log("Aplicativo pronto para instalação");
      })
      .catch((error) => {
        console.log("Erro no Service Worker:", error);
      });
  });
}

console.log("Script carregado");

console.log("Excel:", typeof XLSX);

console.log("PDF:", typeof window.jspdf);

console.log("Botão PDF:", document.getElementById("pdf"));

console.log("Botão Excel:", document.getElementById("excel"));
