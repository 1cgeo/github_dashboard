import fs from 'fs';

const repositories = [
  { repository: '1cgeo/ebgeo_web', branch: '' },
  { repository: '1cgeo/servico_nomes_geograficos', branch: '' },
  { repository: '1cgeo/ebgeo_web_2', branch: '' },
  { repository: '1cgeo/ebgeo_web_2_backend', branch: '' },
  { repository: '1cgeo/doc_ortoimagem', branch: '' },
  { repository: '1cgeo/doc_topografica', branch: '' },
  { repository: '1cgeo/doc_dgeo', branch: '' },
  { repository: '1cgeo/ferramentas_mgcp', branch: '' },
  { repository: '1cgeo/mgcp', branch: '' },
  { repository: '1cgeo/doc_mgcp', branch: '' },
  { repository: '1cgeo/ebgeo_web_2_admin', branch: '' },
  { repository: 'dsgoficial/modelagens', branch: '' },
  { repository: 'dsgoficial/configuracoes_producao', branch: '' },
  { repository: 'dsgoficial/ferramentas_edicao', branch: '' },
  { repository: 'dsgoficial/DsgTools', branch: 'dev' },
  { repository: 'dsgoficial/sap', branch: '' },
  { repository: 'dsgoficial/SAP_Gerente', branch: '' },
  { repository: 'dsgoficial/SAP_Operador', branch: '' },
  { repository: 'dsgoficial/EBGeo', branch: '' }
];

const authorMapping = {
  'Raul Magno EB': 'raulmagno-eb',
  'Philipe Borba': 'phborba',
  'Felipe Diniz': 'dinizime',
  'Marcel Fernandes': 'MarcelFernandesCGEO',
  'Raul Magno': 'raulmagno-eb',
  'Jaime Guilherme': 'JaimeGuilherme',
  'bragaalexandre': 'Braga Alexandre',
  'pedro-mar': 'Pedro Martins',
  'marcelgfernandes@gmail.com': 'MarcelFernandesCGEO',
  'Ten Viana': 'Viana',
  'raulmagno': 'raulmagno-eb',
  'Matheus Silva': 'matheusalsilva98',
  'Diogo Oliveira': 'diogooliveira-dsg',
  'Ronaldo': 'Ronaldo Martins'
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

async function getExistingData() {
  const outputPath = './src/data/commits.json';
  try {
    if (fs.existsSync(outputPath)) {
      const data = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      return {
        lastUpdate: new Date(data.lastUpdate),
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
  return {
    lastUpdate: new Date('2022-01-01T00:00:00Z'), // Busca commits desde 01/01/2022
    commits: []
  };
}

async function fetchCommits() {
  try {
    // Carregar dados existentes
    const existingData = await getExistingData();
    console.log(`Last update: ${existingData.lastUpdate.toISOString()}`);
    console.log(`Existing commits: ${existingData.commits.length}`);

    const startDate = existingData.lastUpdate;
    const newCommits = [];

    for (const { repository, branch } of repositories) {
      try {
        console.log(`Fetching commits for ${repository} since ${startDate.toISOString()}...`);
        const [owner, name] = repository.split('/');

      let page = 1;
      let hasMoreData = true;

      while (hasMoreData) {
        const query = branch
          ? `https://api.github.com/repos/${owner}/${name}/commits?sha=${branch}&since=${startDate.toISOString()}&page=${page}&per_page=100`
          : `https://api.github.com/repos/${owner}/${name}/commits?since=${startDate.toISOString()}&page=${page}&per_page=100`;
        
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
          throw new Error('Rate limit exceeded'); // Este erro é grave o suficiente para parar tudo
        } else if (response.ok) {
          const commits = await response.json();
          
          if (commits.length === 0) {
            hasMoreData = false;
          } else {
            commits
              .filter(shouldIncludeCommit)
              .forEach(commit => {
                const commitDate = new Date(commit.commit.author.date);
                // Só adiciona se for mais recente que a última atualização
                if (commitDate > existingData.lastUpdate) {
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
          // Para outros erros HTTP, logamos mas continuamos com o próximo repositório
          hasMoreData = false;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      } catch (error) {
        console.error(`Error processing repository ${repository}:`, error.message);
        // Continue com o próximo repositório
      }
    }

    // Combinar commits existentes com novos commits
    const allCommits = [
      ...existingData.commits,
      ...newCommits
    ].sort((a, b) => b.date - a.date); // Ordena por data, mais recente primeiro

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
      stats,
      commits: uniqueCommits.map(commit => ({
        ...commit,
        date: commit.date.toISOString() // Converter Date para string para JSON
      }))
    };

    fs.writeFileSync(outputPath, JSON.stringify(dataToSave, null, 2));

    console.log('\nFetch completed successfully!');
    console.log(`New commits fetched: ${newCommits.length}`);
    console.log(`Total unique commits: ${uniqueCommits.length}`);
    console.log('Commits per repository:');
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