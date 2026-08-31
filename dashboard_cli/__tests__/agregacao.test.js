// Path: dashboard_cli/__tests__/agregacao.test.js

// Testes contra o contrato REAL (o authorMapping vivo do scripts/fetchData.js),
// nunca contra um mock: o valor deste CLI e nao ter copia do contrato, e um
// mock testaria justamente a copia. Quando o mapa mudar, e para estes testes
// acompanharem, nao para eles continuarem verdes sobre um mapa que nao existe.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  authorMapping, AUTORES_NAO_EFETIVO, ehEfetivo, autorDoCommit, shouldIncludeCommit
} from '../../scripts/fetchData.js'
import {
  porRepo, triagem, limparMensagem, autoresNaoMapeados, NOMES_CONHECIDOS
} from '../lib/agregacao.js'
import { csvConsolidado } from '../lib/saida.js'

function commit (repo, author, message = 'assunto qualquer bem descritivo') {
  return { repo, author, message, sha: 'abc1234' }
}

test('porRepo conta, junta o efetivo unico e ordena por commits desc', () => {
  const { linhas, total, autores } = porRepo([
    commit('a', 'Maj Diniz'),
    commit('b', 'Cap Ronaldo'),
    commit('a', 'Maj Diniz'),
    commit('a', 'Cap Ronaldo')
  ])
  assert.equal(total, 4)
  assert.deepEqual(linhas.map(l => l.repo), ['a', 'b'])
  assert.equal(linhas[0].commits, 3)
  assert.deepEqual(linhas[0].efetivo, ['Maj Diniz', 'Cap Ronaldo'])
  assert.deepEqual(autores, ['Maj Diniz', 'Cap Ronaldo'])
})

test('quem nao e efetivo conta o commit e sai da coluna Efetivo', () => {
  // O nome sai, o commit fica. Trocar isso por "descarta o commit" faria a 5.1
  // reportar menos trabalho do que o repositorio recebeu.
  const naoEfetivo = [...AUTORES_NAO_EFETIVO][0]
  const { linhas, total, autores } = porRepo([
    commit('a', 'Maj Diniz'),
    commit('a', naoEfetivo),
    commit('so-agente', naoEfetivo)
  ])
  assert.equal(total, 3)
  assert.equal(linhas[0].commits, 2)
  assert.deepEqual(linhas[0].efetivo, ['Maj Diniz'])
  assert.deepEqual(linhas.find(l => l.repo === 'so-agente').efetivo, [])
  assert.deepEqual(autores, ['Maj Diniz'])
})

test('o efetivo novo do mapa chega com posto e nome de guerra', () => {
  // Handle que ja vazou cru para um RPCMTec (venturaluisbr, julho/2026).
  const { linhas } = porRepo([commit('doc_dgeo', authorMapping.venturaluisbr)])
  assert.deepEqual(linhas[0].efetivo, ['1º Ten Ventura'])
  assert.equal(autoresNaoMapeados(['1º Ten Ventura']).length, 0)
})

test('empate desempata pela primeira aparicao, como o CSV da tela', () => {
  // O arquivo vem por data desc, entao "primeira aparicao" e "commit mais
  // recente". Reordenar aqui mudaria o CSV em silencio.
  const { linhas } = porRepo([
    commit('recente', 'Maj Diniz'),
    commit('antigo', 'Maj Diniz')
  ])
  assert.deepEqual(linhas.map(l => l.repo), ['recente', 'antigo'])
  assert.deepEqual(linhas.map(l => l.commits), [1, 1])
})

test('triagem separa mensagem que informa de mensagem que nao informa', () => {
  assert.equal(triagem('fix').boa, false)
  assert.equal(triagem('ajustes').boa, false)
  assert.equal(triagem('wip 2').boa, false)
  assert.equal(triagem('').boa, false)
  assert.equal(triagem('sap').boa, false)
  assert.equal(triagem('correção').boa, false, 'acento nao pode escapar da triagem')

  assert.equal(triagem('feat(carta): quadro de uso militar expedito').boa, true)
  assert.equal(triagem('fix\n\ncorrige o calculo da moldura quando a folha cruza o fuso').boa, true,
    'mensagem com corpo tem substancia, mesmo com assunto generico')
})

test('limparMensagem tira trailer e ruido de merge, preservando o resto', () => {
  const msg = 'feat: quadro novo\n\nDetalhe importante.\nCo-Authored-By: Alguem <a@b.c>\nMerge branch main'
  const limpa = limparMensagem(msg)
  assert.match(limpa, /Detalhe importante/)
  assert.doesNotMatch(limpa, /Co-Authored-By/)
  assert.doesNotMatch(limpa, /Merge branch/)
})

