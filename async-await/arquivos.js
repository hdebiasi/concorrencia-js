const fs = require('fs')

console.log('[SÍNCRONO] 🚀 Iniciando o script principal...')

// BLOCO 1: Callback Nomeado
function avisaTerminouLer(erro, conteudo) {
    if (erro) {
        console.error('[BLOCO 1] ❌ Erro na leitura:', erro.message)
        return
    }
    console.log('[BLOCO 1] ✅ Concluído. Conteúdo:', String(conteudo).trim())
}

console.log('[SÍNCRONO] 📂 Solicitando leitura do Bloco 1 (Callback Nomeado)...')
fs.readFile('./in1.txt', avisaTerminouLer)

// BLOCO 2: Promises (.then)
fs.promises.readFile('./in1.txt')
    .then(conteudo => {console.log('[BLOCO 2] ✅ Concluído. Conteúdo:', String(conteudo).trim())})
    .catch(erro => {console.error('[BLOCO 2] ❌ Erro:', erro.message)})

// BLOCO 3: Callbacks Aninhados
console.log('[SÍNCRONO] 📂 Solicitando leitura inicial do Bloco 3 (Aninhado)...')
fs.readFile('./in1.txt', (erro1, conteudo1) => {
    if (erro1) {
        console.error('[BLOCO 3] ❌ Erro ao ler arquivo 1:', erro1.message)
        return
    }
    console.log('[BLOCO 3] 🔄 Arquivo 1 lido com sucesso! Iniciando leitura do arquivo 2...')

    fs.readFile('./in2.txt', (erro2, conteudo2) => {
        if (erro2) {
            console.error('[BLOCO 3] ❌ Erro ao ler arquivo 2:', erro2.message)
            return
        }
        console.log('[BLOCO 3] ✅ Concluído com sucesso!')
        console.log('       -> Conteúdo do in1:', String(conteudo1).trim())
        console.log('       -> Conteúdo do in2:', String(conteudo2).trim())
    })
})

console.log('[SÍNCRONO] 🏁 Fim do script principal. O JavaScript liberou a linha de execução e agora os arquivos responderão nos bastidores...\n')
