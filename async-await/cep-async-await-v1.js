// 1. Criamos a função que faz o trabalho pesado e espera a API
async function realizarBuscaNoServidor(cep) {
    try {
        // Pausa a execução até o servidor responder
        const respostaBruta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

        // Pausa novamente até terminar de converter os dados para JSON
        const dadosDoEndereco = await respostaBruta.json();

        // Código segue linearmente após os resolves
        console.log("✅ [Await] Endereço Encontrado:", dadosDoEndereco.logradouro);
        console.log(`📍 Cidade: ${dadosDoEndereco.localidade} - ${dadosDoEndereco.uf}`);
        
        console.log("🚀 [Await] Processo de busca finalizado com sucesso!");
    } catch (erro) {
        console.error("❌ [Await] Erro na requisição:", erro);
    }
}

// 2. Esta é a função principal equivalente à sua versão com .then()
function buscarCepComAwaitEstiloThen(cep) {
    console.log("🔍 [Await] Buscando dados do CEP...");

    // Disparamos a promessa em segundo plano (SEM usar a palavra 'await' aqui na frente)
    realizarBuscaNoServidor(cep);

    // Como não usamos o 'await' na linha de cima, o JavaScript NÃO TRAVA 
    // e executa esta linha imediatamente!
    console.log("🚀 [Await] Esta linha roda ANTES da API responder (Assíncrono!)");
}

// Executando
buscarCepComAwaitEstiloThen("89500115");
