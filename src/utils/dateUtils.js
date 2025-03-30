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
 * Agrupa commits por data no fuso horário de Brasília
 * @param {Array} commits - Array de commits
 * @returns {Object} Commits agrupados por data (YYYY-MM-DD)
 */
export function groupCommitsByBrasiliaDate(commits) {
  return commits.reduce((acc, commit) => {
    // Use toLocaleDateString para garantir a data correta em Brasília
    const dateKey = convertToBrasiliaTimezone(commit.date)
      .toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }); // formato YYYY-MM-DD
    
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