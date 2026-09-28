function* fibonacci(n) {
    let [atual, proximo] = [0, 1]
    while(n--) {
        yield atual;
        [atual, proximo] = [proximo, atual + proximo]
    }
}

fib1 = fibonacci(10)
for(let i=0; i<10; i++) {
    console.log(fib1.next().value)
}

let [...primeiros10] = fibonacci(10);

console.log(primeiros10);

