// Path: utils\dateUtils.js
/**
 * Converte uma data UTC para o fuso horário de Brasília (UTC-3)
 * @param {Date} date - Data UTC
 * @returns {Date} Data no fuso horário de Brasília
 */
export function convertToBrasiliaTimezone(date) {
  return new Date(date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
}

/**
 * Obtém a data no início do dia no fuso horário de Brasília
 * @param {Date} date - Data UTC
 * @returns {Date} Data no início do dia no fuso horário de Brasília
 */
export function getBrasiliaStartOfDay(date) {
  const brasiliaDate = convertToBrasiliaTimezone(date);
  brasiliaDate.setHours(0, 0, 0, 0);
  return brasiliaDate;
}

/**
 * Dia civil de Brasília em que um instante cai, no formato YYYY-MM-DD.
 *
 * É a régua ÚNICA de "em que dia esse commit conta": o gráfico diário e o
 * dashboard_cli (que monta a Seção 4.1 do RPCMTec) chamam esta função, para não
 * existirem duas respostas para a mesma pergunta.
 *
 * Formata direto do instante UTC pedindo o fuso a America/Sao_Paulo. A versão
 * anterior convertia para Brasília com convertToBrasiliaTimezone e só então
 * formatava pedindo o fuso de novo: o deslocamento era aplicado duas vezes, o
 * que só passava despercebido porque, num navegador no Brasil, a primeira
 * conversão é a identidade. Fora daí (CI, servidor ou CLI em UTC) um commit das
 * 03:30 UTC caía no dia anterior.
 *
 * @param {Date} date - instante do commit
 * @returns {string} data no formato YYYY-MM-DD, no fuso de Brasília
 */
export function getBrasiliaDayKey(date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

/**
 * Agrupa commits por data no fuso horário de Brasília
 * @param {Array} commits - Array de commits
 * @returns {Object} Commits agrupados por data (YYYY-MM-DD)
 */
export function groupCommitsByBrasiliaDate(commits) {
  return commits.reduce((acc, commit) => {
    const dateKey = getBrasiliaDayKey(commit.date);

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(commit);
    return acc;
  }, {});
}

/**
 * Gera um array com as últimas N datas no fuso horário de Brasília
 * @param {number} days - Número de dias
 * @returns {Array} Array com objetos de data
 */
export function getLastNDaysInBrasilia(days) {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Usar toLocaleDateString garante a data correta em Brasília
    const isoDate = date.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }); // YYYY-MM-DD
    const displayDate = date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const fullDate = date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo'
    });
    
    return {
      isoDate,
      displayDate,
      fullDate
    };
  }).reverse();
}