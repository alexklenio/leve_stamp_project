import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** "yyyy-mm-dd" (date input) -> "dd/mm/yyyy" */
function toBrDate(isoDate) {
    if (!isoDate)
        return '';
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d)
        return '';
    return `${d}/${m}/${y}`;
}
/** Applies the 000.000.000-00 mask while typing (digits only, max 11). */
function formatCpf(value) {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3)
        return d;
    if (d.length <= 6)
        return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9)
        return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}
/**
 * Turns what the user typed ("B, E", "B e E", "b,h,e") into the format used in
 * the message: “B” e “E”  /  “B”, “H” e “E”. If the text isn't a list of
 * single letters (a–l), it is kept exactly as typed.
 */
function formatLetras(raw) {
    const trimmed = raw.trim();
    if (!trimmed)
        return { text: '', plural: true };
    const tokens = trimmed.split(/[\s,;/&]+/).filter(Boolean);
    // A lowercase "e" between two other tokens is the conjunction ("B e E").
    const candidates = tokens.filter((t, i) => !(t === 'e' && i > 0 && i < tokens.length - 1));
    if (candidates.length === 0 || !candidates.every((t) => /^[a-lA-L]$/.test(t))) {
        return { text: trimmed, plural: true };
    }
    const letters = Array.from(new Set(candidates.map((t) => t.toUpperCase())));
    const quoted = letters.map((l) => `“${l}”`);
    const text = quoted.length === 1
        ? quoted[0]
        : `${quoted.slice(0, -1).join(', ')} e ${quoted[quoted.length - 1]}`;
    return { text, plural: quoted.length > 1 };
}
const BLANK = '____';
const BLANK_DATE = '__/__/____';
/** Builds the full WhatsApp message. Used for BOTH the preview and the copy. */
function buildMessage(d) {
    const items = d.ocorrencias.map((o) => o.trim()).filter(Boolean);
    const bullets = (items.length > 0 ? items : [BLANK]).map((item) => `· ${item}`).join('\n\n');
    const { text: letrasText, plural } = formatLetras(d.letras);
    return [
        `Olá, ${d.nome.trim() || BLANK}, tudo bem?\nAqui falo em nome da Auditoria da Leve Mobilidade.`,
        `Assunto: ${d.assunto.trim() || BLANK}\nCPF do Colaborador: ${d.cpf || BLANK}\nOperação: ${d.operacao.trim() || BLANK}`,
        'Estou entrando em contato para lembrá-lo sobre a importância de seguir as orientações do nosso Manual de Conduta, que é uma ferramenta essencial para garantir o bom funcionamento da nossa empresa e o cumprimento das normas estabelecidas.',
        `Identificamos que no dia ${d.dataOcorrencia || BLANK_DATE}:`,
        bullets,
        `Assim, cometido o(s) ato(s) de ${d.atos.trim() || BLANK} e infringido o dispositivo legal ${plural ? 'das letras' : 'da letra'} ${letrasText || BLANK} do Artigo 482 da CLT-Consolidação das Leis do Trabalho.`,
        'Contamos com sua colaboração para garantir que todos os procedimentos da empresa sejam seguidos corretamente.',
        'Caso tenha alguma dúvida ou precise reforçar os procedimentos e bons hábitos na operação por favor procurar o supervisor responsável.',
        `Atenciosamente,\nAuditoria da Leve Mobilidade\n${d.dataEnvio || BLANK_DATE}`,
        'Por gentileza, declarar recebimento da ação disciplinar',
    ].join('\n\n');
}
/** Clipboard copy with a fallback for browsers/contexts without the Clipboard API. */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    }
    catch {
        // fall through to the legacy approach below
    }
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        return ok;
    }
    catch {
        return false;
    }
}
const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue';
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';
function Field({ label, value, onChange, type = 'text', }) {
    return (_jsxs("div", { children: [_jsx("label", { className: labelClass, children: label }), _jsx("input", { type: type, value: value, onChange: (e) => onChange(e.target.value), className: inputClass })] }));
}
// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function WhatsappAdvertenciaForm({ onBack }) {
    const [nome, setNome] = useState('');
    const [assunto, setAssunto] = useState('');
    const [cpf, setCpf] = useState('');
    const [operacao, setOperacao] = useState('');
    const [dataOcorrenciaIso, setDataOcorrenciaIso] = useState('');
    const [ocorrencias, setOcorrencias] = useState(['']);
    const [atos, setAtos] = useState('');
    const [letras, setLetras] = useState('');
    const [dataEnvioIso, setDataEnvioIso] = useState('');
    const [copyState, setCopyState] = useState('idle');
    const message = useMemo(() => buildMessage({
        nome,
        assunto,
        cpf,
        operacao,
        dataOcorrencia: toBrDate(dataOcorrenciaIso),
        ocorrencias,
        atos,
        letras,
        dataEnvio: toBrDate(dataEnvioIso),
    }), [nome, assunto, cpf, operacao, dataOcorrenciaIso, ocorrencias, atos, letras, dataEnvioIso]);
    const isDirty = Boolean(nome || assunto || cpf || operacao || dataOcorrenciaIso || atos || letras || dataEnvioIso ||
        ocorrencias.length > 1 || ocorrencias.some((o) => o.trim()));
    const handleClear = () => {
        if (!window.confirm('Limpar todos os campos? Essa ação não pode ser desfeita.'))
            return;
        setNome('');
        setAssunto('');
        setCpf('');
        setOperacao('');
        setDataOcorrenciaIso('');
        setOcorrencias(['']);
        setAtos('');
        setLetras('');
        setDataEnvioIso('');
        setCopyState('idle');
    };
    const updateOcorrencia = (index, value) => setOcorrencias((prev) => prev.map((o, i) => (i === index ? value : o)));
    const addOcorrencia = () => setOcorrencias((prev) => [...prev, '']);
    const removeOcorrencia = (index) => setOcorrencias((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
    const handleCopy = async () => {
        const ok = await copyToClipboard(message);
        setCopyState(ok ? 'copied' : 'error');
        setTimeout(() => setCopyState('idle'), 2500);
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsxs("button", { onClick: onBack, className: "flex items-center gap-1.5 text-leve-blue hover:text-blue-900 font-semibold text-sm", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }), "Voltar ao Dashboard"] }), _jsx("span", { className: "text-gray-300", children: "|" }), _jsx("h1", { className: "text-lg font-bold text-gray-800", children: "Advert\u00EAncia via WhatsApp" }), isDirty && (_jsx("button", { onClick: handleClear, className: "ml-auto text-sm font-semibold text-red-600 hover:text-red-800", children: "Limpar" }))] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-4", children: "Dados do Colaborador" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx("div", { className: "sm:col-span-2", children: _jsx(Field, { label: "Nome do Colaborador", value: nome, onChange: setNome }) }), _jsx(Field, { label: "CPF do Colaborador", value: cpf, onChange: (v) => setCpf(formatCpf(v)) }), _jsx(Field, { label: "Opera\u00E7\u00E3o", value: operacao, onChange: setOperacao })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-4", children: "Dados da Advert\u00EAncia" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx("div", { className: "sm:col-span-2", children: _jsx(Field, { label: "Assunto", value: assunto, onChange: setAssunto }) }), _jsx(Field, { label: "Data da Ocorr\u00EAncia", value: dataOcorrenciaIso, onChange: setDataOcorrenciaIso, type: "date" }), _jsx(Field, { label: "Data do Envio", value: dataEnvioIso, onChange: setDataEnvioIso, type: "date" }), _jsx("div", { className: "sm:col-span-2", children: _jsx(Field, { label: "Atos cometidos", value: atos, onChange: setAtos }) }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx(Field, { label: "Letras do Artigo 482", value: letras, onChange: setLetras }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Separe por v\u00EDrgula (ex.: B, E). O texto coloca as aspas e o \"e\" automaticamente." })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-4", children: "Ocorr\u00EAncias" }), _jsx("div", { className: "flex flex-col gap-4", children: ocorrencias.map((ocorrencia, index) => (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsxs("label", { className: "text-sm font-semibold text-gray-700", children: ["Ocorr\u00EAncia ", index + 1] }), ocorrencias.length > 1 && (_jsx("button", { onClick: () => removeOcorrencia(index), className: "text-xs font-semibold text-red-600 hover:text-red-800", children: "Remover" }))] }), _jsx("textarea", { value: ocorrencia, onChange: (e) => updateOcorrencia(index, e.target.value), rows: 4, className: `${inputClass} resize-y` })] }, index))) }), _jsxs("button", { onClick: addOcorrencia, className: "mt-4 flex items-center gap-1.5 text-sm font-semibold text-leve-blue hover:text-blue-900", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }), "Adicionar ocorr\u00EAncia"] })] })] }), _jsx("div", { className: "lg:sticky lg:top-6 self-start", children: _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "flex items-center justify-between gap-4 mb-4", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800", children: "Mensagem" }), _jsx("button", { onClick: handleCopy, className: `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${copyState === 'copied'
                                                ? 'bg-green-600'
                                                : copyState === 'error'
                                                    ? 'bg-red-600'
                                                    : 'bg-leve-blue hover:bg-blue-900'}`, children: copyState === 'copied' ? (_jsx(_Fragment, { children: "\u2713 Copiado!" })) : copyState === 'error' ? (_jsx(_Fragment, { children: "N\u00E3o foi poss\u00EDvel copiar" })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }) }), "Copiar texto"] })) })] }), _jsx("div", { className: "bg-[#005c4b] text-white rounded-lg p-4 overflow-y-auto", style: { maxHeight: 'calc(100vh - 14rem)' }, children: _jsx("pre", { className: "whitespace-pre-wrap break-words font-sans text-[13px] leading-relaxed", children: message }) }), _jsx("p", { className: "text-xs text-gray-500 mt-3", children: "O texto \u00E9 copiado exatamente como aparece acima, pronto para colar no WhatsApp. Campos em branco aparecem como ____." })] }) })] })] }));
}
