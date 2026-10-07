import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { generateSuspensionPdf } from '../utils/generateSuspensionPdf';
const EMPTY_DATA = {
    nomeEmpregado: '',
    ctps: '',
    serie: '',
    funcao: '',
    setorLotacao: '',
    diasSuspensao: '1',
    dataCometimento: '',
    tipoAto: '',
    letraArtigo: '',
    dataOcorrido: '',
    dataRetorno: '',
    resumoSuspensao: '',
    local: 'Recife',
    dataDocumento: '',
    razaoSocial: 'Propark Estacionamentos LTDA',
    cnpj: '10.755.459/0034-17',
    testemunha1Nome: '',
    testemunha1Data: '',
    testemunha2Nome: '',
    testemunha2Data: '',
};
// Converts a <input type="date"> value ("yyyy-mm-dd") to "dd/mm/yyyy" for
// display/PDF, since the letter uses the Brazilian date format throughout.
function toBrDate(isoDate) {
    if (!isoDate)
        return '';
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d)
        return '';
    return `${d}/${m}/${y}`;
}
function Field({ label, value, onChange, placeholder, type = 'text', required = true, }) {
    return (_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-1.5", children: [label, " ", required && _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: type, value: value, onChange: (e) => onChange(e.target.value), placeholder: placeholder, className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue" })] }));
}
export default function SuspensionForm({ onBack }) {
    // Dates are kept as native <input type="date"> (yyyy-mm-dd) in state for
    // a proper date picker UX, and converted to dd/mm/yyyy only when building
    // the data sent to the PDF / preview.
    const [form, setForm] = useState({
        ...EMPTY_DATA,
        dataCometimentoIso: '',
        dataOcorridoIso: '',
        dataRetornoIso: '',
        dataDocumentoIso: '',
        testemunha1DataIso: '',
        testemunha2DataIso: '',
    });
    const [isExporting, setIsExporting] = useState(false);
    const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));
    const buildData = () => ({
        nomeEmpregado: form.nomeEmpregado,
        ctps: form.ctps,
        serie: form.serie,
        funcao: form.funcao,
        setorLotacao: form.setorLotacao,
        diasSuspensao: form.diasSuspensao,
        dataCometimento: toBrDate(form.dataCometimentoIso),
        tipoAto: form.tipoAto,
        letraArtigo: form.letraArtigo,
        dataOcorrido: toBrDate(form.dataOcorridoIso),
        dataRetorno: toBrDate(form.dataRetornoIso),
        resumoSuspensao: form.resumoSuspensao,
        local: form.local,
        dataDocumento: toBrDate(form.dataDocumentoIso),
        razaoSocial: form.razaoSocial,
        cnpj: form.cnpj,
        testemunha1Nome: form.testemunha1Nome,
        testemunha1Data: toBrDate(form.testemunha1DataIso),
        testemunha2Nome: form.testemunha2Nome,
        testemunha2Data: toBrDate(form.testemunha2DataIso),
    });
    const requiredFilled = form.nomeEmpregado && form.ctps && form.funcao && form.setorLotacao &&
        form.dataCometimentoIso && form.tipoAto && form.letraArtigo &&
        form.dataOcorridoIso && form.resumoSuspensao && form.dataDocumentoIso;
    const handleExport = async () => {
        if (!requiredFilled) {
            alert('Preencha todos os campos obrigatórios (marcados com *) antes de exportar.');
            return;
        }
        setIsExporting(true);
        try {
            await generateSuspensionPdf(buildData());
        }
        catch (error) {
            console.error('Erro ao exportar PDF:', error);
            alert('Erro ao exportar PDF.');
        }
        finally {
            setIsExporting(false);
        }
    };
    const data = buildData();
    return (_jsxs("div", { className: "max-w-7xl mx-auto p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsxs("button", { onClick: onBack, className: "flex items-center gap-1.5 text-leve-blue hover:text-blue-900 font-semibold text-sm", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }), "Voltar ao Dashboard"] }), _jsx("span", { className: "text-gray-300", children: "|" }), _jsx("h1", { className: "text-lg font-bold text-gray-800", children: "Carta de Suspens\u00E3o Disciplinar" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-4", children: "Dados do Funcion\u00E1rio" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx("div", { className: "sm:col-span-2", children: _jsx(Field, { label: "Nome do Empregado", value: form.nomeEmpregado, onChange: set('nomeEmpregado'), placeholder: "ex: SHENIA ESTEFANIA CORDEIRO DOS SANTOS" }) }), _jsx(Field, { label: "CTPS", value: form.ctps, onChange: set('ctps'), placeholder: "ex: 1174968" }), _jsx(Field, { label: "S\u00E9rie", value: form.serie, onChange: set('serie'), placeholder: "ex: 1412 - PB" }), _jsx(Field, { label: "Fun\u00E7\u00E3o", value: form.funcao, onChange: set('funcao'), placeholder: "ex: OPERADOR DE ESTACIONAMENTO" }), _jsx(Field, { label: "Setor / Lota\u00E7\u00E3o", value: form.setorLotacao, onChange: set('setorLotacao'), placeholder: "ex: 0300 - ASSA\u00CD EPIT\u00C1CIO" })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-4", children: "Dados da Suspens\u00E3o" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Field, { label: "Dias de Suspens\u00E3o", value: form.diasSuspensao, onChange: set('diasSuspensao'), type: "number" }), _jsx(Field, { label: "Data do Cometimento (desde)", value: form.dataCometimentoIso, onChange: set('dataCometimentoIso'), type: "date" }), _jsx("div", { className: "sm:col-span-2", children: _jsx(Field, { label: "Tipo de Ato / Procedimento", value: form.tipoAto, onChange: set('tipoAto'), placeholder: "ex: MAU PROCEDIMENTO" }) }), _jsx(Field, { label: "Letra do Artigo 482", value: form.letraArtigo, onChange: set('letraArtigo'), placeholder: "ex: B" }), _jsx(Field, { label: "Data de Ocorr\u00EAncia do Fato", value: form.dataOcorridoIso, onChange: set('dataOcorridoIso'), type: "date" }), _jsx(Field, { label: "Data de Retorno", value: form.dataRetornoIso, onChange: set('dataRetornoIso'), type: "date", required: false }), _jsx("div", { className: "sm:col-span-2", children: _jsx(Field, { label: "Resumo da Suspens\u00E3o", value: form.resumoSuspensao, onChange: set('resumoSuspensao'), placeholder: "ex: Falta sem justificativa" }) })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-4", children: "Local, Data e Empresa" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Field, { label: "Local", value: form.local, onChange: set('local') }), _jsx(Field, { label: "Data do Documento", value: form.dataDocumentoIso, onChange: set('dataDocumentoIso'), type: "date" }), _jsx("div", { className: "sm:col-span-2", children: _jsx(Field, { label: "Raz\u00E3o Social", value: form.razaoSocial, onChange: set('razaoSocial') }) }), _jsx(Field, { label: "CNPJ", value: form.cnpj, onChange: set('cnpj') })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-4", children: "Testemunhas (opcional)" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Field, { label: "Testemunha 1 \u2014 Nome", value: form.testemunha1Nome, onChange: set('testemunha1Nome'), required: false }), _jsx(Field, { label: "Testemunha 1 \u2014 Data", value: form.testemunha1DataIso, onChange: set('testemunha1DataIso'), type: "date", required: false }), _jsx(Field, { label: "Testemunha 2 \u2014 Nome", value: form.testemunha2Nome, onChange: set('testemunha2Nome'), required: false }), _jsx(Field, { label: "Testemunha 2 \u2014 Data", value: form.testemunha2DataIso, onChange: set('testemunha2DataIso'), type: "date", required: false })] })] }), _jsxs("button", { onClick: handleExport, disabled: isExporting, className: "flex items-center justify-center gap-2 px-5 py-3 bg-leve-blue text-white font-semibold rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" }) }), isExporting ? 'Gerando PDF...' : 'Exportar PDF'] }), !requiredFilled && (_jsx("p", { className: "text-xs text-amber-600 -mt-3", children: "Preencha os campos marcados com * para habilitar a exporta\u00E7\u00E3o." }))] }), _jsx("div", { className: "lg:sticky lg:top-6 self-start", children: _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "Pr\u00E9-visualiza\u00E7\u00E3o" }), _jsxs("div", { className: "border border-gray-300 rounded-md p-6 text-[13px] leading-relaxed text-gray-900 bg-white", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsx("h3", { className: "font-bold text-base", children: "CARTA DE SUSPENS\u00C3O DISCIPLINAR" }), _jsx("div", { className: "bg-leve-blue text-white text-[10px] font-bold px-2 py-1 rounded", children: "LEV\u00C9" })] }), _jsx("hr", { className: "mb-3 border-leve-blue" }), _jsxs("p", { children: [_jsx("span", { className: "font-normal", children: "Sra./Sr.: " }), _jsx("span", { className: "font-bold", children: data.nomeEmpregado || '—' })] }), _jsxs("p", { children: [_jsx("span", { className: "font-normal", children: "CTPS: " }), _jsx("span", { className: "font-bold", children: data.ctps || '—' }), _jsx("span", { className: "font-normal ml-4", children: "S\u00C9RIE: " }), _jsx("span", { className: "font-bold", children: data.serie || '—' })] }), _jsxs("p", { children: [_jsx("span", { className: "font-normal", children: "Fun\u00E7\u00E3o: " }), _jsx("span", { className: "font-bold", children: data.funcao || '—' })] }), _jsxs("p", { className: "mb-3", children: [_jsx("span", { className: "font-normal", children: "Setor / Lota\u00E7\u00E3o: " }), _jsx("span", { className: "font-bold", children: data.setorLotacao || '—' })] }), _jsx("hr", { className: "mb-3 border-gray-200" }), _jsxs("p", { className: "font-bold mb-2", children: ["Referente \u00E0: Suspens\u00E3o ", data.diasSuspensao || '1', " dia(s)"] }), _jsxs("p", { className: "text-justify mb-3", children: ["Ao Sr. Empregado desta empresa, desde", ' ', _jsx("span", { className: "font-semibold", children: data.dataCometimento || '____/____/____' }), ' ', "tendo em vista ter cometido o(s) ato(s) de", ' ', _jsx("span", { className: "font-semibold", children: (data.tipoAto || '—').toUpperCase() }), ", infringindo os dispositivos legais das letras \"", _jsx("span", { className: "font-semibold", children: data.letraArtigo || '—' }), "\" do Artigo 482 da CLT Consolida\u00E7\u00E3o das Leis do Trabalho, resolvemos aplicar-lhe como medida disciplinar, a presente SUSPENS\u00C3O ", data.diasSuspensao || '1', " DIA(S) por falta sem justificativa, fato ocorrido em", ' ', _jsx("span", { className: "font-semibold", children: data.dataOcorrido || '____/____/____' }), "."] }), _jsxs("p", { children: [_jsx("span", { className: "font-normal", children: "Retornar em: " }), _jsx("span", { className: "font-bold", children: data.dataRetorno || '—' })] }), _jsxs("p", { className: "mb-4", children: [_jsx("span", { className: "font-normal", children: "Resumo da Suspens\u00E3o: " }), _jsx("span", { className: "font-bold", children: data.resumoSuspensao || '—' })] }), _jsxs("p", { className: "text-center mb-4", children: [data.local || 'Recife', (() => {
                                                    const [d, m, y] = (data.dataDocumento || '').split('/');
                                                    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                                                    const mi = parseInt(m, 10);
                                                    const mesExt = !isNaN(mi) ? meses[mi - 1] : '____';
                                                    return `, ${d || '__'} de ${mesExt} de ${y || '____'}.`;
                                                })()] }), _jsx("p", { className: "text-center font-bold", children: data.razaoSocial || '—' }), _jsx("p", { className: "text-center mb-6", children: data.cnpj || '—' }), _jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "border-t border-gray-400 w-48 mx-auto mb-1" }), _jsx("p", { className: "font-bold", children: data.nomeEmpregado || '—' })] }), _jsx("p", { className: "text-xs text-gray-600 mb-2", children: "Em caso de recusa do empregado a dar ci\u00EAncia nesta:" }), _jsxs("div", { className: "flex justify-between text-xs mb-2", children: [_jsxs("span", { children: ["Testemunha 1: ", data.testemunha1Nome && _jsx("strong", { children: data.testemunha1Nome })] }), _jsxs("span", { children: ["Data: ", data.testemunha1Data && _jsx("strong", { children: data.testemunha1Data })] })] }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsxs("span", { children: ["Testemunha 2: ", data.testemunha2Nome && _jsx("strong", { children: data.testemunha2Nome })] }), _jsxs("span", { children: ["Data: ", data.testemunha2Data && _jsx("strong", { children: data.testemunha2Data })] })] })] })] }) })] })] }));
}
