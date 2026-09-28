function buscarCepComThen(cep) {
    console.log("🔍 [Then] Buscando dados do CEP...");

    // O fetch inicia a requisição e retorna uma Promise
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(respostaBruta => {
            // Converte a resposta para JSON (isso também retorna uma Promise)
            return respostaBruta.json(); 
        })
        .then(dadosDoEndereco => {
            // Aqui os dados finais chegam prontos no resolve da segunda Promise
            console.log("✅ [Then] Endereço Encontrado:", dadosDoEndereco.logradouro);
            console.log(`📍 Cidade: ${dadosDoEndereco.localidade} - ${dadosDoEndereco.uf}`);

            console.log("🚀 [Then] Processo de busca finalizado com sucesso!");
        })
        .catch(erro => {
            // Qualquer erro na rede ou na conversão cai aqui no reject
            console.error("❌ [Then] Erro na requisição:", erro);
        });

    console.log("🚀 [Then] Esta linha roda ANTES da API responder (Assíncrono!)");
}

// Executando (Passando um CEP de teste)
buscarCepComThen("89500115");