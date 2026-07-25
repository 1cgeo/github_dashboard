// Path: dashboard_cli/lib/agregacao.js

// As agregacoes do dashboard, do lado do agente.
//
// `porRepo` e a mesma conta do botao "Dados Consolidados" da tela
// (ConsolidatedDataExport.jsx): agrupa por repositorio, conta commits, junta os
// autores unicos, ordena por contagem desc. O desempate e por primeira aparicao
// no arquivo (que vem por data desc), e por isso `filtrar` preserva a ordem.
//
// `triagem` responde uma pergunta que a tela nao faz: a mensagem daquele commit
// diz o que foi feito, ou e generica a ponto de so o diff informar? E o passo
// que decide quais commits custam uma chamada a API do GitHub.

import { authorMapping } from '../../scripts/fetchData.js'
import { PALAVRAS_GENERICAS } from './regras.js'

/** Nomes normalizados que o fetchData.js conhece (o efetivo com posto e nome). */
export const NOMES_CONHECIDOS = new Set(Object.values(authorMapping))

/**
 * Agrupa por repositorio. Ordem: commits desc, empate pela primeira aparicao.
 * @param {Array} commits ja filtrados pelo periodo, na ordem do arquivo
 * @returns {{linhas: Array<{repo: string, commits: number, efetivo: string[]}>, total: number, autores: string[]}}
 */
export function porRepo (commits) {
  const mapa = new Map()
  const autores = []

  for (const c of commits) {
    const repo = c.repo || '-'
    const autor = c.author || '-'
    if (!mapa.has(repo)) mapa.set(repo, { repo, commits: 0, efetivo: [], _commits: [] })
    const slot = mapa.get(repo)
    slot.commits += 1
    if (!slot.efetivo.includes(autor)) slot.efetivo.push(autor)
    slot._commits.push(c)
    if (!autores.includes(autor)) autores.push(autor)
  }

  // sort e estavel (ES2019+): o empate mantem a ordem de insercao, que e a de
  // primeira aparicao. E o que faz a tabela do CLI bater com o CSV da tela.
  const linhas = [...mapa.values()].sort((a, b) => b.commits - a.commits)
  return { linhas, total: commits.length, autores }
}

/**
 * Autores do periodo que o authorMapping do fetchData.js nao normaliza.
 *
 * Substitui a heuristica de forma que o script do vault usava ("tem espaco no
 * nome?"): aqui a pergunta e feita a fonte viva. Autor novo no time aparece
 * nesta lista ate alguem acrescenta-lo ao mapa, que e exatamente o gesto que
 * falta quando um nome cru vaza para o relatorio.
 */
export function autoresNaoMapeados (autores) {
  return autores.filter(a => a && !NOMES_CONHECIDOS.has(a))
}

/** Tira do texto os trailers e o ruido de merge, que nao dizem o que foi feito. */
export function limparMensagem (msg) {
  const linhas = []
  for (const l of String(msg || '').split('\n')) {
    const s = l.trim().toLowerCase()
    if (s.startsWith('co-authored-by') || s.startsWith('merge branch') ||
        s.startsWith('merge pull request')) continue
    linhas.push(l.replace(/\s+$/, ''))
  }
  return linhas.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * A mensagem diz o que foi feito?
 * @param {string} msg ja limpa
 * @returns {{boa: boolean, assunto: string}}
 */
export function triagem (msg) {
  const linhas = String(msg || '').split('\n').filter(l => l.trim())
  if (!linhas.length) return { boa: false, assunto: '' }

  const assunto = linhas[0].trim()
  if (linhas.length > 1) return { boa: true, assunto } // tem corpo, tem substancia

  const palavras = assunto
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // 'correcao' e 'correção' contam igual
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (!palavras.length) return { boa: false, assunto }
  if (palavras.every(p => PALAVRAS_GENERICAS.has(p) || /^\d+$/.test(p))) return { boa: false, assunto }
  if (palavras.length <= 2 && assunto.length < 18) return { boa: false, assunto }
  return { boa: true, assunto }
}

/** Aplica limpeza e triagem a cada commit de uma linha de repositorio. */
export function classificar (linha) {
  return linha._commits.map(c => {
    const msg = limparMensagem(c.message)
    const { boa, assunto } = triagem(msg)
    return { sha: c.sha, repo: c.repo, autor: c.author, msg, assunto, boa, diff: null }
  })
}
