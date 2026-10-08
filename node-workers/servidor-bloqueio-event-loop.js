const { performance } = require('node:perf_hooks');
const express = require('express');
const { Worker } = require('worker_threads');
const path = require('path');
const app = express();

let contadorDeRequisicoes = 0;

// Rota para servir a página visual
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. ROTA RÁPIDA: Apenas incrementa um contador e responde
app.get('/rapido', (req, res) => {
    contadorDeRequisicoes++;
    res.json({ mensagem: `Atendido! Total de requisições rápidas: ${contadorDeRequisicoes}` });
});

// 2. ROTA TRAVADA (Sem Worker): Bloqueia o Event Loop do servidor
app.get('/calcular-pesado-travado', (req, res) => {
    let resultado = 0n;
    // 500 milhões utilizando o tipo BigInt para evitar estouro de número
    for (let i = 0n; i < 500_000_000n; i++) {
        resultado += i;
    }
    
    // Formata o número no padrão nacional
    const resultadoFormatado = new Intl.NumberFormat('pt-BR').format(resultado);
    res.json({ mensagem: `Cálculo terminado (TRAVOU O SERVIDOR): ${resultadoFormatado}` });
});

// 3. ROTA COM WORKER (Otimizada): Não bloqueia o event loop principal
app.get('/calcular-pesado', (req, res) => {
    const inicio = performance.now();
    const caminhoWorker = path.join(__dirname, 'worker-convencional.js');
    const worker = new Worker(caminhoWorker);

    let respondeu = false;

    // Centraliza as respostas e evita respostas duplicadas
    function responder(status, dados) {
        if (respondeu || res.headersSent || res.destroyed) return;

        respondeu = true;
        res.status(status).json(dados);
    }

    // .once (em vez do .on) executa o callback apenas na primeira mensagem e remove automaticamente o listener
    // Isso evita múltiplas respostas para a mesma requisição
    // .once() remove o listener, mas não encerra a worker thread
    // O worker precisa terminar sua execução naturalmente ou ser encerrado explicitamente
    worker.once('message', (resultado) => {
        try {
            const tempo = ((performance.now() - inicio) / 1000).toFixed(2);
            const resultadoFormatado = new Intl.NumberFormat('pt-BR')
                .format(BigInt(resultado));

            responder(200, {
                status: 'Sucesso',
                mensagem: `Cálculo terminado via Worker: ${resultadoFormatado}`,
                tempo
            });
        } catch (erro) {
            responder(500, {
                status: 'Erro',
                mensagem: erro.message
            });
        }
    });

    // Trata exceções não capturadas dentro do worker
    worker.once('error', (err) => {
        console.error("ERRO DETECTADO NO WORKER:", err);

        responder(500, {
            status: 'Erro',
            mensagem: err.message
        });
    });

    // Detecta encerramento sem envio de resultado
    worker.once('exit', (codigo) => {
        if (!respondeu) {
            responder(500, {
                status: 'Erro',
                mensagem: `Worker encerrado sem resultado (código ${codigo}).`
            });
        }
    });
});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
