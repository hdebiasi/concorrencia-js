async function buscarCepComAwait(cep) {
    console.log("🔍 Buscando dados do CEP...");

    try {
        const respostaBruta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dadosDoEndereco = await respostaBruta.json();

        console.log("Campanha: ✅ Endereço Encontrado:", dadosDoEndereco.logradouro);
        console.log(`📍 Cidade: ${dadosDoEndereco.localidade} - ${dadosDoEndereco.uf}`);
        
        // Este log naturalmente espera os 'awaits' de cima terminarem
        console.log("🚀 Processo de busca finalizado com sucesso!");        
    } catch (erro) {
        console.error("❌ Erro na requisição:", erro);
    }
}

buscarCepComAwait("89500115");