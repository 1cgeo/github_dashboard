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

async function fetchCommits() {
    try {
      // Buscar commits dos últimos 36 meses
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 36);
      
      const allCommits = [];
      
      for (const { repository, branch } of repositories) {
        console.log(`Fetching commits for ${repository}...`);
        const [owner, name] = repository.split('/');
  
        // Fazer paginação para garantir que pegamos todos os commits
        let page = 1;
        let hasMoreData = true;
  
        while (hasMoreData) {
          const query = branch
                    ? `https://api.github.com/repos/${owner}/${name}/commits?sha=${branch}&since=${startDate.toISOString()}&page=${page}&per_page=100`
                    : `https://api.github.com/repos/${owner}/${name}/commits?since=${startDate.toISOString()}&page=${page}&per_page=100`;
          
          const response = await fetch(query,
            {
              headers: process.env.GH_PAT ? {
                'Authorization': `token ${process.env.GH_PAT}`
              } : {}
            }
          );
          
          if (response.ok) {
            const commits = await response.json();
            
            if (commits.length === 0) {
              hasMoreData = false;
            } else {
              commits.forEach(commit => {
                allCommits.push({
                  repo: repository,
                  date: commit.commit.author.date,
                  author: normalizeAuthorName(commit.commit.author.name),
                  message: commit.commit.message,
                  sha: commit.sha.substring(0, 7),
                  htmlUrl: commit.html_url,
                  repoUrl: `https://github.com/${repository}`
                });
              });
              
              page++;
            }
          } else {
            console.error(`Error fetching ${repository} (page ${page}): ${response.status} ${response.statusText}`);
            if (response.status === 403) {
              console.error('Rate limit exceeded. Consider using a GH_PAT.');
              console.error('Remaining requests:', response.headers.get('x-ratelimit-remaining'));
              console.error('Rate limit resets at:', new Date(Number(response.headers.get('x-ratelimit-reset')) * 1000));
            }
            hasMoreData = false;
          }
  
          // Pequena pausa entre requisições para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Salvar dados em um arquivo JSON
      const outputPath = './src/data/commits.json';
      
      // Certificar que o diretório existe
      const dir = './src/data';
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
      }
  
      // Adicionar estatísticas gerais
      const stats = {
        totalCommits: allCommits.length,
        commitsPerYear: {
          2024: allCommits.filter(c => new Date(c.date).getFullYear() === 2024).length,
          2025: allCommits.filter(c => new Date(c.date).getFullYear() === 2025).length
        },
        activeReposPerYear: {
          2024: new Set(allCommits.filter(c => new Date(c.date).getFullYear() === 2024).map(c => c.repo)).size,
          2025: new Set(allCommits.filter(c => new Date(c.date).getFullYear() === 2025).map(c => c.repo)).size
        },
        commitsByRepo: Object.fromEntries(
          repositories.map(r => [
            r.repository,
            allCommits.filter(c => c.repo === r.repository).length
          ])
        )
      };
  
      fs.writeFileSync(
        outputPath,
        JSON.stringify({
          lastUpdate: new Date().toISOString(),
          stats,
          commits: allCommits
        }, null, 2)
      );
  
      console.log('\nFetch completed successfully!');
      console.log(`Total commits fetched: ${allCommits.length}`);
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
  
  // Verificar e usar token do GitHub se disponível
  if (process.env.GH_PAT) {
    console.log('Using provided GitHub token');
  } else {
    console.log('No GitHub token found. Requests will be rate-limited.');
    console.log('To increase rate limits, set the GH_PAT environment variable.');
  }
  
  fetchCommits();