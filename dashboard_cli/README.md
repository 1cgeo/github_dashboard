# dashboard_cli

CLI do `github_dashboard`, para agentes. O dashboard web serve humanos; este CLI
serve quem precisa dos mesmos numeros em texto, sem abrir a tela.

Substitui dois scripts Python que faziam essa conta por fora, no vault do chefe
da DGEO (`consultar_commits.py` e `resumir_commits.py`, 636 linhas): eles
transcreviam a logica daqui, e transcricao apodrece calada.

Sem dependencia: so o Node (18+) e os arquivos do proprio repositorio. Nao
precisa de `npm install`.

## Os dois comandos

### `dash consolidado` - a Secao 4.1 do RPCMTec

Commits por repositorio no periodo, com o efetivo que os fez.

```bash
node dashboard_cli/dash.js consolidado --ano 2026 --mes 6
node dashboard_cli/dash.js consolidado --ano 2026 --mes 6 --mes-apenas --csv
node dashboard_cli/dash.js consolidado --ano 2026 --ano-todo --formato markdown
```

Padrao: mes corrente, **acumulado de janeiro** (o RPCMTec e cumulativo).
`--mes-apenas` da o mes isolado, que e o que o botao "Dados Consolidados" da
tela exporta; `--ano-todo` da o ano, para a RPCATec.

Formatos: `tabela` (padrao), `tsv`, `markdown` (a tabela pronta do relatorio),
`csv` (identico ao do botao da tela, mesmo cabecalho e mesmo separador de
autores) e `json`.

### `dash material` - o resumo do que foi feito

Prepara, por repositorio, o material que alguem vai resumir em um paragrafo (a
coluna extra da 4.1). O CLI faz so a parte deterministica e nao chama modelo
nenhum: escreve uma pasta de trabalho e imprime o caminho do `manifesto.json`.

```bash
node dashboard_cli/dash.js material --ano 2026 --mes 6 --out ./trabalho
node dashboard_cli/dash.js material --mes 6 --sem-diffs        # offline
```

Metodo, por commit: se a mensagem diz o que foi feito, ela entra verbatim; se e
generica ("ajustes", "fix", "wip"), o CLI busca no GitHub os arquivos alterados
e o saldo de linhas daquele commit. Mensagem boa nao gasta rede.

O `manifesto.json` traz um item por repositorio (commits, efetivo, caminho do
material) e as `instrucoes_resumo`, para que todo cliente use a mesma redacao.

Repositorio privado responde 404 sem token: defina `GH_PAT` (o mesmo do
`scripts/fetchData.js`) ou passe `--gh-token`. Sem token, sao 60 requisicoes por
hora.

## De onde vem o dado

Do `src/data/commits.json` do proprio clone. Quem o produz e o
`scripts/fetchData.js`, que o GitHub Actions roda tres vezes ao dia e commita na
`main`, entao um clone parado fica atras: `--remoto` le a `main` direto, e
`--source` aceita um arquivo ou URL especifico.

O CLI **so le**. Quando o dado nao alcanca o fim do periodo pedido, ele avisa
(nao bloqueia): o risco e um total menor que a realidade passar sem sintoma.

## Nada de contrato copiado

O CLI importa do repositorio, em tempo de execucao:

- `scripts/fetchData.js`: a lista de repositorios acompanhados, o `authorMapping`
  (handle do GitHub para posto e nome de guerra) e os filtros de commit;
- `src/utils/dateUtils.js`: a funcao que decide em que dia de Brasilia um commit
  cai, a mesma que o grafico diario da tela usa.

Repositorio novo ou militar novo aparece no CLI sozinho. Duas consequencias que
valem saber:

- o `fetchData.js` normaliza o nome do autor **no momento da coleta** e nunca
  revisita commit ja gravado. Mapear um handle novo hoje nao consertaria o
  historico, entao o CLI **reaplica o `authorMapping` na leitura**;
- autor que o mapa nao conhece vira aviso, em vez de entrar calado no relatorio
  como handle cru do GitHub.

## Testes

```bash
cd dashboard_cli && npm test
```

Rodam contra o `authorMapping` e o `commits.json` reais, nao contra mocks: e para
quebrarem quando o contrato mudar, que e o alarme.
