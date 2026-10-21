// Configuração da dashboard de audiências (Google Sheets).
// Edite apenas este arquivo para ligar a dashboard à planilha de vocês.
export const AUDIENCIAS_CONFIG = {
    // Planilha "ARQUIVOS AUDITORIA" — aba com gid 0
    sheetId: '1Y76WJGSAI5Z_a4QYotVeg_TvfDppJQmO2yiniWoU_Xs',
    sheetName: '',
    sheetGid: '0',
    // Preencha depois de implantar o Apps Script (veja AUDIENCIAS_SETUP.md, passo 2).
    scriptUrl: '',
    scriptToken: '',
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
