// Path: dashboard_cli/lib/regras.js

// Prosa curada: so o que a introspecao dos dados NAO alcanca.
//
// Tudo que se pode derivar do commits.json ou do scripts/fetchData.js (quais
// repos, quais autores, quais campos) e lido em tempo de execucao e nao aparece
// aqui. O que sobra sao duas coisas de julgamento, que nenhum schema tem: o
// vocabulario que caracteriza uma mensagem de commit vazia de conteudo, e as
// instrucoes de quem vai redigir o resumo.

/**
 * Palavras que, sozinhas, nao dizem o que o commit fez (PT e EN). Uma mensagem
 * feita so delas manda o CLI buscar o diff, que e o que de fato informa.
 */
export const PALAVRAS_GENERICAS = new Set([
  'wip', 'fix', 'fixes', 'fixed', 'bug', 'bugs', 'bugfix', 'hotfix', 'ajuste',
  'ajustes', 'ajustando', 'correcao', 'correcoes', 'corrigindo', 'corrige',
  'update', 'updates', 'updated', 'atualizacao', 'atualiza', 'atualizando',
  'tweak', 'tweaks', 'minor', 'misc', 'cleanup', 'clean', 'limpeza', 'refactor',
  'refatoracao', 'refatorando', 'test', 'tests', 'teste', 'testes', 'bump',
  'chore', 'revert', 'commit', 'change', 'changes', 'mudanca', 'mudancas',
  'alteracao', 'alteracoes', 'melhoria', 'melhorias', 'ok', 'done', 'final',
  'finais', 'temp', 'tmp', 'stuff', 'things', 'coisas', 'v', 'sap'
])

/**
 * Instrucoes para quem redige o resumo por repositorio (um subagente, na pratica).
 * Ficam aqui, e vao gravadas no manifesto, para que o CLI e quem o consome usem
 * a MESMA redacao: se ela morasse na skill, cada cliente teria a sua.
 */
export const INSTRUCOES_RESUMO =
  'Voce e um subagente que resume, em portugues do Brasil, o que foi feito num ' +
  'repositorio de software num periodo. LEIA o arquivo de material indicado e ' +
  'escreva UM paragrafo CURTO (2 a 4 frases), o principal do principal ' +
  '(funcionalidades, correcoes, refatoracoes, dados e modelagem relevantes), que ' +
  'vai numa CELULA DE TABELA de um relatorio formal (RPCMTec). Agrupe temas em ' +
  'vez de listar commit a commit. Nao use bullets, titulo, nem preambulo ' +
  '("Neste mes...", "O repositorio..."): comece direto pelo trabalho. O material ' +
  'traz as mensagens de commit boas verbatim; onde a mensagem era generica, traz ' +
  'no lugar os ARQUIVOS ALTERADOS e o diff daquele commit (use para inferir o ' +
  'que foi feito). Nao invente: baseie-se so no material. Ignore trailers ' +
  'Co-Authored-By e ruido de merge. Sem em-dash (use virgula ou parenteses). ' +
  'Devolva SO o paragrafo, sem comentario, sem aspas, sem o nome do repo.'

/** Teto de material por repositorio; alem disso o CLI trunca e AVISA. */
export const MAX_CHARS_MATERIAL = 60000
