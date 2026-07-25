// Path: dashboard_cli/comandos/material.js

// `dash material` prepara a coluna que falta na 4.1: o RESUMO do que foi feito
// em cada repositorio no periodo.
//
// O CLI faz so a parte deterministica, e nao chama modelo nenhum. Ele monta,
// por repositorio, um arquivo de material e um manifesto; quem redige o
// paragrafo e um subagente, depois, lendo o material. A divisao existe para o
// orquestrador nunca carregar o material inteiro no proprio contexto.
//
// Metodo, por commit:
//   1. a mensagem diz o que foi feito? (triagem local, de graca)
//   2. so quando NAO diz, busca o diff no GitHub (arquivos alterados, saldo de
//      linhas e, com --com-patch, um trecho). Mensagem boa nao gasta rede.

import fs from 'fs'
import path from 'path'

import { carregar, avisosDeFrescor } from '../lib/dados.js'
import { filtrar, modoDe, hoje, rotulo } from '../lib/periodo.js'
import { porRepo, classificar, autoresNaoMapeados } from '../lib/agregacao.js'
import { enriquecer, tokenDoAmbiente } from '../lib/github.js'
import { INSTRUCOES_RESUMO, MAX_CHARS_MATERIAL } from '../lib/regras.js'
import * as argsLib from '../lib/args.js'

export const precisaDados = true

function nomeSeguro (repo) {
  return repo.replace(/[^A-Za-z0-9._-]/g, '__')
}

function montarMaterial (linha, classificados) {
  const blocos = classificados.map(c => {
    if (c.boa) return c.msg
    if (c.diff) return `[commit ${c.sha}, mensagem generica: "${c.assunto || '(vazia)'}"]\n${c.diff}`
    return '[mensagem generica] ' + (c.msg || c.assunto || '(commit sem mensagem)')
  })

  let corpo = blocos.join('\n\n---\n\n')
  let truncado = false
  if (corpo.length > MAX_CHARS_MATERIAL) {
    corpo = corpo.slice(0, MAX_CHARS_MATERIAL)
    truncado = true
  }

  const material =
    `Repositorio: ${linha.repo}\n` +
    `Commits no periodo: ${linha.commits}\n\n` +
    'Material (mensagens boas verbatim; nas genericas, os arquivos e o diff do commit):\n\n' +
    corpo
  return { material, truncado }
}

