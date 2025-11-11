import fs from 'fs';

const repositories = [
  { repository: '1cgeo/ebgeo_web', branch: '' },
  { repository: '1cgeo/ebgeo_web', branch: 'egbeo1.1' },
  { repository: '1cgeo/servico_nomes_geograficos', branch: '' },
  { repository: '1cgeo/ebgeo_web_2', branch: '' },
  { repository: '1cgeo/ebgeo_web_2', branch: 'refactor' },
  { repository: '1cgeo/ebgeo_web_2_backend', branch: '' },
  { repository: '1cgeo/doc_ortoimagem', branch: '' },
  { repository: '1cgeo/doc_topografica', branch: '' },
  { repository: '1cgeo/doc_dgeo', branch: '' },
  { repository: '1cgeo/ferramentas_mgcp', branch: '' },
  { repository: '1cgeo/mgcp', branch: '' },
  { repository: '1cgeo/doc_mgcp', branch: '' },
  { repository: '1cgeo/doc_capacitacao', branch: '' },
  { repository: '1cgeo/ebgeo_web_2_admin', branch: '' },
  { repository: 'dsgoficial/modelagens', branch: '' },
  { repository: 'dsgoficial/configuracoes_producao', branch: '' },
  { repository: 'dsgoficial/ferramentas_edicao', branch: '' },
  { repository: 'dsgoficial/DsgTools', branch: 'dev' },
  { repository: 'dsgoficial/sap', branch: '' },
  { repository: 'dsgoficial/SAP_Gerente', branch: '' },
  { repository: 'dsgoficial/SAP_Operador', branch: '' },
  { repository: 'dsgoficial/EBGeo', branch: '' },
  { repository: '1cgeo/prototipo_busca_llm', branch: '' },
  { repository: '1cgeo/prototipo_colaboracao_tempo_real', branch: '' },
  { repository: '1cgeo/controle_acervo', branch: '' },
  { repository: '1cgeo/ferramentas_acervo', branch: '' },
  { repository: 'dsgoficial/pto_controle', branch: '' },
  { repository: 'dsgoficial/servico_autenticacao', branch: '' },
  { repository: 'dsgoficial/servico_edicao', branch: '' },
  { repository: '1cgeo/news_feed', branch: '' },
  { repository: '1cgeo/ferramentas_mapoteca', branch: '' },
  { repository: '1cgeo/projetos', branch: '' },
  { repository: '1cgeo/produtos', branch: '' },
  { repository: '1cgeo/prototipo_roteamento_restricao', branch: '' },
  { repository: '1cgeo/prototipo_location_ar', branch: '' },
  { repository: 'dsgoficial/pytorch_segmentation_models_trainer', branch: '' },
];

const authorMapping = {
  'Raul Magno EB': '1º Ten Raul Magno',
  'raulmagno-eb': '1º Ten Raul Magno',
  'Philipe Borba': 'Cap Borba',
  'phborba': 'Cap Borba',
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
};

function normalizeAuthorName(author) {
  return authorMapping[author] || author;
}

