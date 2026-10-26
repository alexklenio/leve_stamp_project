import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Dashboard from './components/Dashboard';
import SealGeneratorTool from './components/SealGeneratorTool';
import DiscountSealTool from './components/DiscountSealTool';
import WhatsappAdvertenciaForm from './components/WhatsappAdvertenciaForm';
import SuspensionForm from './components/SuspensionForm';
import AdvertenciaForm from './components/AdvertenciaForm';
import AudienciasDashboard from './components/AudienciasDashboard';
import NovoCompromissoForm from './components/NovoCompromissoForm';
import ProdutividadeDashboard from './components/ProdutividadeDashboard';
import { LEVE_LOGO_WHITE_BASE64, LEVE_LOGO_WHITE_ASPECT_RATIO } from './assets/leveLogoBase64';
const SUBTITLES = {
    ferramentas: 'Ferramentas do setor de auditoria.',
    audiencias: 'Acompanhamento de audiências e compromissos.',
    produtividade: 'Indicadores de produtividade do setor.',
};
function TabButton({ label, active, onClick, }) {
    return (_jsx("button", { onClick: onClick, "aria-current": active ? 'page' : undefined, className: `px-6 sm:px-8 py-2.5 rounded-t-lg text-base md:text-lg font-extrabold uppercase tracking-tight transition-colors ${active ? 'bg-gray-50 text-leve-blue' : 'bg-white bg-opacity-15 text-white hover:bg-opacity-25'}`, children: label }));
}
export default function App() {
    const [view, setView] = useState('dashboard');
    let section = 'ferramentas';
    if (view === 'audiencias' || view === 'audiencia-nova')
        section = 'audiencias';
    else if (view === 'produtividade')
        section = 'produtividade';
    return (_jsxs("div", { className: "min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100", children: [_jsx("header", { className: "bg-leve-blue text-white px-6 pt-3 shadow-lg", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("button", { onClick: () => setView('dashboard'), className: "flex items-center gap-4 mb-2", children: [_jsx("img", { src: LEVE_LOGO_WHITE_BASE64, alt: "LEV\u00C9 Mobilidade", style: {
                                        height: '76px',
                                        width: `${76 * LEVE_LOGO_WHITE_ASPECT_RATIO}px`,
                                    } }), _jsx("span", { className: "text-xl md:text-2xl font-bold tracking-tight", children: "- SETOR DE AUDITORIA" })] }), _jsxs("div", { className: "flex flex-wrap items-end gap-x-10 gap-y-2", children: [_jsx("div", { className: "grid pb-3", children: Object.keys(SUBTITLES).map((key) => (_jsx("p", { "aria-hidden": key !== section, className: `col-start-1 row-start-1 text-gray-200 text-sm ${key === section ? '' : 'invisible'}`, children: SUBTITLES[key] }, key))) }), _jsxs("nav", { className: "flex gap-2", children: [_jsx(TabButton, { label: "Ferramentas", active: section === 'ferramentas', onClick: () => setView('dashboard') }), _jsx(TabButton, { label: "Audi\u00EAncias", active: section === 'audiencias', onClick: () => setView('audiencias') }), _jsx(TabButton, { label: "Produtividade", active: section === 'produtividade', onClick: () => setView('produtividade') })] })] })] }) }), _jsxs("main", { className: "flex-1 py-6", children: [view === 'dashboard' && _jsx(Dashboard, { onSelectTool: setView }), view === 'selos' && _jsx(SealGeneratorTool, { onBack: () => setView('dashboard') }), view === 'desconto' && _jsx(DiscountSealTool, { onBack: () => setView('dashboard') }), view === 'whatsapp' && _jsx(WhatsappAdvertenciaForm, { onBack: () => setView('dashboard') }), view === 'suspensao' && _jsx(SuspensionForm, { onBack: () => setView('dashboard') }), view === 'advertencia' && _jsx(AdvertenciaForm, { onBack: () => setView('dashboard') }), view === 'audiencias' && _jsx(AudienciasDashboard, { onNew: () => setView('audiencia-nova') }), view === 'audiencia-nova' && _jsx(NovoCompromissoForm, { onBack: () => setView('audiencias') }), view === 'produtividade' && _jsx(ProdutividadeDashboard, {})] }), _jsx("footer", { className: "bg-gray-800 text-gray-400 text-center py-4", children: _jsx("p", { className: "text-sm", children: "Auditoria Leve Mobilidade - Todos os direitos reservados - Desenvolvido por Alex Lopes" }) })] }));
}
