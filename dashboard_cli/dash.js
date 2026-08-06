#!/usr/bin/env node
// Path: dashboard_cli/dash.js

// dash - CLI do github_dashboard, para agentes.
//
// Substitui os dois scripts Python que viviam no vault do chefe e refaziam,
// por fora, contas que sao daqui: a tabela da subsecao 5.1 do RPCMTec e o material
// do resumo por repositorio.
//
// Le os MESMOS artefatos que o dashboard web: o scripts/fetchData.js (lista de
// repositorios, mapa de autores, filtros) e o src/data/commits.json que ele
// produz. Nada de contrato copiado: repo novo ou militar novo aparece aqui
// sozinho, sem ninguem editar uma segunda lista.

import * as argsLib from './lib/args.js'

const AJUDA = `dash - CLI do github_dashboard (subsecao 5.1 do RPCMTec)

  dash consolidado                commits por repositorio e efetivo no periodo
  dash material --out DIR         material para o resumo por repositorio

PERIODO   (padrao: o MES isolado, que e o que a 5.1 reporta)
  --ano 2026  --mes 7  --cumulativo (jan ate o mes)  --ano-todo (RPCATec)

SAIDA DO CONSOLIDADO
  (padrao) tabela          --csv como o botao da tela      --json
  --formato tsv|tabela|markdown|csv|json

FONTE
  (padrao) src/data/commits.json do clone   --remoto (a main)   --source ARQ|URL

MATERIAL   (busca no GitHub o diff SO dos commits de mensagem generica)
  --sem-diffs   offline, so as mensagens        --com-patch [--teto-patch 1500]
  --gh-token T  padrao GH_PAT ou GITHUB_TOKEN   --excluir-repo a,b

So leitura. Quem atualiza o commits.json e o GitHub Actions, 3x ao dia.`

const ROTEADOR = {
  consolidado: './comandos/consolidado.js',
  material: './comandos/material.js'
}

async function principal () {
  const args = argsLib.parse(process.argv.slice(2))
  const comando = args._[0]

  if (!comando || args.flags.ajuda || args.flags.help) {
    process.stdout.write(AJUDA + '\n')
    return 0
  }

  const modulo = ROTEADOR[comando]
  if (!modulo) {
    process.stderr.write(
      `Comando desconhecido: "${comando}". Use: ${Object.keys(ROTEADOR).join(', ')}.\n`)
    return 1
  }

  const cmd = await import(modulo)
  const resultado = await cmd.executar(args)

  // Avisos vao para stderr: nao poluem o stdout que pode estar sendo
  // encadeado (--json, ou o caminho do manifesto), mas continuam visiveis.
  for (const aviso of resultado.avisos || []) {
    process.stderr.write('[aviso] ' + aviso + '\n')
  }
  if (resultado.texto) process.stdout.write(resultado.texto + '\n')
  return 0
}

principal()
  .then(codigo => { process.exitCode = codigo })
  .catch(err => {
    process.stderr.write('[erro] ' + err.message + '\n')
    process.exitCode = 1
  })
