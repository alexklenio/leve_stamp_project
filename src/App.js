import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Dashboard from './components/Dashboard';
import SealGeneratorTool from './components/SealGeneratorTool';
import DiscountSealTool from './components/DiscountSealTool';
import WhatsappAdvertenciaForm from './components/WhatsappAdvertenciaForm';
import SuspensionForm from './components/SuspensionForm';
import AdvertenciaForm from './components/AdvertenciaForm';
import { LEVE_LOGO_WHITE_BASE64, LEVE_LOGO_WHITE_ASPECT_RATIO } from './assets/leveLogoBase64';
export default function App() {
    const [view, setView] = useState('dashboard');
    return (_jsxs("div", { className: "min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100", children: [_jsx("header", { className: "bg-leve-blue text-white px-6 py-3 shadow-lg", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("button", { onClick: () => setView('dashboard'), className: "flex items-center gap-4 mb-2", children: [_jsx("img", { src: LEVE_LOGO_WHITE_BASE64, alt: "LEV\u00C9 Mobilidade", style: {
                                        height: '76px',
                                        width: `${76 * LEVE_LOGO_WHITE_ASPECT_RATIO}px`,
                                    } }), _jsx("span", { className: "text-xl md:text-2xl font-bold tracking-tight", children: "- SETOR DE AUDITORIA" })] }), _jsx("p", { className: "text-gray-200 text-sm", children: "Ferramentas do setor de auditoria." })] }) }), _jsxs("main", { className: "flex-1 py-6", children: [view === 'dashboard' && _jsx(Dashboard, { onSelectTool: setView }), view === 'selos' && _jsx(SealGeneratorTool, { onBack: () => setView('dashboard') }), view === 'desconto' && _jsx(DiscountSealTool, { onBack: () => setView('dashboard') }), view === 'whatsapp' && _jsx(WhatsappAdvertenciaForm, { onBack: () => setView('dashboard') }), view === 'suspensao' && _jsx(SuspensionForm, { onBack: () => setView('dashboard') }), view === 'advertencia' && _jsx(AdvertenciaForm, { onBack: () => setView('dashboard') })] }), _jsx("footer", { className: "bg-gray-800 text-gray-400 text-center py-4", children: _jsx("p", { className: "text-sm", children: "Auditoria Leve Mobilidade - Todos os direitos reservados - Desenvolvido por Alex Lopes" }) })] }));
}
