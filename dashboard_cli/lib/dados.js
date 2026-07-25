// Path: dashboard_cli/lib/dados.js

// Carrega o src/data/commits.json, que e quem tem os dados.
//
// Por padrao le o arquivo do proprio clone. O arquivo e produzido pelo
// scripts/fetchData.js, que o GitHub Actions roda 3x ao dia e commita na main,
// entao um clone parado fica atras do publicado: --remoto le direto da main, e
// o CLI avisa quando o dado esta velho para o periodo pedido.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { normalizeAuthorName } from '../../scripts/fetchData.js'
import { fimDoPeriodo, rotulo } from './periodo.js'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

export const CAMINHO_PADRAO = path.resolve(AQUI, '..', '..', 'src', 'data', 'commits.json')

const RAW_TPL = 'https://raw.githubusercontent.com/1cgeo/github_dashboard/main/src/data/commits.json'

async function baixar (url) {
  const r = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!r.ok) throw new Error(`nao consegui ler ${url}: HTTP ${r.status} ${r.statusText}`)
  return r.json()
}

/**
 * @param {{source?: string, remoto?: boolean}} opcoes
 * @returns {Promise<{bruto: Object, commits: Array, origem: string, lastUpdate: Date|null}>}
 */
export async function carregar ({ source = null, remoto = false } = {}) {
  let bruto, origem

  if (source && /^https?:\/\//.test(source)) {
    bruto = await baixar(source)
    origem = source
  } else if (source) {
    bruto = JSON.parse(fs.readFileSync(source, 'utf8'))
    origem = source
  } else if (remoto) {
    bruto = await baixar(RAW_TPL)
    origem = RAW_TPL
  } else {
    if (!fs.existsSync(CAMINHO_PADRAO)) {
      throw new Error(
        `nao achei ${CAMINHO_PADRAO}. Rode de um clone do github_dashboard, ou use --remoto.`)
    }
    bruto = JSON.parse(fs.readFileSync(CAMINHO_PADRAO, 'utf8'))
    origem = CAMINHO_PADRAO
  }

  if (!bruto || !Array.isArray(bruto.commits)) {
    throw new Error(`${origem} nao parece um commits.json (falta o array "commits").`)
  }

  // Mesma hidratacao do GitHubDashboard.jsx (data vira Date, repo ganha a marca
  // de privado), mais uma coisa que a tela nao faz: reaplicar o authorMapping.
  // O fetchData normaliza o nome no momento da coleta e nunca revisita commit
  // ja gravado, entao mapear um handle novo hoje nao conserta o historico.
  // Reaplicar na leitura conserta, e e idempotente.
  const repoPrivate = bruto.repoPrivate || {}
  const commits = bruto.commits.map(c => ({
    ...c,
    date: new Date(c.date),
    author: normalizeAuthorName(c.author),
    isPrivate: repoPrivate[c.repo] === true
  }))

  return { bruto, commits, origem, lastUpdate: bruto.lastUpdate ? new Date(bruto.lastUpdate) : null }
}

/**
 * Aviso quando o dado nao cobre o periodo pedido. Nao bloqueia: so diz, para
 * um total menor do que a realidade nao passar sem sintoma.
 * @returns {string[]} avisos
 */
export function avisosDeFrescor ({ lastUpdate, origem, periodo, agora = new Date() }) {
  if (!lastUpdate) return [`${origem} nao traz lastUpdate: nao da para saber ate quando o dado vai.`]

  const fim = fimDoPeriodo(periodo)
  const alvo = Math.min(fim.getTime(), agora.getTime())
  if (lastUpdate.getTime() >= alvo) return []

  const dias = (alvo - lastUpdate.getTime()) / 86400000
  const conserto = origem.startsWith('http')
    ? 'o Actions atualiza 07h, 12h e 17h BRT'
    : '`git pull`, ou --remoto para ler a main'
  return [
    `O commits.json vai ate ${lastUpdate.toISOString()} e o periodo ${rotulo(periodo)} pede ` +
    `mais ${dias.toFixed(1)} dias: faltam commits nesta contagem (${conserto}).`
  ]
}
