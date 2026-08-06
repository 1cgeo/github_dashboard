import fs from 'fs';
import { pathToFileURL } from 'url';

// O script que o GitHub Actions roda 3x ao dia para atualizar o
// src/data/commits.json. O contrato (repositorios, mapa de autores, filtros)
// vive no ./contrato.js e sai reexportado logo abaixo, para o dashboard_cli/ e
// os testes seguirem importando daqui. O fetch so dispara quando o arquivo e
// executado DIRETAMENTE (ver o rodape), nunca quando alguem o importa.
//
// NAO importe este arquivo do frontend (src/): o 'fs' e o 'url' nao existem no
// browser e o build do Vite quebra. Do frontend, importe o ./contrato.js.

import {
  repositories,
  authorMapping,
  AUTORES_NAO_EFETIVO,
  ehEfetivo,
  normalizeAuthorName,
  shouldIncludeCommit,
  getRepoKey,
} from './contrato.js';

// Reexporta o contrato: o dashboard_cli/ e os testes importam daqui desde antes
// de ele sair para o contrato.js, e o frontend importa direto do contrato.js.
export {
  repositories,
  authorMapping,
  AUTORES_NAO_EFETIVO,
  ehEfetivo,
  normalizeAuthorName,
  shouldIncludeCommit,
  getRepoKey,
};

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
        repoPrivate: data.repoPrivate || {},
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
    repoPrivate: {},
    commits: []
  };
}

// Consulta a API do GitHub para descobrir quais repositórios são privados.
// Mantém o valor anterior quando não consegue uma resposta definitiva, para
// não perder a informação caso uma consulta falhe (ex.: rate limit).
async function fetchRepoVisibility(existingRepoPrivate = {}) {
  const repoPrivate = { ...existingRepoPrivate };
  const uniqueRepos = [...new Set(repositories.map(r => r.repository))];

  for (const repository of uniqueRepos) {
    try {
      const [owner, name] = repository.split('/');
      const response = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
        headers: process.env.GH_PAT ? {
          'Authorization': `token ${process.env.GH_PAT}`
        } : {}
      });

      if (response.ok) {
        const repo = await response.json();
        repoPrivate[repository] = repo.private === true;
      } else if (response.status === 404) {
        // 404: o repo existe na lista, então é privado e a requisição não tem acesso.
        // Se já soubermos a visibilidade, mantém; senão assume privado.
        if (!(repository in repoPrivate)) {
          repoPrivate[repository] = true;
        }
        console.log(`Visibilidade de ${repository}: 404 (sem acesso) -> privado=${repoPrivate[repository]}`);
      } else {
        console.error(`Erro ao consultar visibilidade de ${repository}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Erro ao consultar visibilidade de ${repository}:`, error.message);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return repoPrivate;
}

async function fetchCommits() {
  try {
    // Carregar dados existentes
    const existingData = await getExistingData();
    console.log(`Global last update: ${existingData.lastUpdate.toISOString()}`);
    console.log(`Existing commits: ${existingData.commits.length}`);

    // Descobre quais repositórios são privados (para o ícone de cadeado no dashboard)
    console.log('\nConsultando visibilidade (público/privado) dos repositórios...');
    const repoPrivate = await fetchRepoVisibility(existingData.repoPrivate);
    console.log(`Repositórios privados: ${Object.values(repoPrivate).filter(Boolean).length}`);

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
      repoPrivate,
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

// So busca da rede quando alguem roda `node scripts/fetchData.js`. Importar o
// arquivo (o que o dashboard_cli faz para ler o contrato) nao dispara nada.
const executadoDireto = process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (executadoDireto) {
  // Verificar e usar token do GitHub
  if (process.env.GH_PAT) {
    console.log('Using provided GitHub token');
  } else {
    console.log('No GitHub token found. Requests will be rate-limited.');
    console.log('To increase rate limits, set the GH_PAT environment variable.');
  }

  fetchCommits();
}