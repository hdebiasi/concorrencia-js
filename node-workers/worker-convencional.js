const { parentPort } = require('worker_threads');

let resultado = 0n;

// 500 milhões utilizando o tipo BigInt para evitar estouro de número
for (let i = 0n; i < 500_000_000n; i++) {
    resultado += i;
}

// Envia o resultado numérico puro de volta
parentPort.postMessage(resultado);