test('NOMES_CONHECIDOS vem do authorMapping vivo, e nao de uma lista escrita aqui', () => {
  const valores = new Set(Object.values(authorMapping))
  assert.deepEqual([...NOMES_CONHECIDOS].sort(), [...valores].sort())
  assert.ok(NOMES_CONHECIDOS.size > 0, 'o authorMapping nao pode estar vazio')
})

test('autoresNaoMapeados acusa o handle cru e absolve o nome normalizado', () => {
  const umNormalizado = Object.values(authorMapping)[0]
  const naoMapeados = autoresNaoMapeados([umNormalizado, 'algum-handle-do-github'])
  assert.deepEqual(naoMapeados, ['algum-handle-do-github'])
})

test('o authorMapping e idempotente: nenhum nome normalizado e chave do mapa', () => {
  // O CLI reaplica o mapa na leitura para consertar historico. Se um VALOR
  // fosse tambem CHAVE, a reaplicacao mudaria o nome duas vezes e o efetivo do
  // relatorio sairia trocado. Este teste e o alarme dessa colisao.
  const chaves = new Set(Object.keys(authorMapping))
  const colisoes = [...new Set(Object.values(authorMapping))].filter(v => chaves.has(v))
  assert.deepEqual(colisoes, [], 'valor do authorMapping usado tambem como chave')
})

// O caso degenerado que esta regra existe para pegar: o nome do agente com
// SUFIXO. Um Set de literais casa so a grafia exata, e o teste vizinho tira o
// insumo do proprio Set, entao ele nunca poderia reprovar uma grafia nova.
// Em agosto/2026 passou "Claude (Chefe DGEO)" e o nome chegou ao CSV da 5.1.
test('o nome do agente com sufixo nao passa por efetivo', () => {
  assert.equal(ehEfetivo('Claude (Chefe DGEO)'), false)
  assert.equal(ehEfetivo('Claude'), false)
  assert.equal(ehEfetivo('Claude Code'), false)
  // e o militar cujo nome so COMECA parecido continua entrando
  assert.equal(ehEfetivo('Maj Claudio'), true)
  assert.equal(ehEfetivo('Maj Diniz'), true)
})

// Decisao do chefe da DGEO, 2026-08-31: commit escrito COMO o agente nao entra
// pelo nome do agente. Procura-se a PESSOA associada, na conta do GitHub que
// assinou e depois no e-mail. Sem pessoa, o commit sai da conta inteira.
test('commit do agente vai para a pessoa associada, pela conta do GitHub', () => {
  const c = {
    commit: { author: { name: 'Claude (Chefe DGEO)', email: 'diniz.ime@gmail.com' } },
    author: { login: 'dinizime' }
  }
  assert.equal(autorDoCommit(c), 'Maj Diniz')
})

test('commit do agente vai para a pessoa associada, pelo e-mail', () => {
  const c = {
    commit: { author: { name: 'Claude', email: 'marcelgfernandes@gmail.com' } },
    author: null
  }
  assert.equal(autorDoCommit(c), '1o Ten Marcel'.replace('1o', '1º'))
})

test('commit do agente SEM pessoa associada sai da conta', () => {
  const c = {
    commit: {
      author: { name: 'Claude (Chefe DGEO)', email: 'noreply@anthropic.com' },
      message: 'assunto qualquer bem descritivo'
    },
    author: { login: 'ninguem-conhecido' }
  }
  assert.equal(autorDoCommit(c), null)
  assert.equal(shouldIncludeCommit(c), false)
})

test('commit de militar passa inteiro, e o nome vem normalizado', () => {
  const c = {
    commit: {
      author: { name: 'dinizime', email: 'diniz.ime@gmail.com' },
      message: 'assunto qualquer bem descritivo'
    },
    author: { login: 'dinizime' }
  }
  assert.equal(autorDoCommit(c), 'Maj Diniz')
  assert.equal(shouldIncludeCommit(c), true)
})

// Decisao do chefe da DGEO, 2026-08-31: a celula Efetivo do documento assinado
// separa os militares por "; ", com espaco. Sem ele o RPCMTec sai lendo
// "Maj Diniz;1o Ten Marcel", com os nomes colados.
test('o CSV separa o efetivo por ponto e virgula mais espaco', () => {
  const csv = csvConsolidado([
    { repo: 'a', commits: 3, efetivo: ['Maj Diniz', 'Ten Marcel'] },
    { repo: 'b', commits: 1, efetivo: ['Maj Borba'] }
  ])
  const linhas = csv.split(String.fromCharCode(10))
  assert.equal(linhas[1], 'a,3,Maj Diniz; Ten Marcel')
  assert.equal(linhas[2], 'b,1,Maj Borba')
})
