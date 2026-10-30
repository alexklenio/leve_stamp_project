// Configuração da dashboard de Produtividade (Google Sheets).
// Edite apenas este arquivo para ligar a dashboard à planilha.

export interface ProdutividadeConfig {
  /** ID da planilha: o trecho da URL entre /d/ e /edit. */
  sheetId: string;
  /** Nome da aba. Se vazio, usa o gid abaixo. */
  sheetName: string;
  /** Número que aparece depois de gid= na URL. */
  sheetGid: string;
  /** Nome de reserva para colunas SEM título (chave = letra da coluna). O título da planilha sempre vale mais. */
  columnLabels: Record<string, string>;
  /** De quanto em quanto tempo a dashboard relê a planilha (em milissegundos). */
  refreshIntervalMs: number;

  // ---- Colunas (nome do cabeçalho OU letra da coluna). Vazio = detectar sozinho. ----
  /** Coluna do auditor (detecta cabeçalhos com "AUDITOR"). */
  auditorColumn: string;
  /** Coluna do motivo / alínea (detecta "MOTIVO" ou "ALÍNEA"). */
  motivoColumn: string;
  /** Coluna do mês (detecta "MÊS"). */
  monthColumn: string;
  /** Coluna do ano (detecta "ANO"). */
  yearColumn: string;
  /** Coluna com o nome do colaborador, usada na busca por nome (detecta "COLABORADOR", "FUNCIONÁRIO" ou "NOME"). */
  nameColumn: string;
  /** Coluna de data, usada só se MÊS e/ou ANO não existirem como colunas. */
  dateColumn: string;
  /** Colunas que NÃO aparecem na tabela. */
  hiddenColumns: string[];
  /** Cor de cada motivo nos gráficos (nome do motivo -> cor). Os motivos que não estiverem aqui usam cores automáticas. */
  motivoColors: Record<string, string>;
}

export const PRODUTIVIDADE_CONFIG: ProdutividadeConfig = {
  // Link enviado: .../d/13EWZjaoj6W4bx9jE6blycQ277w76vkm0/edit?gid=2058868500
  sheetId: '13EWZjaoj6W4bx9jE6blycQ277w76vkm0',
  sheetName: '',
  sheetGid: '2058868500',
  columnLabels: {},
  refreshIntervalMs: 60000,

  auditorColumn: '',
  motivoColumn: '',
  monthColumn: '',
  yearColumn: '',
  nameColumn: '',
  dateColumn: '',
  hiddenColumns: [],

  // Ato de improbidade em vermelho e mau procedimento em azul.
  motivoColors: {
    'ATO DE IMPROBIDADE': '#EA4335',
    'MAU PROCEDIMENTO': '#4285F4',
  },
};
