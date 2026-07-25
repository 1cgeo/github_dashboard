// Path: dashboard_cli/lib/args.js

// Parser de argumentos proprio, sem dependencia externa. O CLI nao instala
// node_modules: ele so precisa do Node e dos arquivos do proprio repo (o
// scripts/fetchData.js, de onde vem o contrato, e o src/data/commits.json).
// Dependencia zero e o que permite rodar o dash num clone recem-baixado, sem
// npm install e sem o node_modules de 200 MB do dashboard.
//
// Gramatica aceita:
//   dash <comando> [posicionais...] [--flag valor] [--booleana]
//   --flag=valor tambem e aceito
//   -- encerra as flags (tudo depois vira posicional)

// Flags que NAO consomem o proximo argumento (sao booleanas).
export const BOOLEANAS = new Set([
  'json',
  'csv',
  'ajuda',
  'help',
  'versao',
  'mes-apenas',
  'ano-todo',
  'cumulativo',
  'remoto',
  'sem-diffs',
  'com-patch'
])

/**
 * @param {string[]} argv normalmente process.argv.slice(2)
 * @returns {{_: string[], flags: Object<string, string|boolean>}}
 */
export function parse (argv) {
  const posicionais = []
  const flags = {}
  let soPosicional = false

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (soPosicional) {
      posicionais.push(arg)
      continue
    }

    if (arg === '--') {
      soPosicional = true
      continue
    }

    if (arg.startsWith('--')) {
      const corpo = arg.slice(2)
      const igual = corpo.indexOf('=')

      if (igual !== -1) {
        // --flag=valor: o valor vem colado, nunca consome o proximo argumento.
        flags[corpo.slice(0, igual)] = corpo.slice(igual + 1)
        continue
      }

      if (BOOLEANAS.has(corpo)) {
        flags[corpo] = true
        continue
      }

      const proximo = argv[i + 1]
      if (proximo === undefined || proximo.startsWith('--')) {
        // Flag desconhecida sem valor: trata como booleana em vez de engolir a
        // proxima flag, que seria um erro silencioso e dificil de achar.
        flags[corpo] = true
        continue
      }

      flags[corpo] = proximo
      i++
      continue
    }

    posicionais.push(arg)
  }

  return { _: posicionais, flags }
}

/**
 * Le uma flag exigindo valor de texto. Erro claro quando falta, em vez de
 * deixar `true` (booleano) vazar para dentro de um caminho ou de uma URL.
 */
export function exigir (flags, nome, contexto) {
  const valor = flags[nome]
  if (valor === undefined || valor === true || valor === '') {
    throw new Error(`Falta --${nome}${contexto ? ` (${contexto})` : ''}.`)
  }
  return valor
}

/** Le uma flag numerica opcional; devolve `padrao` quando ausente. */
export function numero (flags, nome, padrao) {
  const valor = flags[nome]
  if (valor === undefined || valor === true) return padrao
  const n = Number(valor)
  if (!Number.isFinite(n)) {
    throw new Error(`--${nome} precisa ser um numero (recebi "${valor}").`)
  }
  return n
}

/** Le uma flag de texto opcional; devolve `padrao` quando ausente ou booleana. */
export function texto (flags, nome, padrao = null) {
  const valor = flags[nome]
  if (valor === undefined || valor === true || valor === '') return padrao
  return String(valor)
}

/** Divide "a,b,c" em ['a','b','c'], ignorando espacos e itens vazios. */
export function lista (valor) {
  if (valor === undefined || valor === true) return null
  return String(valor)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}
