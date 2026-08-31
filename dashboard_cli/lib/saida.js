// Path: dashboard_cli/lib/saida.js

// Formatacao da saida. O padrao e COMPACTO, porque o consumidor e um agente com
// janela de contexto finita: o JSON indentado de 40 repositorios e varias vezes
// o mesmo conteudo em TSV.
//
// Cinco formatos, cada um com um consumidor real:
//   tsv       (padrao) o mais barato que ainda se le
//   tabela    alinhado, para quando um humano vai olhar
//   markdown  a tabela que entra no RPCMTec
//   csv       identico ao que o botao "Dados Consolidados" da tela baixa
//   json      cru e completo, para encadear

export const FORMATOS = ['tsv', 'tabela', 'markdown', 'csv', 'json']

function celula (valor) {
  if (valor === null || valor === undefined || valor === '') return '-'
  if (typeof valor === 'boolean') return valor ? 'sim' : 'nao'
  if (Array.isArray(valor)) return valor.join('; ')
  if (typeof valor === 'object') return JSON.stringify(valor)
  return String(valor)
}

export function tsv (linhas, colunas) {
  return [colunas.join('\t'), ...linhas.map(l => colunas.map(c => celula(l[c])).join('\t'))].join('\n')
}

export function tabela (linhas, colunas, rotulos = null) {
  const cab = rotulos || colunas
  const larguras = colunas.map((c, i) =>
    Math.max(cab[i].length, ...linhas.map(l => celula(l[c]).length)))
  const cabecalho = cab.map((c, i) => c.padEnd(larguras[i])).join('  ')
  const regua = larguras.map(w => '-'.repeat(w)).join('  ')
  const corpo = linhas.map(l => colunas.map((c, i) => celula(l[c]).padEnd(larguras[i])).join('  '))
  return [cabecalho, regua, ...corpo].join('\n')
}

export function markdown (linhas, colunas, rotulos = null, alinhamento = null) {
  const cab = rotulos || colunas
  const sep = colunas.map((_, i) => (alinhamento && alinhamento[i] === 'direita') ? '---:' : '---')
  const escapar = v => celula(v).replace(/\|/g, '\\|').replace(/\n/g, ' ')
  return [
    `| ${cab.join(' | ')} |`,
    `|${sep.map(s => s).join('|')}|`,
    ...linhas.map(l => `| ${colunas.map(c => escapar(l[c])).join(' | ')} |`)
  ].join('\n')
}

/**
 * CSV com as MESMAS colunas e o mesmo separador de autores do botao da tela
 * (ConsolidatedDataExport.jsx): cabecalho acentuado, autores unidos por ponto e
 * virgula, sem aspas. Existe para colar onde o CSV baixado seria colado.
 */
export function csvConsolidado (linhas) {
  return [
    'Repositório,Número de commits,Efetivo',
    ...linhas.map(l => `${l.repo},${l.commits},${l.efetivo.join('; ')}`)
  ].join('\n')
}

/** Escolhe o formato pedido pelas flags, validando. */
export function formatoDe (flags, padrao = 'tsv') {
  if (flags.json) return 'json'
  if (flags.csv) return 'csv'
  const f = flags.formato
  if (f === undefined || f === true) return padrao
  if (!FORMATOS.includes(f)) {
    throw new Error(`--formato ${f} nao existe. Use: ${FORMATOS.join(', ')}.`)
  }
  return f
}
