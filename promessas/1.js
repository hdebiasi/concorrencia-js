let promessa = new Promise((resolve, reject) => {
    try {
        // Promise executada com sucesso
        setTimeout(() => {
            // Ponto de solução da promessa
            resolve('Promessa concluída com sucesso!');
        }, 3000);
    } catch (e) {
        // Erro na execução da promessa
        setTimeout(() => {
            // Promessa rejeitada
            reject(e);
        }, 3000);
    }
});

console.log(promessa);