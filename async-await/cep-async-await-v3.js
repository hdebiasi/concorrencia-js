// Esta é a função principal equivalente à sua versão com .then()
function buscarCepComAwaitSimples(cep) {
    console.log("🔍 [Await] Buscando dados do CEP...");

    // Criamos uma função interna simples para cuidar dos 'awaits'
    async function pegarDados() {
        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const dados = await resposta.json();
            console.log("✅ [Await] Endereço Encontrado:", dados.logradouro);
            console.log(`📍 Cidade: ${dados.localidade} - ${dados.uf}`);

            console.log("🚀 [Await] Processo de busca finalizado com sucesso!");
        } catch (erro) {
            console.error("❌ [Await] Erro:", erro);
        }
    }

    // Disparamos a função interna (ela roda em segundo plano)
    pegarDados();

    console.log("🚀 [Await] Esta linha roda ANTES da API responder (Assíncrono!)");
}

// Executando
buscarCepComAwaitSimples("89500115");