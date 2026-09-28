function* controleRemoto() {
    console.log("Ligando a TV...");
    yield "Passo 1: TV Ligada"; // O código PAUSA aqui!

    console.log("Mudando de canal...");
    yield "Passo 2: Canal Mudado"; // O código PAUSA aqui de novo!

    console.log("Desligando...");
    return "Fim do programa";
}

const tv = controleRemoto(); // Cria o iterator (não executa nada ainda)

// 1. Executa até o primeiro yield
const estado1 = tv.next(); 
// Console: "Ligando a TV..."
// estado1 contém: { value: "Passo 1: TV Ligada", done: false }

// --- Aqui a thread do JS está livre. Você pode rodar qualquer outro código! ---

// 2. O RESUME: Executa do ponto onde parou até o próximo yield
const estado2 = tv.next();
// Console: "Mudando de canal..."
// estado2 contém: { value: "Passo 2: Canal Mudado", done: false }

const estado3 = tv.next();
// Console: "Desligando..."
// estado2 contém: { value: "Passo 3: Fim do programa", done: true }
