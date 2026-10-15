import { ReactNode } from 'react';

interface DashboardProps {
  onSelectTool: (tool: 'selos' | 'desconto' | 'whatsapp' | 'suspensao' | 'advertencia') => void;
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
    <div className="max-w-7xl mx-auto px-6 pb-6">
      <h1 className="text-xl font-bold text-gray-800 mb-1">Ferramentas do Setor</h1>
      <p className="text-sm text-gray-500 mb-6">Selecione uma ferramenta para começar</p>

      <div className="flex flex-col gap-5">
        {/* Linha 1 — selos */}
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
          title="Selos de Desconto (AVC)"
          description="Gere selos numéricos de desconto no padrão do sistema AVC, preenchendo tipo, sequência e valor manualmente."
          onClick={() => onSelectTool('desconto')}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />
        </div>

        {/* Linha 2 — advertências e suspensão */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <ToolCard
          title="Advertência via WhatsApp"
          description="Preencha os dados do colaborador e das ocorrências e copie o texto pronto para enviar pelo WhatsApp."
          onClick={() => onSelectTool('whatsapp')}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
        </div>

        {/* Linha 3 — em breve */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
    </div>
  );
}
