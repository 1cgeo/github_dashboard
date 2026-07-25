// Path: dashboard_cli/__tests__/agregacao.test.js

// Testes contra o contrato REAL (o authorMapping vivo do scripts/fetchData.js),
// nunca contra um mock: o valor deste CLI e nao ter copia do contrato, e um
// mock testaria justamente a copia. Quando o mapa mudar, e para estes testes
// acompanharem, nao para eles continuarem verdes sobre um mapa que nao existe.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import { authorMapping } from '../../scripts/fetchData.js'
import {
  porRepo, triagem, limparMensagem, autoresNaoMapeados, NOMES_CONHECIDOS
} from '../lib/agregacao.js'

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
