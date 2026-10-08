const cluster = require('node:cluster');
const os = require('node:os');
const express = require('express');
const { Worker } = require('node:worker_threads');
const { performance } = require('node:perf_hooks');
const path = require('node:path');

// 🔄 Configura o escalonamento Round-Robin antes de criar os processos
cluster.schedulingPolicy = cluster.SCHED_RR;

const numCPUs = os.availableParallelism();
const totalClusters = Math.min(8, numCPUs);
const PORTA = 3000;

// ============================================================
// 🏢 1. PROCESSO PRIMÁRIO: Gerencia os processos filhos
// ============================================================
if (cluster.isPrimary) {
    console.log(`\n🏢 [PAI] Processo primário iniciado. PID: ${process.pid}`);
    console.log(`🖥️ [PAI] Processadores lógicos disponíveis: ${numCPUs}`);
    console.log(`🚀 [PAI] Criando ${totalClusters} processos filhos...\n`);

    for (let i = 0; i < totalClusters; i++) {
        cluster.fork();
    }

    // ✅ Informa quando um processo filho está online
    cluster.on('online', (worker) => {
        console.log(`✅ [PAI] Processo filho online. PID: ${worker.process.pid}`);
    });

    //🚨 Detecta a queda de um processo e cria seu substituto
    cluster.on('exit', (worker, code, signal) => {
        console.log(`\n🚨 [PAI] Processo ${worker.process.pid} encerrado.`);
        console.log(`⚠️ [PAI] Código: ${code} | Sinal: ${signal || 'nenhum'}`);

        // Não reinicia processos desconectados intencionalmente
        if (!worker.exitedAfterDisconnect) {
            console.log('♻️ [PAI] Criando processo substituto...');
            cluster.fork();
        }
    });

// ============================================================
// 🖥️ 2. PROCESSOS FILHOS: Servidores Express independentes
// ============================================================
} else {
    const app = express();
    let contadorDeRequisicoes = 0;

    console.log(`🟢 [FILHO] Servidor iniciado. PID: ${process.pid}`);

    // 🚫 Evita armazenamento em cache das respostas
    app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-store');
        next();
    });

    // 🌐 Página visual do laboratório
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index-cluster-crash.html'));
    });

    // --------------------------------------------------------
    // 🟢 EXPERIMENTO 1: Requisição rápida
    // --------------------------------------------------------
    app.get('/rapido', (req, res) => {
        const inicio = performance.now();
        contadorDeRequisicoes++;

        const tempo = ((performance.now() - inicio) / 1000).toFixed(4);

        res.json({
            status: 'Sucesso',
            pid: process.pid,
            mensagem: `✅ [PID ${process.pid}] Requisição rápida atendida! Total local: ${contadorDeRequisicoes}`,
            tempo
        });
    });

    // --------------------------------------------------------
    // 🔴 EXPERIMENTO 2: Cálculo bloqueante
    // --------------------------------------------------------
    app.get('/calcular-pesado-travado', (req, res) => {
        const inicio = performance.now();
        let resultado = 0n;

        console.log(`🔴 [PID ${process.pid}] Iniciando cálculo BLOQUEANTE...`);

        // ⛔ Bloqueia somente o Event Loop deste processo filho
        for (let i = 0n; i < 500_000_000n; i++) {
            resultado += i;
        }

        const tempo = ((performance.now() - inicio) / 1000).toFixed(2);
        const resultadoFormatado = new Intl.NumberFormat('pt-BR')
            .format(resultado);

        console.log(`✅ [PID ${process.pid}] Cálculo bloqueante concluído em ${tempo}s`);

        res.json({
            status: 'Sucesso',
            pid: process.pid,
            mensagem: `🔴 [PID ${process.pid}] Cálculo bloqueante terminado: ${resultadoFormatado}`,
            tempo
        });
    });

    // --------------------------------------------------------
    // 🔵 EXPERIMENTO 3: Cálculo com Worker Thread
    // --------------------------------------------------------
    app.get('/calcular-pesado', (req, res) => {
        const inicio = performance.now();
        const caminhoWorker = path.join(__dirname, 'worker-convencional.js');
        const worker = new Worker(caminhoWorker);

        let respondeu = false;

        console.log(`🔵 [PID ${process.pid}] Cálculo enviado para Worker Thread...`);

        // 🛡️ Centraliza as respostas e evita respostas duplicadas
        function responder(status, dados) {
            if (respondeu || res.headersSent || res.destroyed) return;

            respondeu = true;
            res.status(status).json(dados);
        }

        // 📩 Recebe a primeira mensagem enviada pelo Worker
        // .once() remove o listener, mas não encerra a thread.
        worker.once('message', (resultado) => {
            try {
                const tempo = ((performance.now() - inicio) / 1000).toFixed(2);
                const resultadoFormatado = new Intl.NumberFormat('pt-BR')
                    .format(BigInt(resultado));

                console.log(`✅ [PID ${process.pid}] Worker concluiu em ${tempo}s`);

                responder(200, {
                    status: 'Sucesso',
                    pid: process.pid,
                    mensagem: `🔵 [PID ${process.pid}] Cálculo via Worker terminado: ${resultadoFormatado}`,
                    tempo
                });
            } catch (erro) {
                responder(500, {
                    status: 'Erro',
                    pid: process.pid,
                    mensagem: `❌ ${erro.message}`
                });
            }
        });

        // ❌ Trata erros não capturados dentro da Worker Thread
        worker.once('error', (erro) => {
            console.error(`❌ [PID ${process.pid}] Erro no Worker:`, erro);

            responder(500, {
                status: 'Erro',
                pid: process.pid,
                mensagem: `❌ ${erro.message}`
            });
        });

        // 🚪 Detecta encerramento sem resultado
        worker.once('exit', (codigo) => {
            if (!respondeu) {
                console.log(`⚠️ [PID ${process.pid}] Worker encerrado sem resultado!`);

                responder(500, {
                    status: 'Erro',
                    pid: process.pid,
                    mensagem: `⚠️ Worker encerrado sem resultado (código ${codigo}).`
                });
            }
        });
    });

    // --------------------------------------------------------
    // 🟠 EXPERIMENTO 4: Cálculo no navegador
    // --------------------------------------------------------
    // 🌐 Executado diretamente no JavaScript do HTML.
    // ⛔ Bloqueia a thread principal do navegador, não o servidor.

    // --------------------------------------------------------
    // 💥 EXPERIMENTO 5: Simulação de crash
    // --------------------------------------------------------
    app.get('/crash', (req, res) => {
        console.log(`\n💥 [PID ${process.pid}] Simulando CRASH do processo...`);

        res.json({
            status: 'Sucesso',
            pid: process.pid,
            mensagem: `💥 [PID ${process.pid}] Encerramento intencional solicitado!`
        });

        // Aguarda a resposta ser entregue à camada de saída
        // antes de encerrar o processo.
        res.once('finish', () => {
            setImmediate(() => process.exit(1));
        });
    });

    // 🌐 Todos os processos filhos compartilham a mesma porta
    app.listen(PORTA, () => {
        console.log(`🌐 [FILHO ${process.pid}] Escutando http://localhost:${PORTA}`);
    });
}
