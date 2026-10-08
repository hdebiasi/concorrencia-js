// Executa apenas o intervalo [inicio, fim), sem sobreposições.
export default ({ inicio, fim }) => {
    let resultado = 0n;

    for (let i = BigInt(inicio); i < BigInt(fim); i++) {
        resultado += i;
    }

    return resultado;
};