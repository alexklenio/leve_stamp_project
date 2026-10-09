import { useState } from 'react';
import Dashboard from './components/Dashboard';
import SealGeneratorTool from './components/SealGeneratorTool';
import SuspensionForm from './components/SuspensionForm';
import AdvertenciaForm from './components/AdvertenciaForm';
import { LEVE_LOGO_WHITE_BASE64, LEVE_LOGO_WHITE_ASPECT_RATIO } from './assets/leveLogoBase64';

type View = 'dashboard' | 'selos' | 'suspensao' | 'advertencia';

export default function App() {
  const [view, setView] = useState<View>('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header — shared across every screen (Dashboard and every tool) */}
      <header className="bg-leve-blue text-white px-6 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center gap-4 mb-2"
          >
            <img
              src={LEVE_LOGO_WHITE_BASE64}
              alt="LEVÉ Mobilidade"
              style={{
                height: '76px',
                width: `${76 * LEVE_LOGO_WHITE_ASPECT_RATIO}px`,
              }}
            />
            <span className="text-xl md:text-2xl font-bold tracking-tight">
              - SETOR DE AUDITORIA
            </span>
          </button>
          <p className="text-gray-200 text-sm">Ferramentas do setor de auditoria.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        {view === 'dashboard' && <Dashboard onSelectTool={setView} />}
        {view === 'selos' && <SealGeneratorTool onBack={() => setView('dashboard')} />}
        {view === 'suspensao' && <SuspensionForm onBack={() => setView('dashboard')} />}
        {view === 'advertencia' && <AdvertenciaForm onBack={() => setView('dashboard')} />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-4">
        <p className="text-sm">
          Solução rápida e confiável — Ferramentas do Setor de Auditoria LEVÉ Mobilidade
        </p>
      </footer>
    </div>
  );
}
