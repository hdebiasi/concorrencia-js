function buscarNoBanco(id) {
    return new Promise((resolve) => {
        // Simula uma espera de rede de 2 segundos
        setTimeout(() => resolve(`Dados do Usuário ${id}`), 2000);
    });
}

function* fluxoRequisicao(id) {
    console.log(`[Req ${id}] Iniciou o processo`);
    
    // O yield PAUSA a função e joga a Promise do banco para fora
    const dados = yield buscarNoBanco(id); 
    
    // O RESUME vai injetar o resultado diretamente na variável 'dados'
    console.log(`[Req ${id}] Concluído com: ${dados}`);
}

function executarAssincrono(generatorFunction, id) {
    const iterator = generatorFunction(id); // Cria o iterator da requisição

    // Avança o primeiro passo (roda até o yield)
    const resultado = iterator.next(); 

    // O resultado.value aqui é a Promise retornada por buscarNoBanco()
    const promiseDoBanco = resultado.value;

    // Quando a Promise do banco resolver (2 segundos depois)...
    promiseDoBanco.then((dadosReais) => {
        // ...nós damos o .next() passando o dado real para dentro do generator.
        // Isso faz o código dar "RESUME" exatamente de onde parou!
        iterator.next(dadosReais); 
    });
}

// Simulando a concorrência: Disparamos duas requisições seguidas!
executarAssincrono(fluxoRequisicao, "A");
executarAssincrono(fluxoRequisicao, "B");
