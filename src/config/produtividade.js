// Configuração da dashboard de Produtividade (Google Sheets).
// Edite apenas este arquivo para ligar a dashboard à planilha.
export const PRODUTIVIDADE_CONFIG = {
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
