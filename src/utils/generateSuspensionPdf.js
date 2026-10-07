import jsPDF from 'jspdf';
import { LEVE_LOGO_WHITE_BASE64, LEVE_LOGO_WHITE_ASPECT_RATIO } from '../assets/leveLogoBase64';
const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
/** Converts "dd/mm/yyyy" into { dia, mesExtenso, ano }. Falls back gracefully if incomplete/empty. */
function formatDatePtBr(dateStr) {
    const parts = (dateStr || '').split('/');
    const dia = parts[0] || '____';
    const mesNum = parseInt(parts[1], 10);
    const mes = !isNaN(mesNum) && mesNum >= 1 && mesNum <= 12 ? MESES[mesNum - 1] : '____';
    const ano = parts[2] || '____';
    return { dia, mes, ano };
}
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const MARGIN_MM = 18;
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_MM * 2;
export async function generateSuspensionPdf(data) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let cursorY = MARGIN_MM;
    // --- Header: title + LEVÉ logo badge top-right ---
    const badgeW = 26;
    const badgeH = 13;
    const badgeX = PAGE_WIDTH_MM - MARGIN_MM - badgeW;
    const badgeY = cursorY;
    doc.setFillColor(0, 51, 102); // leve-blue
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, 'F');
    const logoPad = 2.5;
    const logoMaxW = badgeW - logoPad * 2;
    const logoMaxH = badgeH - logoPad * 2;
    let logoW = logoMaxW;
    let logoH = logoW / LEVE_LOGO_WHITE_ASPECT_RATIO;
    if (logoH > logoMaxH) {
        logoH = logoMaxH;
        logoW = logoH * LEVE_LOGO_WHITE_ASPECT_RATIO;
    }
    doc.addImage(LEVE_LOGO_WHITE_BASE64, 'PNG', badgeX + (badgeW - logoW) / 2, badgeY + (badgeH - logoH) / 2, logoW, logoH);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text('CARTA DE SUSPENSÃO DISCIPLINAR', MARGIN_MM, cursorY + 8);
    cursorY += badgeH + 4;
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.8);
    doc.line(MARGIN_MM, cursorY, PAGE_WIDTH_MM - MARGIN_MM, cursorY);
    cursorY += 9;
    // --- Employee info block ---
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const infoLine = (label, value, y) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, MARGIN_MM, y);
        const labelW = doc.getTextWidth(label);
        doc.setFont('helvetica', 'bold');
        doc.text(value || '—', MARGIN_MM + labelW + 1.5, y);
    };
    infoLine('Sra./Sr.:', data.nomeEmpregado, cursorY);
    doc.setFont('helvetica', 'normal');
    doc.text(`CTPS: `, MARGIN_MM, (cursorY += 6));
    doc.setFont('helvetica', 'bold');
    doc.text(data.ctps || '—', MARGIN_MM + doc.getTextWidth('CTPS: '), cursorY);
    doc.setFont('helvetica', 'normal');
    const serieLabelX = MARGIN_MM + 60;
    doc.text('SÉRIE:', serieLabelX, cursorY);
    doc.setFont('helvetica', 'bold');
    doc.text(data.serie || '—', serieLabelX + doc.getTextWidth('SÉRIE: '), cursorY);
    cursorY += 6;
    infoLine('Função:', data.funcao, cursorY);
    cursorY += 6;
    infoLine('Setor / Lotação:', data.setorLotacao, cursorY);
    cursorY += 9;
    // --- Divider + body paragraph box ---
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_MM, cursorY, PAGE_WIDTH_MM - MARGIN_MM, cursorY);
    cursorY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(`Referente à: Suspensão ${data.diasSuspensao || '1'} dia(s)`, MARGIN_MM, cursorY);
    cursorY += 8;
    const paragraph = `Ao Sr. Empregado desta empresa, desde ${data.dataCometimento || '____/____/____'} ` +
        `tendo em vista ter cometido o(s) ato(s) de ${(data.tipoAto || '—').toUpperCase()}, ` +
        `infringindo os dispositivos legais das letras "${data.letraArtigo || '—'}" do Artigo 482 da CLT ` +
        `Consolidação das Leis do Trabalho, resolvemos aplicar-lhe como medida disciplinar, a presente ` +
        `SUSPENSÃO ${data.diasSuspensao || '1'} DIA(S) por falta sem justificativa, fato ocorrido em ` +
        `${data.dataOcorrido || '____/____/____'}.`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    const paraLines = doc.splitTextToSize(paragraph, CONTENT_WIDTH_MM);
    doc.text(paraLines, MARGIN_MM, cursorY, { align: 'left', lineHeightFactor: 1.5 });
    cursorY += paraLines.length * 5.6 + 4;
    // --- Retornar em / Resumo ---
    infoLine('Retornar em:', data.dataRetorno, cursorY);
    cursorY += 7;
    infoLine('Resumo da Suspensão:', data.resumoSuspensao, cursorY);
    cursorY += 14;
    // --- Local e data (centered) ---
    const { dia, mes, ano } = formatDatePtBr(data.dataDocumento);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text(`${data.local || 'Recife'}, ${dia} de ${mes} de ${ano}.`, PAGE_WIDTH_MM / 2, cursorY, { align: 'center' });
    cursorY += 16;
    // --- Razão social / CNPJ box (centered) ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(data.razaoSocial || '—', PAGE_WIDTH_MM / 2, cursorY, { align: 'center' });
    cursorY += 5.5;
    doc.setFont('helvetica', 'normal');
    doc.text(data.cnpj || '—', PAGE_WIDTH_MM / 2, cursorY, { align: 'center' });
    cursorY += 16;
    // --- Employee signature line (centered) ---
    const sigLineWidth = 80;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(PAGE_WIDTH_MM / 2 - sigLineWidth / 2, cursorY, PAGE_WIDTH_MM / 2 + sigLineWidth / 2, cursorY);
    cursorY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(data.nomeEmpregado || '—', PAGE_WIDTH_MM / 2, cursorY, { align: 'center' });
    cursorY += 14;
    // --- Witnesses ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('Em caso de recusa do empregado a dar ciência nesta:', MARGIN_MM, cursorY);
    cursorY += 10;
    const drawWitness = (label, nome, data_, y) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(label, MARGIN_MM, y);
        doc.line(MARGIN_MM + 24, y + 1, MARGIN_MM + 95, y + 1);
        if (nome) {
            doc.setFont('helvetica', 'bold');
            doc.text(nome, MARGIN_MM + 26, y);
        }
        doc.setFont('helvetica', 'normal');
        doc.text('Data:', MARGIN_MM + 105, y);
        doc.line(MARGIN_MM + 118, y + 1, PAGE_WIDTH_MM - MARGIN_MM, y + 1);
        if (data_) {
            doc.setFont('helvetica', 'bold');
            doc.text(data_, MARGIN_MM + 120, y);
        }
    };
    drawWitness('Testemunha 1:', data.testemunha1Nome, data.testemunha1Data, cursorY);
    cursorY += 12;
    drawWitness('Testemunha 2:', data.testemunha2Nome, data.testemunha2Data, cursorY);
    // --- Footer ---
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text('LEVÉ Mobilidade — Documento gerado pela Ferramenta de Carta de Suspensão Disciplinar', PAGE_WIDTH_MM / 2, PAGE_HEIGHT_MM - 10, { align: 'center' });
    const fileNameSafe = (data.nomeEmpregado || 'funcionario')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .toLowerCase();
    doc.save(`carta_suspensao_${fileNameSafe}.pdf`);
}
