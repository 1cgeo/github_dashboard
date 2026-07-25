// Path: dashboard_cli/lib/github.js

// A unica parte do CLI que toca a rede alem de --remoto: buscar o diff de um
// commit cuja mensagem nao diz o que ele fez.
//
// Mesmo endpoint e mesma variavel de ambiente que o scripts/fetchData.js ja usa
// (GH_PAT), para nao existir uma segunda forma de autenticar no mesmo GitHub.
// Sem token o limite e 60 requisicoes por hora, e o CLI desliga a busca no
// primeiro 403 em vez de martelar a API.

const API = 'https://api.github.com'

export function tokenDoAmbiente () {
  return process.env.GH_PAT || process.env.GITHUB_TOKEN || null
}

/**
 * O que o commit realmente fez: arquivos alterados, saldo de linhas e, sob
 * pedido, um trecho do patch.
 * @returns {Promise<string>} resumo em uma linha (mais o patch, se pedido)
 */
export async function diff (repo, sha, { token = null, comPatch = false, tetoPatch = 1500 } = {}) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'dashboard-cli' }
  if (token) headers.Authorization = `token ${token}`

  const r = await fetch(`${API}/repos/${repo}/commits/${sha}`, { headers })
  if (!r.ok) {
    const err = new Error(`GitHub ${r.status} ${r.statusText} em ${repo}@${sha}`)
    err.status = r.status
    throw err
  }
  const d = await r.json()

  const arquivos = d.files || []
  const stats = d.stats || {}
  const mostrados = arquivos.slice(0, 30).map(f =>
    `${f.filename || '?'} (${f.status || '?'} +${f.additions || 0}/-${f.deletions || 0})`)
  const extra = arquivos.length > 30 ? ` (+${arquivos.length - 30} arquivos)` : ''
  let saida = `arquivos: ${mostrados.length ? mostrados.join('; ') : 'nenhum'}${extra}. ` +
    `total +${stats.additions || 0}/-${stats.deletions || 0}`

  if (comPatch) {
    const blocos = []
    let acumulado = 0
    for (const f of arquivos) {
      if (!f.patch) continue
      blocos.push(`--- ${f.filename || '?'}\n${f.patch}`)
      acumulado += f.patch.length
      if (acumulado >= tetoPatch) break
    }
    if (blocos.length) saida += '\ntrecho do diff:\n' + blocos.join('\n').slice(0, tetoPatch)
  }

  return saida
}

/**
 * Busca o diff de cada commit generico, em serie e com pausa.
 *
 * Desliga no primeiro 403 ou 429: sem token o limite estoura em uma dezena de
 * commits, e insistir so trocaria diffs por erros. Quem fica sem diff cai de
 * volta na mensagem, e o manifesto registra quantos ficaram, para o numero nao
 * passar por completo quando nao esta.
 */
export async function enriquecer (genericos, {
  token, comPatch, tetoPatch, pausaMs = 300, privados = new Set(), log = () => {}
}) {
  if (!genericos.length) return { obtidos: 0, semDiff: 0, desligado: false, semAcesso: [] }

  let obtidos = 0
  let semDiff = 0
  let desligado = false
  const semAcesso = new Set()

  for (const c of genericos) {
    if (desligado) { semDiff++; continue }
    try {
      c.diff = await diff(c.repo, c.sha, { token, comPatch, tetoPatch })
      obtidos++
    } catch (e) {
      semDiff++
      if (e.status === 403 || e.status === 429) {
        desligado = true
        log(`[limite] GitHub ${e.status}; desligando a busca de diff (o resto usa a mensagem). ` +
          'Defina GH_PAT ou passe --gh-token.')
      } else if (e.status === 404 && privados.has(c.repo)) {
        // O GitHub devolve 404, e nao 403, para repositorio privado sem acesso.
        // Repassar o 404 cru mandaria procurar um commit que existe: o defeito
        // e de credencial, e o CLI sabe disso porque o commits.json marca quais
        // repos sao privados. Um aviso por repositorio, nao um por commit.
        if (!semAcesso.has(c.repo)) {
          semAcesso.add(c.repo)
          log(`[sem acesso] ${c.repo} e privado e o token atual nao o alcanca: ` +
            'os commits genericos dele entram so com a mensagem. Defina GH_PAT com escopo repo.')
        }
      } else {
        log(`[diff] ${e.message}`)
      }
    }
    if (pausaMs && !desligado) await new Promise(r => setTimeout(r, pausaMs))
  }

  return { obtidos, semDiff, desligado, semAcesso: [...semAcesso] }
}
