function* fibonacci(n) {
    let [atual, proximo] = [0, 1]
    while(n--) {
        yield atual;
        [atual, proximo] = [proximo, atual + proximo]
    }
}

// Cria o gerador configurado para 10 números
fib1 = fibonacci(10);

for(let i=0; i<10; i++) {
    console.log(fib1.next().value)
}

// Utilização do operador de espalhamento (spread) para criar 
// um array com os 10 primeiros números da sequência
let [...primeiros10] = fibonacci(10);

console.log(primeiros10);