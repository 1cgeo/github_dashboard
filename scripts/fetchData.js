import fs from 'fs';

const repositories = [
    '1cgeo/ebgeo_web',
    '1cgeo/servico_nomes_geograficos',
    '1cgeo/ebgeo_web_2',
    '1cgeo/ebgeo_web_2_backend',
    '1cgeo/doc_ortoimagem',
    '1cgeo/doc_topografica',
    '1cgeo/doc_dgeo',
    '1cgeo/ferramentas_mgcp',
    '1cgeo/mgcp',
    '1cgeo/doc_mgcp',
    'dsgoficial/modelagens',
    'dsgoficial/configuracoes_producao',
    'dsgoficial/modelagens',
    'dsgoficial/ferramentas_edicao',
    'dsgoficial/DsgTools',
    'dsgoficial/sap',
    'dsgoficial/SAP_Gerente',
    'dsgoficial/SAP_Operador',
    'dsgoficial/EBGeo'
];

async function fetchCommits() {
    try {
      // Buscar commits dos últimos 24 meses
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 24);
      
      const allCommits = [];
      
      for (const repo of repositories) {
        console.log(`Fetching commits for ${repo}...`);
        const [owner, name] = repo.split('/');
  
        // Fazer paginação para garantir que pegamos todos os commits
        let page = 1;
        let hasMoreData = true;
  
        while (hasMoreData) {
          const response = await fetch(
            `https://api.github.com/repos/${owner}/${name}/commits?since=${startDate.toISOString()}&page=${page}&per_page=100`,
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
                  repo,
                  date: commit.commit.author.date,
                  author: commit.commit.author.name,
                  message: commit.commit.message,
                  sha: commit.sha.substring(0, 7),
                  htmlUrl: commit.html_url,
                  repoUrl: `https://github.com/${repo}`
                });
              });
              
              page++;
            }
          } else {
            console.error(`Error fetching ${repo} (page ${page}): ${response.status} ${response.statusText}`);
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
          repositories.map(repo => [
            repo,
            allCommits.filter(c => c.repo === repo).length
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
      for (const [repo, count] of Object.entries(stats.commitsByRepo)) {
        console.log(`  ${repo}: ${count}`);
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