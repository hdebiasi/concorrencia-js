self.onmessage = ({ data }) => {
  try {
    const { inicio, fim } = data;

    let soma = 0n;
    for (let i = BigInt(inicio); i < BigInt(fim); i++) {
        soma += i;
    }
    
    self.postMessage({ resultado: soma });
  } catch (erro) {
    self.postMessage({ erro: erro.message });
  }
};
