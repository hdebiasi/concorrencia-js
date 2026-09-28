let log = console.log;
function dividir(a, b) {
    return a / b;
}

log('Divisão normal de 10 por 2 = ' + dividir(10, 2));
log('Divisão normal de 10 por 0 = ' + dividir(10, 0));
log('Divisão normal de  0 por 0 = ' + dividir(0, 0));
log('');

//-------

function promessaDivisao(a, b) {
    return new Promise(function (resolve, reject) {
        if (b === 0) {
            reject(new Error('Não é possível dividir por 0 !'));
            return;
        }
        resolve(a / b);
    });
}

promessaDivisao(10, 0).then(function (resultado) {
    log(`Sucesso: ${resultado}`);
}).catch(function (erro) {
    log('Erro na divisão');
    log(erro);
});
