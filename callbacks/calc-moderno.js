const somar = (x, y) => x + y;
const subtrair = (x, y) => x - y;

const calcular = (a, fn, b) => fn(a, b);

console.log(calcular(2, somar, 1));    // Resultado: 3
console.log(calcular(2, subtrair, 1)); // Resultado: 1

const z = somar;
console.log(z(2, 2));                  // Resultado: 4