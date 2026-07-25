// Path: dashboard_cli/lib/periodo.js

// O recorte temporal: em que ano e mes um commit conta.
//
// A regua e a MESMA do dashboard, importada de src/utils/dateUtils.js, nao
// copiada: `getBrasiliaDayKey` decide o dia civil de Brasilia em que o instante
// cai. Um commit as 01:30 UTC do dia 1o conta no ULTIMO dia do mes anterior, e
// e assim que o grafico diario da tela ja o mostra.
//
// Porque isso importa: o script Python do vault que este CLI substitui aplicava
// um offset fixo de -3 h. Da o mesmo resultado desde 2019 (o Brasil acabou com o
// horario de verao), mas nao daria em 2018, e ninguem lembraria de ajustar.

import { getBrasiliaDayKey } from '../../src/utils/dateUtils.js'

export const MODOS = {
  mes: 'mes isolado',
  cumulativo: 'acumulado de janeiro ate o mes',
  ano: 'ano inteiro'
}

/**
 * Decide o modo a partir das flags.
 * @param {Object} flags
 * @param {string} padrao 'mes' ou 'cumulativo', conforme o comando
 */
export function modoDe (flags, padrao = 'cumulativo') {
  if (flags['ano-todo']) return 'ano'
  if (flags['mes-apenas']) return 'mes'
  if (flags.cumulativo) return 'cumulativo'
  return padrao
}

/** Ano e mes de Brasilia agora (nao do fuso da maquina que roda o CLI). */
export function hoje () {
  const chave = getBrasiliaDayKey(new Date())
  const [ano, mes, dia] = chave.split('-').map(Number)
  return { ano, mes, dia, chave }
}

/**
 * Ano e mes de Brasilia em que o commit conta.
 * @param {Date} data
 * @returns {{ano: number, mes: number, chave: string}}
 */
export function quando (data) {
  const chave = getBrasiliaDayKey(data)
  const [ano, mes] = chave.split('-').map(Number)
  return { ano, mes, chave }
}

/**
 * O commit cai no periodo pedido?
 * @param {Date} data
 * @param {{ano: number, mes: number, modo: string}} periodo
 */
export function noPeriodo (data, { ano, mes, modo }) {
  const q = quando(data)
  if (q.ano !== ano) return false
  if (modo === 'ano') return true
  if (modo === 'mes') return q.mes === mes
  return q.mes <= mes // cumulativo: janeiro ate o mes
}

/**
 * Filtra preservando a ORDEM do arquivo (que ja vem por data desc). A ordem
 * importa: o desempate da tabela consolidada e por primeira aparicao, entao
 * reordenar aqui mudaria o CSV sem ninguem perceber.
 */
export function filtrar (commits, periodo) {
  return commits.filter(c => c.date instanceof Date && !Number.isNaN(c.date.getTime()) &&
    noPeriodo(c.date, periodo))
}

/**
 * Primeiro instante APOS o fim do periodo, em UTC.
 *
 * Serve a guarda de frescor: um periodo ja fechado exige que os dados alcancem
 * o fim dele. Brasilia e UTC-3 fixo desde 2019 (fim do horario de verao) e os
 * dados comecam em 2024, entao a soma de 3 h e exata na faixa em que este CLI
 * opera; antes de 2019 ela erraria em uma hora nas viradas de mes durante o
 * horario de verao.
 */
export function fimDoPeriodo ({ ano, mes, modo }) {
  if (modo === 'ano') return new Date(Date.UTC(ano + 1, 0, 1, 3, 0, 0))
  return new Date(Date.UTC(ano, mes, 1, 3, 0, 0))
}

/** Rotulo legivel do periodo, para cabecalho de relatorio. */
export function rotulo ({ ano, mes, modo }) {
  if (modo === 'ano') return `${ano} (ano inteiro)`
  const mm = String(mes).padStart(2, '0')
  return modo === 'mes'
    ? `${mm}/${ano} (mes isolado)`
    : `${ano}, de janeiro ate ${mm} (acumulado)`
}
