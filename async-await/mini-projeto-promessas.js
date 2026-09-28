// 1. Nosso protótipo customizado (Modifica o DNA dos Arrays)
Array.prototype.calcularTotal = function(callback) {
    let total = 0;
    for (let i = 0; i < this.length; i++) {
        total += callback(this[i]);
    }
    
    return total;
};

// 2. Dados do nosso carrinho de compras
const carrinho = [
    { nome: "Camiseta", preco: 50, qtd: 2 },  // 100
    { nome: "Calça Jeans", preco: 120, qtd: 1 }, // 120
    { nome: "Tênis", preco: 250, qtd: 1 }      // 250 -> Total: R\$ 470
];

// 3. A Promessa de Pagamento que avalia o saldo disponível
function processarPagamento(valor, saldoDisponivel) {
    return new Promise((resolve, reject) => {
        console.log("💳 [Then/Catch] Conectando ao banco da operadora...");
        
        setTimeout(() => {
            if (valor <= saldoDisponivel) {
                resolve(`✅ Pagamento de R$ ${valor} APROVADO com sucesso!`);
            } else {
                reject(`❌ Cartão Recusado: Saldo insuficiente (Faltam R$ ${valor - saldoDisponivel}).`);
            }
        }, 2000);
    });
}

// 4. A Função Principal que executa o Checkout completo
function executarCheckoutComThen(saldoDoCliente) {
    console.log("🛒 Iniciando checkout do carrinho...");
    
    // Executa o callback para somar tudo
    const valorFinal = carrinho.calcularTotal(item => item.preco * item.qtd);
    console.log(`Valor Total da Compra: R$ ${valorFinal}`);

    // Dispara a promessa passando o total e o saldo que o cliente possui
    processarPagamento(valorFinal, saldoDoCliente)
        .then((sucesso) => {
            console.log(sucesso);
            console.log("🎉 Compra concluída! Enviando e-mail com a nota fiscal...");
        })
        .catch((erro) => {
            console.error("Alerta:", erro);
            console.log("⚠️ Por favor, insira outro cartão ou mude a forma de pagamento.");
        });
}

// TESTANDO: Passando R\$ 500 de saldo (Vai dar Aprovado porque o total é R\$ 470)
executarCheckoutComThen(500);

// Se você testar passando 300, ele vai direto para o .catch():
// executarCheckoutComThen(300);