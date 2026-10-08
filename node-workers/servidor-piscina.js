const express = require('express');
const { Piscina } = require('piscina');
const os = require('node:os');
const path = require('node:path');
const { performance } = require('node:perf_hooks');

const app = express();
const PORTA = 3000;
const TOTAL = 500_000_000;
const CPUS = os.availableParallelism();
const CONFIGURACOES = [1, 2, 4, 8, 12, 16, 20];
const REPETICOES = 3;
const ARQUIVO_WORKER = path.join(__dirname, 'worker-piscina.mjs');
const ESPERADO = BigInt(TOTAL) * BigInt(TOTAL - 1) / 2n;
const formatar = valor => new Intl.NumberFormat('pt-BR').format(valor);
const segundos = inicio => (performance.now() - inicio) / 1000;
const arredondar = (valor, casas = 3) => Number(valor.toFixed(casas));

let contador = 0;
let tarefasAtivas = 0;
let benchmarkEmExecucao = false;

// Reutilizado nos experimentos 3 e 4. Não garante que CPUS seja ideal.
const pool = new Piscina({
    filename: ARQUIVO_WORKER,
    minThreads: 1,
    maxThreads: CPUS,
    idleTimeout: 10_000
});

// Garante que as requisições não sejam atendidas a partir de cache.
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-piscina.html'));
});

// 🟢 1. Rota rápida: sempre disponível, inclusive durante o benchmark.
app.get('/rapido', (req, res) => {
    const inicio = performance.now();
    
    contador++;

    res.json({
        mensagem: `🟢 Requisição rápida atendida! Total: ${contador}`,
        tempo: arredondar(segundos(inicio), 6)
    });
});

// Evita contaminação do benchmark por outras tarefas pesadas.
// Contabiliza operações pesadas até a conclusão real do processamento.
function reservarCalculo(req, res, next) {
    if (benchmarkEmExecucao) {
        return res.status(409).json({ erro: 'Benchmark em execução. Aguarde para iniciar outro cálculo pesado.' });
    }
    tarefasAtivas++;
    next();
}
function liberarCalculo() { tarefasAtivas--; }

// 🔴 2. Trabalho na thread principal: bloqueia o Event Loop do servidor.
app.get('/calcular-pesado-travado', reservarCalculo, (req, res) => {
    const inicio = performance.now();
    try {
        let resultado = 0n;
        for (let i = 0n; i < BigInt(TOTAL); i++) resultado += i;
        res.json({ resultado: formatar(resultado), tempo: arredondar(segundos(inicio)), workers: 0 });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        liberarCalculo();
    }
});

// Divide a mesma quantidade total de iterações em N intervalos independentes.
async function calcularParalelo(piscina, quantidade) {
    const tamanho = Math.ceil(TOTAL / quantidade);
    const tarefas = [];
    for (let i = 0; i < quantidade; i++) {
        const inicio = i * tamanho;
        const fim = Math.min(inicio + tamanho, TOTAL);
        if (inicio < fim) tarefas.push(piscina.run({ inicio, fim }));
    }

    const resultados = await Promise.all(tarefas);

    const soma = resultados.reduce((total, parcial) => total + parcial, 0n);
    if (soma !== ESPERADO) throw new Error('Resultado matemático divergente.');
    return soma;
}

// 🔵 3. Um único worker processa a tarefa integral.
app.get('/calcular-pesado', reservarCalculo, async (req, res) => {
    const inicio = performance.now();
    try {
        const resultado = await calcularParalelo(pool, 1);
        res.json({ resultado: formatar(resultado), tempo: arredondar(segundos(inicio)), workers: 1 });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        liberarCalculo();
    }
});

// 🟣 4. Divide a carga por CPUS tarefas; a Piscina administra as threads.
app.get('/calcular-paralelo', reservarCalculo, async (req, res) => {
    const inicio = performance.now();
    try {
        const resultado = await calcularParalelo(pool, CPUS);
        res.json({ resultado: formatar(resultado), tempo: arredondar(segundos(inicio)), workers: CPUS });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        liberarCalculo();
    }
});

const mediana = valores => {
    const ordenados = [...valores].sort((a, b) => a - b);
    return ordenados[Math.floor(ordenados.length / 2)];
};

// 🟠 5. Benchmark isolado: 3 rodadas para cada configuração.
app.get('/benchmark', async (req, res) => {
    if (benchmarkEmExecucao || tarefasAtivas > 0) {
        return res.status(409).json({
            erro: 'Há outro cálculo pesado ou benchmark em andamento. Aguarde a conclusão.'
        });
    }
    benchmarkEmExecucao = true;
    const tempos = new Map(CONFIGURACOES.map(n => [n, []]));

    try {
        // Rotaciona a ordem para reduzir o viés de aquecimento e temperatura.
        for (let rodada = 0; rodada < REPETICOES; rodada++) {
            const ordem = CONFIGURACOES.map((_, i) =>
                CONFIGURACOES[(i + rodada * 3) % CONFIGURACOES.length]
            );
            for (const n of ordem) {
                const piscina = new Piscina({
                    filename: ARQUIVO_WORKER,
                    minThreads: n,
                    maxThreads: n
                });
                try {
                    // Aguarda N tarefas leves, fora da medição principal.
                    await Promise.all(Array.from({ length: n }, () =>
                        piscina.run({ inicio: 0, fim: 1000 })
                    ));

                    const inicio = performance.now();
                    await calcularParalelo(piscina, n);
                    const tempo = segundos(inicio);

                    tempos.get(n).push(tempo);
                    console.log(`🟠 Rodada ${rodada + 1}/${REPETICOES} | ${n} workers: ${tempo.toFixed(3)} s`);
                } finally {
                    await piscina.destroy();
                }
            }
        }

        const referencia = mediana(tempos.get(1));

        const resultados = CONFIGURACOES.map(n => {
            const tempo = mediana(tempos.get(n));
            const speedup = referencia / tempo;

            return {
                workers: n,
                tempo: arredondar(tempo),
                speedup: arredondar(speedup),
                eficiencia: arredondar(speedup / n * 100, 2),
                repeticoes: tempos.get(n).map(t => arredondar(t))
            };
        });

        res.json({
            cpusDisponiveis: CPUS,
            totalIteracoes: TOTAL,
            resultado: formatar(ESPERADO),
            repeticoesPorConfiguracao: REPETICOES,
            resultados
        });
    } catch (erro) {
        console.error('❌ Erro no benchmark:', erro);
        res.status(500).json({ erro: erro.message });
    } finally {
        benchmarkEmExecucao = false;
    }
});

app.listen(PORTA, () => {
    console.log(`🚀 Servidor Piscina: http://localhost:${PORTA}`);
    console.log(`🖥️ Paralelismo disponível: ${CPUS}`);
    console.log(`🧪 Benchmark: ${CONFIGURACOES.join(', ')} workers, ${REPETICOES} repetições`);
});