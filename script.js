const form = document.getElementById("product-form");
const tableBody = document.querySelector("#product-table tbody");
const totalInvestidoEl = document.getElementById("total-investido");
const totalLucroBrutoEl = document.getElementById("total-lucro-bruto");
const totalLucroLiquidoEl = document.getElementById("total-lucro-liquido");
const totalVendaPotencialEl = document.getElementById("total-venda-potencial");

const TAXA_DESPESA = 0.20;

window.addEventListener("load", () => {
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  produtos.forEach(produto => adicionarLinha(produto));
  atualizarTotais();
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const produto = {
    codigo: document.getElementById("codigo").value,
    nome: document.getElementById("nome").value,
    custo: parseFloat(document.getElementById("custo").value),
    quantidade: parseInt(document.getElementById("quantidade").value),
    estoque: parseInt(document.getElementById("estoque").value),
    venda: parseFloat(document.getElementById("venda").value)
  };

  adicionarLinha(produto);
  salvarProduto(produto);
  atualizarTotais();
  form.reset();
});

function adicionarLinha(produto) {
  const valorTotal = produto.custo * produto.quantidade;
  const lucroBruto = (produto.venda - produto.custo) * produto.estoque;
  const lucroLiquido = lucroBruto * (1 - TAXA_DESPESA);

  const row = document.createElement("tr");
  row.innerHTML = `
    <td contenteditable="true" class="codigo">${produto.codigo}</td>
    <td contenteditable="true" class="nome">${produto.nome}</td>
    <td contenteditable="true" class="custo">${produto.custo.toFixed(2)}</td>
    <td contenteditable="true" class="quantidade">${produto.quantidade}</td>
    <td class="valor-total">${valorTotal.toFixed(2)}</td>
    <td contenteditable="true" class="estoque">${produto.estoque}</td>
    <td contenteditable="true" class="venda">${produto.venda.toFixed(2)}</td>
    <td class="lucro-bruto">${lucroBruto.toFixed(2)}</td>
    <td class="lucro-liquido">${lucroLiquido.toFixed(2)}</td>
  `;
  tableBody.appendChild(row);
}

function salvarProduto(produto) {
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  produtos.push(produto);
  localStorage.setItem("produtos", JSON.stringify(produtos));
}

tableBody.addEventListener("input", function () {
  const rows = tableBody.querySelectorAll("tr");
  const produtosAtualizados = [];

  rows.forEach(row => {
    const codigo = row.querySelector(".codigo").innerText;
    const nome = row.querySelector(".nome").innerText;
    const custo = parseFloat(row.querySelector(".custo").innerText);
    const quantidade = parseInt(row.querySelector(".quantidade").innerText);
    const estoque = parseInt(row.querySelector(".estoque").innerText);
    const venda = parseFloat(row.querySelector(".venda").innerText);

    const valorTotalCell = row.querySelector(".valor-total");
    const lucroBrutoCell = row.querySelector(".lucro-bruto");
    const lucroLiquidoCell = row.querySelector(".lucro-liquido");

    if (!isNaN(custo) && !isNaN(quantidade) && !isNaN(estoque) && !isNaN(venda)) {
      const valorTotal = custo * quantidade;
      const lucroBruto = (venda - custo) * estoque;
      const lucroLiquido = lucroBruto * (1 - TAXA_DESPESA);

      valorTotalCell.textContent = valorTotal.toFixed(2);
      lucroBrutoCell.textContent = lucroBruto.toFixed(2);
      lucroLiquidoCell.textContent = lucroLiquido.toFixed(2);

      produtosAtualizados.push({ codigo, nome, custo, quantidade, estoque, venda });
    }
  });

  localStorage.setItem("produtos", JSON.stringify(produtosAtualizados));
  atualizarTotais();
});

function atualizarTotais() {
  let totalInvestido = 0;
  let totalLucroBruto = 0;
  let totalLucroLiquido = 0;
  let totalVendaPotencial = 0;

  tableBody.querySelectorAll("tr").forEach(row => {
    const valorTotal = parseFloat(row.querySelector(".valor-total").textContent) || 0;
    const lucroBruto = parseFloat(row.querySelector(".lucro-bruto").textContent) || 0;
    const lucroLiquido = parseFloat(row.querySelector(".lucro-liquido").textContent) || 0;
    const estoque = parseInt(row.querySelector(".estoque").textContent) || 0;
    const venda = parseFloat(row.querySelector(".venda").textContent) || 0;

    totalInvestido += valorTotal;
    totalLucroBruto += lucroBruto;
    totalLucroLiquido += lucroLiquido;
    totalVendaPotencial += estoque * venda;
  });

  totalInvestidoEl.textContent = `R$ ${totalInvestido.toFixed(2)}`;
  totalLucroBrutoEl.textContent = `R$ ${totalLucroBruto.toFixed(2)}`;
  totalLucroLiquidoEl.textContent = `R$ ${totalLucroLiquido.toFixed(2)}`;
  totalVendaPotencialEl.textContent = `R$ ${totalVendaPotencial.toFixed(2)}`;
}

function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

  const colunas = [
    "Código", "Nome", "Custo", "Qtd", "Valor Total",
    "Estoque", "Venda", "Lucro Bruto", "Lucro Líquido"
  ];

  const linhas = produtos.map(p => {
    const valorTotal = p.custo * p.quantidade;
    const lucroBruto = (p.venda - p.custo) * p.estoque;
    const lucroLiquido = lucroBruto * (1 - TAXA_DESPESA);

    return [
      p.codigo,
      p.nome,
      `R$ ${p.custo.toFixed(2)}`,
      p.quantidade,
      `R$ ${valorTotal.toFixed(2)}`,
      p.estoque,
      `R$ ${p.venda.toFixed(2)}`,
      `R$ ${lucroBruto.toFixed(2)}`,
      `R$ ${lucroLiquido.toFixed(2)}`
    ];
  });

  doc.text("Relatório de Produtos - Mari Pink 💄", 14, 15);
  doc.autoTable({
    startY: 20,
    head: [colunas],
    body: linhas,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [255, 105, 180] } // rosa pink 💖
  });

  doc.save("relatorio-produtos.pdf");
}