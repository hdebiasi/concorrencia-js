function somar(x, y) {
    return x + y;
}

function subtrair(x, y) {
    return x - y;
}

function calcular(a, fn, b) {
    return fn(a, b);
}

console.log(calcular(2, somar, 1)); // Resultado: 3
console.log(calcular(2, subtrair, 1)); // Resultado: 1

const z = somar;
console.log(z(2, 2)); // Resultado: 4
