// O CONTRATO do dashboard: a lista de repositorios acompanhados, o mapa de
// autores e as regras de quem entra na conta e na coluna Efetivo.
//
// Mora separado do fetchData.js porque tem TRES consumidores em dois mundos: o
// fetchData.js e o dashboard_cli/ rodam no Node, e o frontend (build do Vite)
// roda no browser. O fetchData.js importa 'fs' e 'url', que o browser nao tem,
// entao importa-lo do frontend quebra o build. Aqui nao entra import de Node.
// Contrato copiado apodrece em silencio: repo novo ou militar novo passariam a
// existir num lugar e nao no outro. Por isso todo mundo importa daqui.

export const repositories = [
  { repository: '1cgeo/ebgeo_web', branch: '' },
  { repository: '1cgeo/ebgeo_web', branch: 'novo_360' },
  { repository: '1cgeo/ebgeo_web', branch: 'integracao_backend' },
  { repository: '1cgeo/servico_nomes_geograficos', branch: '' },
  { repository: '1cgeo/doc_ortoimagem', branch: '' },
  { repository: '1cgeo/doc_topografica', branch: '' },
  { repository: '1cgeo/doc_dgeo', branch: '' },
  { repository: '1cgeo/ferramentas_mgcp', branch: '' },
  { repository: '1cgeo/ferramentas_mgcp', branch: 'qgis4' },
  { repository: '1cgeo/mgcp', branch: '' },
  { repository: '1cgeo/doc_mgcp', branch: '' },
  { repository: '1cgeo/doc_capacitacao', branch: '' },
  { repository: 'dsgoficial/modelagens', branch: '' },
  { repository: 'dsgoficial/configuracoes_producao', branch: '' },
  { repository: 'dsgoficial/ferramentas_edicao', branch: '' },
  { repository: 'dsgoficial/ferramentas_edicao', branch: 'qgis4' },
  { repository: 'dsgoficial/DsgTools', branch: 'dev' },
  { repository: 'dsgoficial/sap', branch: '' },
  { repository: 'dsgoficial/SAP_Gerente', branch: '' },
  { repository: 'dsgoficial/SAP_Gerente', branch: 'qgis4' },
  { repository: 'dsgoficial/SAP_Operador', branch: '' },
  { repository: 'dsgoficial/SAP_Operador', branch: 'qgis4' },
  { repository: 'dsgoficial/EBGeo_Desktop', branch: '' },
  { repository: 'dsgoficial/EBGeo_Desktop', branch: 'qgis4' },
  { repository: '1cgeo/prototipo_busca_llm', branch: '' },
  { repository: '1cgeo/prototipo_colaboracao_tempo_real', branch: '' },
  { repository: '1cgeo/controle_acervo', branch: '' },
  { repository: 'dsgoficial/pto_controle', branch: '' },
  { repository: 'dsgoficial/pto_controle', branch: 'qgis4' },
  { repository: 'dsgoficial/servico_autenticacao', branch: '' },
  { repository: 'dsgoficial/servico_edicao', branch: '' },
  { repository: '1cgeo/news_feed', branch: '' },
  { repository: '1cgeo/ferramentas_mapoteca', branch: '' },
  { repository: '1cgeo/projetos', branch: '' },
  { repository: '1cgeo/produtos', branch: '' },
  { repository: '1cgeo/prototipo_roteamento_restricao', branch: '' },
  { repository: '1cgeo/prototipo_location_ar', branch: '' },
  { repository: 'dsgoficial/pytorch_segmentation_models_trainer', branch: '' },
  { repository: '1cgeo/geoswarm', branch: '' },
  { repository: '1cgeo/tileclass', branch: '' },
  { repository: '1cgeo/controle_orcamentario', branch: '' },
  { repository: '1cgeo/ebgeo_360', branch: '' },
  { repository: '1cgeo/ebgeo_backend', branch: '' },
  { repository: '1cgeo/ferramentas_ebgeo', branch: '' },
  { repository: '1cgeo/0Bug_Report', branch: '' },
  { repository: '1cgeo/0Bug_Report', branch: 'qgis4' },
  { repository: '1cgeo/server-healthcheck', branch: '' },
  { repository: '1cgeo/github_dashboard', branch: '' },
  { repository: '1cgeo/pit_ia_2025', branch: '' },
  { repository: '1cgeo/autolabeller', branch: '' },
  { repository: '1cgeo/chefe_dgeo', branch: '' },
  { repository: '1cgeo/fotos_aereas', branch: '' },
  { repository: '1cgeo/ia_vegetacao', branch: '' },
  { repository: 'dsgoficial/curso_dsgtools', branch: '' },
];

