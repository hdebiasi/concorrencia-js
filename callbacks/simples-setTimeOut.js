const logComTimestamp = (mensagem) => {
    // Formato de hora local: HH:MM:SS
    const horaFormatada = new Date().toLocaleTimeString('pt-BR');
    console.log(`[${horaFormatada}] ${mensagem}`);
};

logComTimestamp("Início do programa");

setTimeout(() => {
    logComTimestamp("\tIniciando tarefa assíncrona..");
    logComTimestamp("\tFinalizando tarefa assíncrona..");
}, 2000);

logComTimestamp("Fim do programa");