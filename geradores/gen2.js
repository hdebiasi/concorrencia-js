function buscarNoBanco(id) {
    return new Promise((resolve) => {
        // Simula uma espera de rede de 2 segundos
        setTimeout(() => resolve(`Dados do Usuário ${id}`), 2000);
    });
}

function* fluxoRequisicao(id) {
    console.log(`[Req ${id}] [1] Processo iniciado...`);
    console.log(`[Req ${id}] [2] Realizando a busca no Banco de Dados...`);

    // O yield PAUSA a função e joga a Promise do banco para fora
    const dados = yield buscarNoBanco(id); 
    
    console.log(`[Req ${id}] [5] Banco respondeu! Retomando a execução...`);

    // O RESUME vai injetar o resultado diretamente na variável 'dados'
    console.log(`[Req ${id}] [6] Concluído com sucesso: ${dados}`);
}

function executarAssincrono(generatorFunction, id) {
    const iterator = generatorFunction(id); // Cria o iterator da requisição

    // Avança o primeiro passo (roda até o yield)
    const resultado = iterator.next(); 

    // O resultado.value aqui é a Promise retornada por buscarNoBanco()
    const promiseDoBanco = resultado.value;

    console.log(`[Executor] [3] O yield da Promise da [Req ${id}] acabou de acontecer! Capturei a Promiese e vou esperar.`);

    // Quando a Promise do banco resolver (2 segundos depois)...
    promiseDoBanco.then((dadosReais) => {
        console.log(`[Executor] [4] Promise da [Req ${id}] Resolvida! Injetando dados no gerador...`);

        // ...nós damos o .next() passando o dado real para dentro do generator.
        // Isso faz o código dar "RESUME" exatamente de onde parou!
        iterator.next(dadosReais); 
    });
}

// Simulando a concorrência: Disparamos duas requisições seguidas!
executarAssincrono(fluxoRequisicao, "A");
executarAssincrono(fluxoRequisicao, "B");