function shouldIncludeCommit(commit) {
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

function getRepoKey(repository, branch) {
  return branch ? `${repository}@${branch}` : repository;
}

async function getExistingData() {
  const outputPath = './src/data/commits.json';
  try {
    if (fs.existsSync(outputPath)) {
      const data = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      
      // Migração: se não tiver repoLastUpdate, cria baseado no lastUpdate global
      const repoLastUpdate = data.repoLastUpdate || {};
      
      // Se estava no formato antigo, inicializa todos os repos com o lastUpdate global
      if (!data.repoLastUpdate) {
        const globalLastUpdate = data.lastUpdate || '2024-01-01T00:00:00Z';
        repositories.forEach(({ repository, branch }) => {
          const key = getRepoKey(repository, branch);
          repoLastUpdate[key] = globalLastUpdate;
        });
      }
      
      return {
        lastUpdate: new Date(data.lastUpdate),
        repoLastUpdate: Object.fromEntries(
          Object.entries(repoLastUpdate).map(([key, date]) => [key, new Date(date)])
        ),
        commits: data.commits.map(commit => ({
          ...commit,
          date: new Date(commit.date)
        }))
      };
    }
  } catch (error) {
    console.error('Error reading existing data:', error);
  }
  
  // Se não houver arquivo ou ocorrer erro, retorna dados vazios
  const defaultDate = new Date('2024-01-01T00:00:00Z');
  const repoLastUpdate = {};
  
  // Inicializa todos os repositórios com a data padrão
  repositories.forEach(({ repository, branch }) => {
    const key = getRepoKey(repository, branch);
    repoLastUpdate[key] = defaultDate;
  });
  
  return {
    lastUpdate: defaultDate,
    repoLastUpdate,
    commits: []
  };
}

async function fetchCommits() {
  try {
    // Carregar dados existentes
    const existingData = await getExistingData();
    console.log(`Global last update: ${existingData.lastUpdate.toISOString()}`);
    console.log(`Existing commits: ${existingData.commits.length}`);

    const newCommits = [];
    const updatedRepoLastUpdate = { ...existingData.repoLastUpdate };

    for (const { repository, branch } of repositories) {
      try {
        const repoKey = getRepoKey(repository, branch);
        
        // Usa a data específica deste repositório, ou data padrão se for novo
        const repoStartDate = existingData.repoLastUpdate[repoKey] || new Date('2024-01-01T00:00:00Z');
        
        console.log(`Fetching commits for ${repoKey} since ${repoStartDate.toISOString()}...`);
        const [owner, name] = repository.split('/');

        let page = 1;
        let hasMoreData = true;
        let latestCommitDate = repoStartDate;

        while (hasMoreData) {
          const query = branch
            ? `https://api.github.com/repos/${owner}/${name}/commits?sha=${branch}&since=${repoStartDate.toISOString()}&page=${page}&per_page=100`
            : `https://api.github.com/repos/${owner}/${name}/commits?since=${repoStartDate.toISOString()}&page=${page}&per_page=100`;
          
          const response = await fetch(query, {
            headers: process.env.GH_PAT ? {
              'Authorization': `token ${process.env.GH_PAT}`
            } : {}
          });
          
          if (response.status === 404) {
            console.log(`Repository ${repository} not found or no commits in this period. Skipping...`);
            hasMoreData = false;
          } else if (response.status === 403) {
            console.error('Rate limit exceeded. Consider using a GH_PAT.');
            console.error('Remaining requests:', response.headers.get('x-ratelimit-remaining'));
            console.error('Rate limit resets at:', new Date(Number(response.headers.get('x-ratelimit-reset')) * 1000));
            throw new Error('Rate limit exceeded');
          } else if (response.ok) {
            const commits = await response.json();
            
            if (commits.length === 0) {
              hasMoreData = false;
            } else {
              commits
                .filter(shouldIncludeCommit)
                .forEach(commit => {
                  const commitDate = new Date(commit.commit.author.date);
                  
                  // Atualiza a data mais recente deste repo
                  if (commitDate > latestCommitDate) {
                    latestCommitDate = commitDate;
                  }
                  
                  // Só adiciona se for mais recente que a última atualização deste repo
                  if (commitDate > repoStartDate) {
                    newCommits.push({
                      repo: repository,
                      date: commitDate,
                      author: normalizeAuthorName(commit.commit.author.name),
                      message: commit.commit.message,
                      sha: commit.sha.substring(0, 7),
                      htmlUrl: commit.html_url,
                      repoUrl: `https://github.com/${repository}`
                    });
                  }
                });
              
              page++;
            }
          } else {
            console.error(`Error fetching ${repository} (page ${page}): ${response.status} ${response.statusText}`);
            hasMoreData = false;
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Atualiza o lastUpdate deste repositório específico
        updatedRepoLastUpdate[repoKey] = latestCommitDate;
        
      } catch (error) {
        console.error(`Error processing repository ${repository}:`, error.message);
      }
    }

    // Combinar commits existentes com novos commits
    const allCommits = [
      ...existingData.commits,
      ...newCommits
    ].sort((a, b) => b.date - a.date);

    // Remover possíveis duplicatas baseado no SHA
    const uniqueCommits = Array.from(
      new Map(allCommits.map(commit => [commit.sha, commit])).values()
    );

    // Calcular estatísticas
    const stats = {
      totalCommits: uniqueCommits.length,
      commitsPerYear: {
        2024: uniqueCommits.filter(c => c.date.getFullYear() === 2024).length,
        2025: uniqueCommits.filter(c => c.date.getFullYear() === 2025).length
      },
      activeReposPerYear: {
        2024: new Set(uniqueCommits.filter(c => c.date.getFullYear() === 2024).map(c => c.repo)).size,
        2025: new Set(uniqueCommits.filter(c => c.date.getFullYear() === 2025).map(c => c.repo)).size
      },
      commitsByRepo: Object.fromEntries(
        repositories.map(r => [
          r.repository,
          uniqueCommits.filter(c => c.repo === r.repository).length
        ])
      )
    };

    // Salvar dados atualizados
    const outputPath = './src/data/commits.json';
    const dir = './src/data';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const dataToSave = {
      lastUpdate: new Date().toISOString(),
      repoLastUpdate: Object.fromEntries(
        Object.entries(updatedRepoLastUpdate).map(([key, date]) => [
          key,
          date.toISOString()
        ])
      ),
      stats,
      commits: uniqueCommits.map(commit => ({
        ...commit,
        date: commit.date.toISOString()
      }))
    };

    fs.writeFileSync(outputPath, JSON.stringify(dataToSave, null, 2));

    console.log('\nFetch completed successfully!');
    console.log(`New commits fetched: ${newCommits.length}`);
    console.log(`Total unique commits: ${uniqueCommits.length}`);
    console.log('\nCommits per repository:');
    for (const [repository, count] of Object.entries(stats.commitsByRepo)) {
      console.log(`  ${repository}: ${count}`);
    }
    console.log(`\nData saved to ${outputPath}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Verificar e usar token do GitHub
if (process.env.GH_PAT) {
  console.log('Using provided GitHub token');
} else {
  console.log('No GitHub token found. Requests will be rate-limited.');
  console.log('To increase rate limits, set the GH_PAT environment variable.');
}

fetchCommits();