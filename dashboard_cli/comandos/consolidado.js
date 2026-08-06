// Path: dashboard_cli/comandos/consolidado.js

// `dash consolidado` e a subsecao 5.1 do RPCMTec (Repositorios trabalhados, a
// antiga 4.1): commits por repositorio no periodo e o efetivo que os fez.
//
// E a mesma conta do botao "Dados Consolidados" da tela, com tres diferencas
// deliberadas, todas a favor de quem monta o relatorio:
//
//  1. o recorte usa explicitamente o fuso de Brasilia, e nao o fuso da maquina
//     de quem clicou; num navegador no Brasil da o mesmo resultado, num CI nao;
//  2. autor que o authorMapping do fetchData.js nao conhece vira AVISO, em vez
//     de entrar calado no relatorio como handle cru do GitHub;
//  3. quem nao e efetivo (o agente) conta o commit e nao entra na coluna Efetivo.
//
// O PADRAO E O MES ISOLADO (decisao do chefe da DGEO, 2026-08-06). A 5.1 reporta
// o que foi trabalhado NAQUELE mes, e o SCA apaga a linha que sai do CSV: mandar
// o acumulado de janeiro faria o documento de julho afirmar commits de marco.
// --cumulativo e --ano-todo continuam disponiveis (a RPCATec usa o ano).

import { carregar, avisosDeFrescor } from '../lib/dados.js'
import { filtrar, modoDe, hoje, rotulo } from '../lib/periodo.js'
import { porRepo, autoresNaoMapeados } from '../lib/agregacao.js'
import * as argsLib from '../lib/args.js'
import * as saida from '../lib/saida.js'

export const precisaDados = true

export async function executar (args) {
  const flags = args.flags
  const agora = hoje()
  const ano = argsLib.numero(flags, 'ano', agora.ano)
  const mes = argsLib.numero(flags, 'mes', agora.mes)
  const modo = modoDe(flags, 'mes')

  if (mes < 1 || mes > 12) throw new Error(`--mes deve estar entre 1 e 12 (recebi ${mes}).`)

  const { commits, origem, lastUpdate } = await carregar({
    source: argsLib.texto(flags, 'source'),
    remoto: !!flags.remoto
  })

  const periodo = { ano, mes, modo }
  const avisos = avisosDeFrescor({ lastUpdate, origem, periodo })

  const doPeriodo = filtrar(commits, periodo)
  const { linhas, total, autores } = porRepo(doPeriodo)

  const naoMapeados = autoresNaoMapeados(autores)
  if (naoMapeados.length) {
    avisos.push(
      `Autores fora do authorMapping do fetchData.js, entram no relatorio como estao: ` +
      `${naoMapeados.join(', ')}. Se forem do efetivo, mapeie o handle para "Posto Nome" ` +
      'em scripts/fetchData.js.'
    )
  }

  const formato = saida.formatoDe(flags, 'tabela')
  const colunas = ['repo', 'commits', 'efetivo']
  const rotulos = ['Repositorio', 'Commits', 'Efetivo']

  if (!linhas.length) {
    return { texto: `Nenhum commit em ${rotulo(periodo)}.`, avisos }
  }

  if (formato === 'json') {
    return {
      texto: JSON.stringify({
        origem,
        lastUpdate: lastUpdate ? lastUpdate.toISOString() : null,
        periodo: { ano, mes, modo, rotulo: rotulo(periodo) },
        total_commits: total,
        total_repos: linhas.length,
        efetivo: autores,
        autores_nao_mapeados: naoMapeados,
        linhas: linhas.map(({ repo, commits, efetivo }) => ({ repo, commits, efetivo }))
      }, null, 2),
      avisos
    }
  }

  if (formato === 'csv') return { texto: saida.csvConsolidado(linhas), avisos }

  const rodape = `\nTotais: ${total} commits, ${linhas.length} repositorios, ${autores.length} militares.`

  if (formato === 'markdown') {
    const L = []
    L.push(`## 5.1 Repositorios trabalhados - ${rotulo(periodo)}`)
    L.push('')
    L.push(saida.markdown(linhas, colunas, ['Repositorio', 'Numero de commits no periodo', 'Efetivo'],
      [null, 'direita', null]))
    L.push('')
    L.push(`Totais: ${total} commits, ${linhas.length} repositorios, ${autores.length} militares no periodo.`)
    L.push('')
    L.push(`Fonte: \`${origem}\`, dados de ${lastUpdate ? lastUpdate.toISOString() : '(sem lastUpdate)'}.`)
    return { texto: L.join('\n'), avisos }
  }

  if (formato === 'tsv') return { texto: saida.tsv(linhas, colunas) + rodape, avisos }

  const cabecalho = `Subsecao 5.1, ${rotulo(periodo)}\n`
  return { texto: cabecalho + saida.tabela(linhas, colunas, rotulos) + rodape, avisos }
}
