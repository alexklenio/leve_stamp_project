import { useState } from 'react';
import Dashboard from './components/Dashboard';
import SealGeneratorTool from './components/SealGeneratorTool';
import DiscountSealTool from './components/DiscountSealTool';
import WhatsappAdvertenciaForm from './components/WhatsappAdvertenciaForm';
import SuspensionForm from './components/SuspensionForm';
import AdvertenciaForm from './components/AdvertenciaForm';
import AudienciasDashboard from './components/AudienciasDashboard';
import NovoCompromissoForm from './components/NovoCompromissoForm';
import { LEVE_LOGO_WHITE_BASE64, LEVE_LOGO_WHITE_ASPECT_RATIO } from './assets/leveLogoBase64';

type View =
  | 'dashboard'
  | 'selos'
  | 'desconto'
  | 'whatsapp'
  | 'suspensao'
  | 'advertencia'
  | 'audiencias'
  | 'audiencia-nova';

type Section = 'ferramentas' | 'audiencias';

const SUBTITLES: Record<Section, string> = {
  ferramentas: 'Ferramentas do setor de auditoria.',
  audiencias: 'Acompanhamento de audiências e compromissos.',
};

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`px-6 sm:px-8 py-2.5 rounded-t-lg text-base md:text-lg font-extrabold uppercase tracking-tight transition-colors ${
        active ? 'bg-gray-50 text-leve-blue' : 'bg-white bg-opacity-15 text-white hover:bg-opacity-25'
      }`}
    >
      {label}
    </button>
  );
}

export default function App() {
  const [view, setView] = useState<View>('dashboard');

  const section: Section =
    view === 'audiencias' || view === 'audiencia-nova' ? 'audiencias' : 'ferramentas';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header — shared across every screen. The tabs sit on its bottom edge. */}
      <header className="bg-leve-blue text-white px-6 pt-3 shadow-lg">
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

          <div className="flex flex-wrap items-end gap-x-10 gap-y-2">
            {/* All subtitles share the same grid cell; the hidden ones only reserve space,
                so this block always has the width of the longest text and the tabs stay put. */}
            <div className="grid pb-3">
              {(Object.keys(SUBTITLES) as Section[]).map((key) => (
                <p
                  key={key}
                  aria-hidden={key !== section}
                  className={`col-start-1 row-start-1 text-gray-200 text-sm ${
                    key === section ? '' : 'invisible'
                  }`}
                >
                  {SUBTITLES[key]}
                </p>
              ))}
            </div>
            <nav className="flex gap-2">
              <TabButton
                label="Ferramentas"
                active={section === 'ferramentas'}
                onClick={() => setView('dashboard')}
              />
              <TabButton
                label="Audiências"
                active={section === 'audiencias'}
                onClick={() => setView('audiencias')}
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        {view === 'dashboard' && <Dashboard onSelectTool={setView} />}
        {view === 'selos' && <SealGeneratorTool onBack={() => setView('dashboard')} />}
        {view === 'desconto' && <DiscountSealTool onBack={() => setView('dashboard')} />}
        {view === 'whatsapp' && <WhatsappAdvertenciaForm onBack={() => setView('dashboard')} />}
        {view === 'suspensao' && <SuspensionForm onBack={() => setView('dashboard')} />}
        {view === 'advertencia' && <AdvertenciaForm onBack={() => setView('dashboard')} />}
        {view === 'audiencias' && <AudienciasDashboard onNew={() => setView('audiencia-nova')} />}
        {view === 'audiencia-nova' && <NovoCompromissoForm onBack={() => setView('audiencias')} />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-4">
        <p className="text-sm">
          Auditoria Leve Mobilidade - Todos os direitos reservados - Desenvolvido por Alex Lopes
        </p>
      </footer>
    </div>
  );
}
