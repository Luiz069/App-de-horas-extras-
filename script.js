document.addEventListener("DOMContentLoaded", () => {
  // =================================================
  // CONTROLE DE HORAS EXTRAS
  // SCRIPT.JS - VERSÃO LIMPA
  // =================================================

  let registros = JSON.parse(localStorage.getItem("horasExtras")) || [];

  let grafico = null;

  // ===============================
  // ELEMENTOS
  // ===============================

  const valorHora = document.getElementById("valorHora");
  const data = document.getElementById("data");
  const horas = document.getElementById("horas");
  const obs = document.getElementById("obs");

  const lista = document.getElementById("lista");

  const totalHoras = document.getElementById("totalHoras");
  const totalValor = document.getElementById("totalValor");
  const dias = document.getElementById("dias");

  // ===============================
  // INICIALIZAÇÃO
  // ===============================

  document.addEventListener("DOMContentLoaded", () => {
    iniciar();
  });

  function iniciar() {
    carregarValorHora();

    colocarDataAtual();

    carregarEventos();

    ordenarRegistros();

    renderizar();

    registrarPWA();
  }

  // ===============================
  // DATA ATUAL
  // ===============================

  function colocarDataAtual() {
    if (data) {
      data.valueAsDate = new Date();
    }
  }

  // ===============================
  // VALOR DA HORA
  // ===============================

  function carregarValorHora() {
    if (!valorHora) return;

    const valor = localStorage.getItem("valorHora");

    if (valor) {
      valorHora.value = valor;
    }
  }

  // ===============================
  // EVENTOS
  // ===============================

  function carregarEventos() {
    const salvar = document.getElementById("salvar");

    if (salvar) {
      salvar.onclick = salvarRegistro;
    }

    if (valorHora) {
      valorHora.oninput = () => {
        localStorage.setItem("valorHora", valorHora.value);

        atualizarResumo();
      };
    }

    const pesquisa = document.getElementById("pesquisa");

    if (pesquisa) {
      pesquisa.onkeyup = pesquisar;
    }

    const excel = document.getElementById("excel");

    if (excel) {
      excel.onclick = exportarExcel;
    }

    const pdf = document.getElementById("pdf");

    if (pdf) {
      pdf.onclick = exportarPDF;
    }

    const backup = document.getElementById("backup");

    if (backup) {
      backup.onclick = criarBackup;
    }

    const restaurar = document.getElementById("restaurar");

    if (restaurar) {
      restaurar.onclick = () => {
        const arquivo = document.getElementById("arquivo");

        if (arquivo) {
          arquivo.click();
        }
      };
    }

    const arquivo = document.getElementById("arquivo");

    if (arquivo) {
      arquivo.onchange = restaurarBackup;
    }
  }

  // ===============================
  // SALVAR REGISTRO
  // ===============================

  function salvarRegistro() {
    console.log("Botão salvar clicado");

    if (!data || !data.value) {
      alert("Informe a data");
      return;
    }

    if (!horas || !horas.value) {
      alert("Informe as horas");
      return;
    }

    if (!valorHora || !valorHora.value) {
      alert("Informe o valor da hora");
      return;
    }

    const registro = {
      id: Date.now(),

      data: data.value,

      horas: Number(horas.value),

      valor: Number(horas.value) * Number(valorHora.value),

      obs: obs ? obs.value : "",
    };

    registros.push(registro);

    localStorage.setItem("horasExtras", JSON.stringify(registros));

    console.log("Salvo:", registro);

    alert("Registro salvo!");

    limparFormulario();

    renderizar();
  }

  // ===============================
  // LOCAL STORAGE
  // ===============================

  function salvarLocal() {
    localStorage.setItem("horasExtras", JSON.stringify(registros));
  }

  // ===============================
  // LIMPAR
  // ===============================

  function limparFormulario() {
    if (horas) horas.value = "";

    if (obs) obs.value = "";

    colocarDataAtual();
  }

  // ===============================
  // RENDERIZAR TABELA
  // ===============================

  function renderizar() {
    if (!lista) return;

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
  // RESUMO
  // ===============================

  function atualizarResumo() {
    let horasTotal = 0;

    let valorTotal = 0;

    registros.forEach((item) => {
      horasTotal += Number(item.horas);

      valorTotal += Number(item.valor);
    });

    if (totalHoras) totalHoras.innerHTML = horasTotal.toFixed(1) + " h";

    if (totalValor) totalValor.innerHTML = formatarMoeda(valorTotal);

    if (dias) dias.innerHTML = registros.length;
  }

  // ===============================
  // FORMATAR
  // ===============================

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(valor) {
    if (!valor) return "";

    return valor.split("-").reverse().join("/");
  }

  // ===============================
  // EXCLUIR
  // ===============================

  function excluir(id) {
    if (!confirm("Deseja excluir este registro?")) return;

    registros = registros.filter((item) => item.id !== id);

    salvarLocal();

    renderizar();
  }

  // ===============================
  // EDITAR
  // ===============================

  function editar(id) {
    const registro = registros.find((item) => item.id === id);

    if (!registro) return;

    data.value = registro.data;

    horas.value = registro.horas;

    obs.value = registro.obs;

    registros = registros.filter((item) => item.id !== id);

    salvarLocal();

    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });
  }

  // ===============================
  // PESQUISA
  // ===============================

  function pesquisar() {
    const texto = document.getElementById("pesquisa").value.toLowerCase();

    lista.innerHTML = "";

    registros
      .filter((item) => {
        return (
          formatarData(item.data).includes(texto) ||
          String(item.horas).includes(texto) ||
          item.obs.toLowerCase().includes(texto)
        );
      })

      .forEach((item) => {
        lista.innerHTML += `

        <tr>

        <td>${formatarData(item.data)}</td>

        <td>${item.horas}h</td>

        <td>${formatarMoeda(item.valor)}</td>

        <td>${item.obs}</td>


        <td>

        <button onclick="editar(${item.id})">
        Editar
        </button>


        <button onclick="excluir(${item.id})">
        Excluir
        </button>


        </td>


        </tr>

        `;
      });
  }

  // ===============================
  // GRÁFICO
  // ===============================

  function atualizarGrafico() {
    const canvas = document.getElementById("grafico");

    if (!canvas) return;

    if (typeof Chart === "undefined") return;

    if (grafico) {
      grafico.destroy();
    }

    grafico = new Chart(canvas, {
      type: "bar",

      data: {
        labels: registros.map((item) => formatarData(item.data)),

        datasets: [
          {
            label: "Horas Extras",

            data: registros.map((item) => item.horas),

            borderWidth: 1,
          },
        ],
      },

      options: {
        responsive: true,
      },
    });
  }

  // ===============================
  // EXPORTAR EXCEL
  // ===============================

  function exportarExcel() {
    if (!registros.length) {
      alert("Sem registros");

      return;
    }

    const dados = registros.map((item) => ({
      Data: formatarData(item.data),

      Horas: item.horas,

      Valor: item.valor,

      Observação: item.obs,
    }));

    const ws = XLSX.utils.json_to_sheet(dados);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Horas Extras");

    XLSX.writeFile(wb, "horas_extras.xlsx");
  }

  // ===============================
  // EXPORTAR PDF
  // ===============================

  function exportarPDF() {
    if (!registros.length) {
      alert("Sem registros");

      return;
    }

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    pdf.text("Relatório de Horas Extras", 20, 20);

    let y = 40;

    registros.forEach((item) => {
      pdf.text(
        `${formatarData(item.data)}
        ${item.horas}h
        ${formatarMoeda(item.valor)}`,

        20,

        y,
      );

      y += 10;
    });

    pdf.save("horas_extras.pdf");
  }

  // ===============================
  // BACKUP
  // ===============================

  function criarBackup() {
    const blob = new Blob(
      [JSON.stringify(registros)],

      {
        type: "application/json",
      },
    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "backup_horas.json";

    link.click();
  }

  // ===============================
  // RESTAURAR BACKUP
  // ===============================

  function restaurarBackup(e) {
    const leitor = new FileReader();

    leitor.onload = function () {
      registros = JSON.parse(leitor.result);

      salvarLocal();

      renderizar();

      alert("Backup restaurado!");
    };

    leitor.readAsText(e.target.files[0]);
  }

  // ===============================
  // ORDENAR
  // ===============================

  function ordenarRegistros() {
    registros.sort((a, b) => {
      return new Date(b.data) - new Date(a.data);
    });
  }

  // ===============================
  // PWA
  // ===============================

  function registrarPWA() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("./service-worker.js")

        .then(() => {
          console.log("PWA ativo");
        })

        .catch((erro) => {
          console.log(erro);
        });
    }
  }
});
console.log("Script carregado");

console.log("Excel:", typeof XLSX);

console.log("PDF:", typeof window.jspdf);

console.log("Botão PDF:", document.getElementById("pdf"));

console.log("Botão Excel:", document.getElementById("excel"));