export const authorMapping = {
  'Raul Magno EB': '1º Ten Raul Magno',
  'raulmagno-eb': '1º Ten Raul Magno',
  'Philipe Borba': 'Maj Borba',
  'phborba': 'Maj Borba',
  'Felipe Diniz': 'Maj Diniz',
  'dinizime': 'Maj Diniz',
  'Marcel Fernandes': '1º Ten Marcel',
  'MarcelFernandesCGEO': '1º Ten Marcel',
  'Raul Magno': '1º Ten Raul Magno',
  'Jaime Guilherme': '1º Ten Jaime',
  'bragaalexandre': '3º Sgt Alexandre Braga',
  'Braga Alexandre': '3º Sgt Alexandre Braga',
  'pedro-mar': '1º Ten Pedro Martins',
  'Pedro Martins': '1º Ten Pedro Martins',
  'marcelgfernandes@gmail.com': '1º Ten Marcel',
  'Ten Viana': '1º Ten Viana',
  'Viana': '1º Ten Viana',
  'raulmagno': '1º Ten Raul Magno',
  'Matheus Silva': '1º Ten Alves Silva',
  'matheusalsilva98': '1º Ten Alves Silva',
  'Matheus': '1º Ten Alves Silva',
  'Diogo Oliveira': 'Maj Diogo Oliveira',
  'diogooliveira-dsg': 'Maj Diogo Oliveira',
  'Ronaldo': 'Cap Ronaldo',
  'Ronaldo Martins': 'Cap Ronaldo',
  'santos-amaral': 'Cb Amaral',
  'Godinho365': "3º Sgt Godinho",
  'Godinho': "3º Sgt Godinho",
  'Luiz Guilherme Almeida Nogueira': "1º Ten Luiz Guilherme",
  'jossanCosta': "2º Sgt Jossan",
  'GustavoPereira75': "3º Sgt Gustavo Pereira",
  'e-tadeu': "Cap Tadeu",
  'J Estevez': "2º Sgt Alvarez",
  'JeanAlvarez': "2º Sgt Alvarez",
  'Matheus Campos': "1º Ten Campos",
  'Thiago Arruda': "1º Sgt Arruda",
  'IsaacuchoaIME': "1º Ten Isaac",
  'JaimeGuilherme': "1º Ten Jaime",
  'Alex Melo': "3º Sgt Melo",
  'luizg6': "1º Ten Luiz Guilherme",
  'alegranzi': "2º Sgt Alegranzi",
  'paulohenriquerodriguesdossantos': "1º Sgt Paulo",
  'willmedina87': "2º Sgt Medina",
  'Erodor94': "2º Sgt Castro",
  'Antônio Ignacio': "Alu Ignacio",
  'kretzer': "Alu Kretzer",
  'venturaluisbr': "1º Ten Ventura",
  'Luis Ventura': "1º Ten Ventura",
};

// Quem committa mas NAO e efetivo da Divisao.
//
// O commit continua contando: o trabalho existe e o repositorio foi trabalhado.
// O que muda e a coluna Efetivo da subsecao 5.1 do RPCMTec, que lista os
// MILITARES empregados no mes. Um agente nao ocupa vaga de efetivo, e quem le o
// relatorio assinado leria "Claude" como pessoa.
//
// Diferente de shouldIncludeCommit (dependabot, github-actions): la o commit
// inteiro e ruido e sai da conta. Aqui o commit fica e so o nome sai.
export const AUTORES_NAO_EFETIVO = new Set(['Claude']);

/** O autor entra na coluna Efetivo? Aceita o nome cru ou o ja normalizado. */
export function ehEfetivo(author) {
  return !AUTORES_NAO_EFETIVO.has(normalizeAuthorName(author));
}

export function normalizeAuthorName(author) {
  return authorMapping[author] || author;
}

export function shouldIncludeCommit(commit) {
  if (commit.commit.author.name === 'dependabot[bot]') {
    return false;
  }

  if (commit.commit.author.name === 'github-actions[bot]') {
    return false;
  }
  
  if (commit.commit.message.startsWith("Merge branch 'master'")) {
    return false;
  }

  return true;
}

export function getRepoKey(repository, branch) {
  return branch ? `${repository}@${branch}` : repository;
}
