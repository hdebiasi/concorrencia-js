// Esta é a função principal equivalente à sua versão com .then()
function buscarCepComAwaitCurto(cep) {
    console.log("🔍 [Await] Buscando dados do CEP...");

    // Criamos e disparamos uma função anônima async em segundo plano (IIFE)
    (async () => {
        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const dados = await resposta.json();
            console.log("✅ [Await] Endereço Encontrado:", dados.logradouro);
            console.log(`📍 Cidade: ${dados.localidade} - ${dados.uf}`);

            console.log("🚀 [Await] Processo de busca finalizado com sucesso!");
        } catch (erro) {
            console.error("❌ [Await] Erro:", erro);
        }
    })(); // <-- Os parênteses aqui no final fazem ela executar na hora!

    // Como não usamos o 'await' na linha de cima, o JavaScript NÃO TRAVA 
    // e executa esta linha imediatamente!
    console.log("🚀 [Await] Esta linha roda ANTES da API responder (Assíncrono!)");
}

// Executando
buscarCepComAwaitCurto("89500115");