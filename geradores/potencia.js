// Execute com Node.js.
// Para observar a memória com menos interferência: node --expose-gc geradores.js

const lista = [1, 3, 6, 10, 14];

function* potencias(valores, expoente) {
    for (const x of valores) {
        yield x ** expoente;
    }
}

// Equivalente a: gerador = (x**2 for x in lista)
const gerador = potencias(lista, 2);
console.log(gerador);

for (const valor of gerador) {
    console.log(valor);
}
console.log();

// Equivalente a: a = (x**3 for x in lista)
const a = potencias(lista, 3);

for (let i = 0; i < 6; i++) {
    const resultado = a.next();

    if (resultado.done) {
        console.log("Gerador esgotado!\n");
        break;
    }

    console.log(resultado.value);
}

function* gen(n) {
    for (let i = 0; i < n; i++) {mmmmmmmm
        yield i ** 2;
    }
}

// Comparação aproximada de consumo de memória
function memoriaUsada() {
    if (global.gc) global.gc();
    return process.memoryUsage().heapUsed;
}

const antes = memoriaUsada();

const c = Array.from({ length: 100_000 }, (_, i) => i ** 2);
const depoisDaLista = memoriaUsada();

const g = gen(100_000);
const depoisDoGerador = memoriaUsada();

console.log("Memória adicional (lista)..:", depoisDaLista - antes, "bytes");
console.log("Memória adicional (gerador):", depoisDoGerador - depoisDaLista, "bytes");