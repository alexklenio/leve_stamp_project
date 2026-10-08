import jsPDF from 'jspdf';
import { LEVE_LOGO_BASE64, LEVE_LOGO_ASPECT_RATIO } from '../assets/leveLogoBase64';

export interface SuspensionData {
  nomeEmpregado: string;
  ctps: string;
  serie: string;
  funcao: string;
  setorLotacao: string;
  diasSuspensao: string;
  dataCometimento: string; // dd/mm/yyyy
  tipoAto: string;
  letraArtigo: string;
  dataOcorrido: string; // dd/mm/yyyy
  dataRetorno: string; // dd/mm/yyyy
  resumoSuspensao: string;
  local: string;
  dataDocumento: string; // dd/mm/yyyy
  razaoSocial: string;
  cnpj: string;
  testemunha1Nome: string;
  testemunha1Data: string;
  testemunha2Nome: string;
  testemunha2Data: string;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** Converts "dd/mm/yyyy" into { dia, mes, ano }. Falls back gracefully if incomplete/empty. */
function formatDatePtBr(dateStr: string): { dia: string; mes: string; ano: string } {
  const parts = (dateStr || '').split('/');
  const dia = parts[0] || '____';
  const mesNum = parseInt(parts[1], 10);
  const mes = !isNaN(mesNum) && mesNum >= 1 && mesNum <= 12 ? MESES[mesNum - 1] : '____';
  const ano = parts[2] || '____';
  return { dia, mes, ano };
}

// Full text of Artigo 482 of the CLT, shown only in the exported PDF (not
// in the on-screen preview), as its own boxed section below the letter.
const ARTIGO_482_CLAUSULAS = [
  'a) ato de improbidade; (desonestidade, fraude, mau caráter)',
  'b) incontinência de conduta ou mau procedimento; (conduta incabível)',
  'c) negociação habitual por conta própria ou alheia sem permissão do empregador, quando constituir ato de concorrência à empresa para a qual trabalha o empregado, ou for prejudicial ao serviço;',
  'd) condenação criminal do empregado, passada em julgado, caso não tenha havido suspensão da execução da pena;',
  'e) desídia no desempenho das respectivas funções;',
  'f) embriaguez habitual ou em serviço;',
  'g) violação de segredo da empresa;',
  'h) ato de indisciplina ou de insubordinação;',
  'i) abandono de emprego;',
  'j) ato lesivo da honra ou da boa fama praticado no serviço contra qualquer pessoa, ou ofensas físicas, nas mesmas condições, salvo em caso de legítima defesa, própria ou de outrem;',
  'k) ato lesivo da honra ou da boa fama ou ofensas físicas praticadas contra o empregador e superiores hierárquicos, salvo em caso de legítima defesa, própria ou de outrem;',
  'l) prática constante de jogos de azar.',
];

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const MARGIN_MM = 13;
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_MM * 2;
const RIGHT_EDGE_MM = PAGE_WIDTH_MM - MARGIN_MM;

export async function generateSuspensionPdf(data: SuspensionData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setTextColor(0, 0, 0);

  let cursorY = MARGIN_MM;

  // ========================================================================
  // BOX A — Title (centered) + logo
  // ========================================================================
  const boxATop = cursorY;
  const boxAHeight = 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.text('CARTA DE SUSPENSÃO DISCIPLINAR', PAGE_WIDTH_MM / 2, boxATop + boxAHeight / 2 + 1.5, {
    align: 'center',
  });

  // New LEVÉ logo (full color), placed directly on the page at the
  // top-right of the title box — no background badge.
  const logoPadMm = 1.5;
  const logoMaxH = boxAHeight - logoPadMm * 2;
  const logoMaxW = 30;
  let logoW = logoMaxW;
  let logoH = logoW / LEVE_LOGO_ASPECT_RATIO;
  if (logoH > logoMaxH) {
    logoH = logoMaxH;
    logoW = logoH * LEVE_LOGO_ASPECT_RATIO;
  }
  doc.addImage(
    LEVE_LOGO_BASE64,
    'PNG',
    RIGHT_EDGE_MM - logoW - 3,
    boxATop + (boxAHeight - logoH) / 2,
    logoW,
    logoH
  );

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(MARGIN_MM, boxATop, CONTENT_WIDTH_MM, boxAHeight);

  cursorY = boxATop + boxAHeight + 2;

  // ========================================================================
  // BOX B — Employee info + body of the letter + signature + witnesses
  // ========================================================================
  const boxBTop = cursorY;
  let y = boxBTop + 7;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  // Nome, CTPS and Série all on one line.
  let x = MARGIN_MM + 3;
  doc.setFont('helvetica', 'normal');
  doc.text('Sra./Sr.:', x, y);
  x += doc.getTextWidth('Sra./Sr.: ') + 1.5;
  doc.setFont('helvetica', 'bold');
  doc.text(data.nomeEmpregado || '—', x, y);
  x += doc.getTextWidth(data.nomeEmpregado || '—') + 6;

  doc.setFont('helvetica', 'normal');
  doc.text('CTPS:', x, y);
  x += doc.getTextWidth('CTPS: ') + 1.5;
  doc.setFont('helvetica', 'bold');
  doc.text(data.ctps || '—', x, y);
  x += doc.getTextWidth(data.ctps || '—') + 6;

  doc.setFont('helvetica', 'normal');
  doc.text('SÉRIE:', x, y);
  x += doc.getTextWidth('SÉRIE: ') + 1.5;
  doc.setFont('helvetica', 'bold');
  doc.text(data.serie || '—', x, y);

  const infoLine = (label: string, value: string, atY: number) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, MARGIN_MM + 3, atY);
    const labelW = doc.getTextWidth(label);
    doc.setFont('helvetica', 'bold');
    doc.text(value || '—', MARGIN_MM + 3 + labelW + 1.5, atY);
  };

  y += 6;
  infoLine('Função:', data.funcao, y);
  y += 6;
  infoLine('Setor / Lotação:', data.setorLotacao, y);
  y += 4;

  // Divider between the employee-info block and the rest of the letter.
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(MARGIN_MM, y, RIGHT_EDGE_MM, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Referente à: Suspensão ${data.diasSuspensao || '1'} dia(s)`, MARGIN_MM + 3, y);
  y += 7;

  const paragraph =
    `Ao Sr. Empregado desta empresa, desde ${data.dataCometimento || '____/____/____'} ` +
    `tendo em vista ter cometido o(s) ato(s) de ${(data.tipoAto || '—').toUpperCase()}, ` +
    `infringindo os dispositivos legais das letras "${data.letraArtigo || '—'}" do Artigo 482 da CLT ` +
    `Consolidação das Leis do Trabalho, resolvemos aplicar-lhe como medida disciplinar, a presente ` +
    `SUSPENSÃO ${data.diasSuspensao || '1'} DIA(S) por falta sem justificativa, fato ocorrido em ` +
    `${data.dataOcorrido || '____/____/____'}.`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const paraLines = doc.splitTextToSize(paragraph, CONTENT_WIDTH_MM - 6);
  doc.text(paraLines, MARGIN_MM + 3, y, { lineHeightFactor: 1.4 });
  y += paraLines.length * 5.2 + 4;

  infoLine('Retornar em:', data.dataRetorno, y);
  y += 6;
  infoLine('Resumo da Suspensão:', data.resumoSuspensao, y);
  y += 10;

  const { dia, mes, ano } = formatDatePtBr(data.dataDocumento);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${data.local || 'Recife'}, ${dia} de ${mes} de ${ano}.`, PAGE_WIDTH_MM / 2, y, {
    align: 'center',
  });
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text(data.razaoSocial || '—', PAGE_WIDTH_MM / 2, y, { align: 'center' });
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(data.cnpj || '—', PAGE_WIDTH_MM / 2, y, { align: 'center' });
  y += 10;

  const sigLineWidth = 80;
  doc.setLineWidth(0.3);
  doc.line(PAGE_WIDTH_MM / 2 - sigLineWidth / 2, y, PAGE_WIDTH_MM / 2 + sigLineWidth / 2, y);
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(data.nomeEmpregado || '—', PAGE_WIDTH_MM / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Em caso de recusa do empregado a dar ciência nesta:', MARGIN_MM + 3, y);
  y += 7;

  const drawWitness = (label: string, nome: string, dataTest: string, atY: number) => {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text(label, MARGIN_MM + 3, atY);

    // Signature line
    doc.line(MARGIN_MM + 27, atY + 1, MARGIN_MM + 95, atY + 1);
    if (nome) {
      doc.setFont('helvetica', 'bold');
      doc.text(nome, MARGIN_MM + 29, atY);
    }

    // Date: fixed position right after the signature line
    doc.setFont('helvetica', 'normal');
    doc.text('Data:', MARGIN_MM + 101, atY);
    if (dataTest) {
      doc.setFont('helvetica', 'bold');
      doc.text(dataTest, MARGIN_MM + 113, atY);
    } else {
      doc.text('____/____/____', MARGIN_MM + 113, atY);
    }
  };

  drawWitness('Testemunha 1:', data.testemunha1Nome, data.testemunha1Data, y);
  y += 9;
  drawWitness('Testemunha 2:', data.testemunha2Nome, data.testemunha2Data, y);
  y += 5;

  const boxBBottom = y;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(MARGIN_MM, boxBTop, CONTENT_WIDTH_MM, boxBBottom - boxBTop);

  cursorY = boxBBottom + 4;

  // ========================================================================
  // BOX C — Artigo 482 da CLT (PDF only — not shown in the on-screen preview)
  // ========================================================================
  const boxCTop = cursorY;
  let cy = boxCTop + 6;
  const textX = MARGIN_MM + 3;
  const textWidth = CONTENT_WIDTH_MM - 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Para seu conhecimento, transcrevemos abaixo o Artigo 482 da CLT:', textX, cy);
  cy += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const introLines = doc.splitTextToSize(
    'Art. 482 – Constituem justa causa para rescisão do contrato de trabalho pelo empregador:',
    textWidth
  );
  doc.text(introLines, textX, cy, { lineHeightFactor: 1.35 });
  cy += introLines.length * 3.7 + 1.5;

  doc.setFontSize(8);
  ARTIGO_482_CLAUSULAS.forEach((clausula) => {
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(clausula, textWidth);
    doc.text(lines, textX, cy, { lineHeightFactor: 1.35 });
    cy += lines.length * 3.7 + 1.0;
  });

  cy += 0.5;
  doc.setFont('helvetica', 'bold');
  const paragrafoLeadIn = 'Parágrafo único- ';
  doc.setFontSize(8);
  const leadInW = doc.getTextWidth(paragrafoLeadIn);
  doc.text(paragrafoLeadIn, textX, cy);
  doc.setFont('helvetica', 'normal');
  const paragrafoResto =
    'Constitui igualmente justa causa para dispensa de emprego a prática, devidamente comprovada ' +
    'em inquérito administrativo, de atos atentatórios contra a segurança nacional.';
  const restoLines = doc.splitTextToSize(paragrafoResto, textWidth - leadInW);
  doc.text(restoLines[0], textX + leadInW, cy);
  cy += 3.7;
  if (restoLines.length > 1) {
    const remaining = restoLines.slice(1);
    doc.text(remaining, textX, cy, { lineHeightFactor: 1.35 });
    cy += remaining.length * 3.7;
  }
  cy += 3;

  const boxCBottom = cy;
  doc.rect(MARGIN_MM, boxCTop, CONTENT_WIDTH_MM, boxCBottom - boxCTop);

  // ========================================================================
  // Footer
  // ========================================================================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text(
    'LEVÉ Mobilidade — Documento gerado pela Ferramenta de Carta de Suspensão Disciplinar',
    PAGE_WIDTH_MM / 2,
    PAGE_HEIGHT_MM - 7,
    { align: 'center' }
  );

  const fileNameSafe = (data.nomeEmpregado || 'funcionario')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase();

  doc.save(`carta_suspensao_${fileNameSafe}.pdf`);
}
