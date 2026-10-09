import { ReactNode } from 'react';

interface DashboardProps {
  onSelectTool: (tool: 'selos' | 'suspensao' | 'advertencia') => void;
}

interface ToolCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

function ToolCard({ title, description, icon, onClick, disabled }: ToolCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-left bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-all
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
        }`}
    >
      <div className="w-12 h-12 rounded-lg bg-leve-blue bg-opacity-10 flex items-center justify-center mb-4 text-leve-blue">
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
      {disabled && (
        <span className="inline-block mt-3 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded">
          Em breve
        </span>
      )}
    </button>
  );
}

export default function Dashboard({ onSelectTool }: DashboardProps) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-1">Ferramentas do Setor</h1>
      <p className="text-sm text-gray-500 mb-6">Selecione uma ferramenta para começar</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <ToolCard
          title="Gerador de Selos"
          description="Gere selos de liberação a partir de uma lista de códigos em TXT, com código de barras e exportação em PDF."
          onClick={() => onSelectTool('selos')}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <ToolCard
          title="Carta de Advertência Disciplinar"
          description="Preencha os dados do funcionário e da ocorrência e exporte a carta de advertência pronta para assinatura."
          onClick={() => onSelectTool('advertencia')}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <ToolCard
          title="Carta de Suspensão Disciplinar"
          description="Preencha os dados do funcionário e da ocorrência e exporte a carta de suspensão pronta para assinatura."
          onClick={() => onSelectTool('suspensao')}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <ToolCard
          title="Mais ferramentas"
          description="Novas ferramentas do setor de auditoria serão adicionadas aqui."
          onClick={() => {}}
          disabled
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
