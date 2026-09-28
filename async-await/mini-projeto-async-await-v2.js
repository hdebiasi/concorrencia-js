// 1. Versão com método reduce()
Array.prototype.calcularTotal = function(callback) {
    return this.reduce((total, item) => total + callback(item), 0);
};

// 2. Dados do nosso carrinho de compras (Igual)
const carrinho = [
    { nome: "Camiseta", preco: 50, qtd: 2 },  
    { nome: "Calça Jeans", preco: 120, qtd: 1 }, 
    { nome: "Tênis", preco: 250, qtd: 1 }      
];

// 3. A Promessa de Pagamento inteligente (Igual)
function processarPagamento(valor, saldoDisponivel) {
    return new Promise((resolve, reject) => {
        console.log("💳 [Async/Await] Conectando ao banco da operadora...");
        
        setTimeout(() => {
            if (valor <= saldoDisponivel) {
                resolve(`✅ Pagamento de R$ ${valor} APROVADO com sucesso!`);
            } else {
                reject(`❌ Cartão Recusado: Saldo insuficiente (Faltam R$ ${valor - saldoDisponivel}).`);
            }
        }, 2000);
    });
}

// 4. A Função Principal unificada usando Async/Await
async function executarCheckoutComAwait(saldoDoCliente) {
    console.log("🛒 Iniciando checkout do carrinho...");
    
    // Executa o callback para somar tudo
    const valorFinal = carrinho.calcularTotal(item => item.preco * item.qtd);
    console.log(`Valor Total da Compra: R$ ${valorFinal}`);

    try {
        // Trava o código aqui até o banco responder (resolve)
        const status = await processarPagamento(valorFinal, saldoDoCliente);
        console.log(status);
        console.log("🎉 Compra concluída! Enviando e-mail com a nota fiscal...");
        
    } catch (erro) {
        // Se der qualquer erro (reject), o código pula direto para cá:
        console.error("Alerta:", erro);
        console.log("⚠️ Por favor, insira outro cartão ou mude a forma de pagamento.");
    }
}

// TESTANDO: Passando R\$ 300 de saldo (Vai dar Recusado porque o total é R\$ 470)
executarCheckoutComAwait(300);

// Se você testar passando 600, ele vai rodar com sucesso dentro do try:
// executarCheckoutComAwait(600);