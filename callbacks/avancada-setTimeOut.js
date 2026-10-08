const logComTimestamp = (mensagem) => {
    const horaFormatada = new Date().toLocaleTimeString('pt-BR');
    console.log(`[${horaFormatada}] ${mensagem}`);
};

// Criamos uma função que "bloqueia" a execução pelo tempo determinado
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const executarPrograma = async () => {
    logComTimestamp("Início do programa");

    logComTimestamp("\tInício da tarefa assíncrona");
    
    // O 'await' faz o código pausar aqui por 2000 milissegundos (2 segundos)
    await esperar(2000); 
    
    logComTimestamp("\tFim da tarefa assíncrona");

    logComTimestamp("Fim do programa");
};

// Executa a função principal
executarPrograma();
