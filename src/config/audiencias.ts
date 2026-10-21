// Configuração da dashboard de audiências (Google Sheets).
// Edite apenas este arquivo para ligar a dashboard à planilha de vocês.

export interface AudienciasConfig {
  /** ID da planilha: o trecho da URL entre /d/ e /edit. */
  sheetId: string;
  /** Nome da aba, exatamente como aparece na planilha. Se vazio, usa o gid abaixo. */
  sheetName: string;
  /** Número que aparece depois de gid= na URL (usado quando sheetName está vazio). */
  sheetGid: string;
  /** URL do aplicativo da Web do Apps Script (usada para GRAVAR novos compromissos). */
  scriptUrl: string;
  /** Mesmo token definido no Code.gs do Apps Script. */
  scriptToken: string;
  /** De quanto em quanto tempo a dashboard relê a planilha (em milissegundos). */
  refreshIntervalMs: number;

  // ---- Ajustes das colunas ----
  // Em qualquer lista abaixo, a coluna pode ser indicada pelo NOME do cabeçalho
  // (ex.: 'DATA') ou pela LETRA da coluna na planilha (ex.: 'D').

  /** Nome de reserva para colunas SEM título na planilha (chave = letra da coluna). O título escrito na planilha sempre vale mais. */
  columnLabels: Record<string, string>;
  /** Coluna da data da audiência (vazio = detectar sozinho). */
  dateColumn: string;
  /** Coluna do horário (vazio = detectar sozinho). */
  timeColumn: string;
  /** Até 2 colunas em destaque no cartão. */
  primaryColumns: string[];
  /** Colunas mostradas como etiquetas coloridas no cartão (ex.: tipo e modalidade). */
  badgeColumns: string[];
  /** Colunas que NÃO aparecem nos cartões da agenda. */
  hiddenColumns: string[];
  /** Colunas que NÃO aparecem no formulário de novo compromisso (ex.: colunas com fórmula). */
  formExcludedColumns: string[];
}

export const AUDIENCIAS_CONFIG: AudienciasConfig = {
  // Planilha "ARQUIVOS AUDITORIA" — aba com gid 0
  sheetId: '1Y76WJGSAI5Z_a4QYotVeg_TvfDppJQmO2yiniWoU_Xs',
  sheetName: '',
  sheetGid: '0',

  // Preencha depois de implantar o Apps Script (veja AUDIENCIAS_SETUP.md, passo 2).
  scriptUrl: 'https://script.google.com/macros/s/AKfycbwthKGdVE8AnxXrPH40Z_5X5WCJi0zqP-DO1cS3iQ4UBVqOGDsUBc_iHSEASg-4kJfQ/exec',
  scriptToken: 'DESENVOLVIDO_POR_ALEX_LOPES_21102026',

  refreshIntervalMs: 60000,

  // Os títulos de F (MODALIDADE: UNA / INICIAL / INSTRUÇÃO) e G (TIPO: PRESENCIAL / ONLINE)
  // agora existem na planilha. Estes nomes só valem se algum deles ficar em branco.
  columnLabels: { F: 'MODALIDADE', G: 'TIPO' },
  dateColumn: 'DATA',
  timeColumn: 'HORA',
  primaryColumns: ['PROCESSO'],
  badgeColumns: ['MODALIDADE', 'TIPO'],

  // B e C aparecem ocultas na planilha: também ficam fora da agenda e do formulário.
  hiddenColumns: ['B', 'C'],
  formExcludedColumns: ['B', 'C'],
};