export async function executar (args) {
  const flags = args.flags
  const agora = hoje()
  const ano = argsLib.numero(flags, 'ano', agora.ano)
  const mes = argsLib.numero(flags, 'mes', agora.mes)
  const modo = modoDe(flags, 'mes')
  const destino = argsLib.texto(flags, 'out', '.')

  if (mes < 1 || mes > 12) throw new Error(`--mes deve estar entre 1 e 12 (recebi ${mes}).`)

  const { commits, bruto, origem, lastUpdate } = await carregar({
    source: argsLib.texto(flags, 'source'),
    remoto: !!flags.remoto
  })

  const periodo = { ano, mes, modo }
  const avisos = avisosDeFrescor({ lastUpdate, origem, periodo })

  const excluir = new Set(argsLib.lista(flags['excluir-repo']) || [])
  let doPeriodo = filtrar(commits, periodo)
  if (excluir.size) doPeriodo = doPeriodo.filter(c => !excluir.has(c.repo))

  const { linhas, total, autores } = porRepo(doPeriodo)
  if (!linhas.length) throw new Error(`Nenhum commit em ${rotulo(periodo)}.`)

  const naoMapeados = autoresNaoMapeados(autores)
  if (naoMapeados.length) {
    avisos.push(`Autores fora do authorMapping do fetchData.js: ${naoMapeados.join(', ')}.`)
  }

  // Triagem local, antes de qualquer chamada de rede.
  const porLinha = new Map(linhas.map(l => [l.repo, classificar(l)]))
  const genericos = [...porLinha.values()].flat().filter(c => !c.boa)

  const log = m => process.stderr.write(m + '\n')
  log(`Periodo ${rotulo(periodo)}: ${linhas.length} repositorios, ${total} commits, ` +
    `${genericos.length} com mensagem generica.`)

  let diffs = { obtidos: 0, semDiff: genericos.length, desligado: true, semAcesso: [] }
  if (flags['sem-diffs']) {
    log('Busca de diff desligada (--sem-diffs): as genericas entram so com a mensagem.')
  } else if (genericos.length) {
    const token = argsLib.texto(flags, 'gh-token') || tokenDoAmbiente()
    if (!token) avisos.push('Sem GH_PAT nem --gh-token: a API do GitHub permite 60 requisicoes por hora, e repositorio privado responde 404.')
    const privados = new Set(
      Object.entries(bruto.repoPrivate || {}).filter(([, v]) => v === true).map(([k]) => k))
    log(`Buscando o diff de ${genericos.length} commits no GitHub...`)
    diffs = await enriquecer(genericos, {
      token,
      comPatch: !!flags['com-patch'],
      tetoPatch: argsLib.numero(flags, 'teto-patch', 1500),
      pausaMs: argsLib.numero(flags, 'pausa', 300),
      privados,
      log
    })
    log(`Diffs: ${diffs.obtidos} obtidos, ${diffs.semDiff} sem diff (caem na mensagem).`)
    if (diffs.semAcesso.length) {
      avisos.push(
        `Sem acesso aos repositorios privados ${diffs.semAcesso.join(', ')}: os commits ` +
        'genericos deles ficaram so com a mensagem. Um GH_PAT com escopo repo resolve.')
    }
  } else {
    diffs = { obtidos: 0, semDiff: 0, desligado: false, semAcesso: [] }
  }

  // Pasta de trabalho: um material por repositorio, mais o manifesto.
  const carimbo = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const pasta = path.resolve(destino, `material-4.1-${ano}-${String(mes).padStart(2, '0')}_${carimbo}`)
  const pastaMaterial = path.join(pasta, 'material')
  fs.mkdirSync(pastaMaterial, { recursive: true })

  const repos = []
  let chars = 0
  for (const linha of linhas) {
    const classificados = porLinha.get(linha.repo)
    const { material, truncado } = montarMaterial(linha, classificados)
    chars += material.length
    const arquivo = nomeSeguro(linha.repo) + '.md'
    fs.writeFileSync(path.join(pastaMaterial, arquivo), material, 'utf8')
    if (truncado) {
      avisos.push(`${linha.repo}: material truncado em ${MAX_CHARS_MATERIAL} caracteres (repo muito ativo).`)
    }
    repos.push({
      repo: linha.repo,
      commits: linha.commits,
      efetivo: linha.efetivo,
      genericos: classificados.filter(c => !c.boa).length,
      sem_diff: classificados.filter(c => !c.boa && !c.diff).length,
      truncado,
      material: path.join('material', arquivo)
    })
  }

  const manifesto = {
    gerado_em: new Date().toISOString(),
    origem,
    lastUpdate: lastUpdate ? lastUpdate.toISOString() : null,
    periodo: { ano, mes, modo, rotulo: rotulo(periodo) },
    excluidos: [...excluir].sort(),
    total_commits: total,
    total_repos: linhas.length,
    autores_nao_mapeados: naoMapeados,
    diffs: {
      genericos: genericos.length,
      obtidos: diffs.obtidos,
      sem_diff: diffs.semDiff,
      sem_acesso: diffs.semAcesso,
      desligado: !!flags['sem-diffs'],
      com_patch: !!flags['com-patch']
    },
    chars_de_material: chars,
    instrucoes_resumo: INSTRUCOES_RESUMO,
    repos
  }
  const caminhoManifesto = path.join(pasta, 'manifesto.json')
  fs.writeFileSync(caminhoManifesto, JSON.stringify(manifesto, null, 2), 'utf8')

  log('')
  log(`Material em ${pasta}`)
  log(`  manifesto.json  (${linhas.length} repos, ~${chars} caracteres de material)`)
  log('  material/<org>__<repo>.md')
  log('')
  log('PROXIMO PASSO: por repo do manifesto, um subagente le o `material` e devolve SO o')
  log('paragrafo, seguindo `instrucoes_resumo`. A 4.1 fica: Repositorio | Commits | Efetivo | Resumo.')

  // stdout: so o caminho do manifesto, para encadear.
  return { texto: caminhoManifesto, avisos }
}
