// Path: dashboard_cli/__tests__/periodo.test.js

// O recorte temporal e onde um erro passa despercebido: erra por um dia, o
// numero continua plausivel, e ninguem confere. Por isso os testes atacam as
// FRONTEIRAS (virada de dia, de mes e de ano), e nao o caminho feliz.

import { test } from 'node:test'
import assert from 'node:assert/strict'

import { quando, noPeriodo, filtrar, fimDoPeriodo, modoDe, rotulo } from '../lib/periodo.js'

test('o dia do commit e o dia civil de Brasilia, nao o de UTC', () => {
  // 01:30 UTC do dia 1o de janeiro e 22:30 do dia 31 de dezembro em Brasilia.
  assert.equal(quando(new Date('2026-01-01T01:30:00Z')).chave, '2025-12-31')
  assert.equal(quando(new Date('2026-01-01T01:30:00Z')).ano, 2025)
  assert.equal(quando(new Date('2026-01-01T01:30:00Z')).mes, 12)

  // 03:00 UTC ja e 00:00 do dia 1o em Brasilia.
  assert.equal(quando(new Date('2026-01-01T03:00:00Z')).chave, '2026-01-01')
})

test('a virada de mes conta no mes de Brasilia', () => {
  const vespera = new Date('2026-07-01T01:00:00Z') // 30/06 22:00 em Brasilia
  assert.equal(noPeriodo(vespera, { ano: 2026, mes: 6, modo: 'mes' }), true)
  assert.equal(noPeriodo(vespera, { ano: 2026, mes: 7, modo: 'mes' }), false)
})

test('o resultado nao depende do fuso da maquina que roda o CLI', () => {
  // A funcao pede o fuso explicitamente, entao mudar o TZ do processo no meio
  // do teste nao pode mudar a resposta. Este teste falharia com a versao
  // anterior de dateUtils, que convertia duas vezes.
  const antes = process.env.TZ
  const instante = new Date('2026-07-25T03:30:00Z') // 00:30 de 25/07 em Brasilia
  try {
    process.env.TZ = 'UTC'
    const emUtc = quando(instante).chave
    process.env.TZ = 'Asia/Tokyo'
    const emToquio = quando(instante).chave
    assert.equal(emUtc, '2026-07-25')
    assert.equal(emToquio, '2026-07-25')
  } finally {
    if (antes === undefined) delete process.env.TZ
    else process.env.TZ = antes
  }
})

test('cumulativo pega de janeiro ate o mes, mes-apenas nao', () => {
  const marco = new Date('2026-03-10T12:00:00Z')
  assert.equal(noPeriodo(marco, { ano: 2026, mes: 6, modo: 'cumulativo' }), true)
  assert.equal(noPeriodo(marco, { ano: 2026, mes: 6, modo: 'mes' }), false)
  assert.equal(noPeriodo(marco, { ano: 2026, mes: 6, modo: 'ano' }), true)
  assert.equal(noPeriodo(marco, { ano: 2025, mes: 6, modo: 'ano' }), false)
})

test('filtrar preserva a ordem do arquivo (o desempate da 4.1 depende dela)', () => {
  const commits = [
    { repo: 'b', date: new Date('2026-06-20T12:00:00Z') },
    { repo: 'a', date: new Date('2026-06-19T12:00:00Z') },
    { repo: 'c', date: new Date('2025-06-19T12:00:00Z') }
  ]
  const saida = filtrar(commits, { ano: 2026, mes: 6, modo: 'mes' })
  assert.deepEqual(saida.map(c => c.repo), ['b', 'a'])
})

test('filtrar descarta data invalida em vez de conta-la em algum mes', () => {
  const commits = [
    { repo: 'a', date: new Date('data podre') },
    { repo: 'b', date: new Date('2026-06-19T12:00:00Z') }
  ]
  assert.deepEqual(
    filtrar(commits, { ano: 2026, mes: 6, modo: 'mes' }).map(c => c.repo),
    ['b']
  )
})

test('fimDoPeriodo e a meia-noite de Brasilia que fecha o periodo', () => {
  assert.equal(fimDoPeriodo({ ano: 2026, mes: 6, modo: 'mes' }).toISOString(), '2026-07-01T03:00:00.000Z')
  assert.equal(fimDoPeriodo({ ano: 2026, mes: 12, modo: 'cumulativo' }).toISOString(), '2027-01-01T03:00:00.000Z')
  assert.equal(fimDoPeriodo({ ano: 2026, mes: 3, modo: 'ano' }).toISOString(), '2027-01-01T03:00:00.000Z')
})

test('modoDe respeita a flag e cai no padrao do comando', () => {
  assert.equal(modoDe({}, 'cumulativo'), 'cumulativo')
  assert.equal(modoDe({}, 'mes'), 'mes')
  assert.equal(modoDe({ 'mes-apenas': true }, 'cumulativo'), 'mes')
  assert.equal(modoDe({ 'ano-todo': true }, 'mes'), 'ano')
  assert.equal(modoDe({ cumulativo: true }, 'mes'), 'cumulativo')
})

test('rotulo diz o recorte em portugues, sem ambiguidade', () => {
  assert.match(rotulo({ ano: 2026, mes: 6, modo: 'mes' }), /06\/2026/)
  assert.match(rotulo({ ano: 2026, mes: 6, modo: 'cumulativo' }), /acumulado/)
  assert.match(rotulo({ ano: 2026, mes: 6, modo: 'ano' }), /ano inteiro/)
})
