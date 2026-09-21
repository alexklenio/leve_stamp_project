import React, { useState } from 'react';
import { UploadBox } from './components/UploadBox';
import { SealGrid } from './components/SealGrid';
import { Toolbar } from './components/Toolbar';
import { parseTxt, validateSeals, Seal } from './utils/parseTxt';

export default function App() {
  const [seals, setSeals] = useState<Seal[]>([]);
  const [invalidSeals, setInvalidSeals] = useState<Seal[]>([]);
  const [zoom, setZoom] = useState(100);
  const [showBorders, setShowBorders] = useState(true);
  const [barcodeType, setBarcodeType] = useState<'numeric' | 'code128'>('code128');
  const [sealsPerPage, setSealsPerPage] = useState(22);
  const [currentPage, setCurrentPage] = useState(1);
  const [convenio, setConvenio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (content: string) => {
    setIsLoading(true);
    try {
      // Parse the TXT file
      let parsedSeals = parseTxt(content);

      // If convenio is set and seals don't have it, add it
      if (convenio && parsedSeals.length > 0) {
        parsedSeals = parsedSeals.map(seal => ({
          ...seal,
          convenio: seal.convenio || convenio,
        }));
      }

      // Validate seals
      const { valid, invalid } = validateSeals(parsedSeals);

      setSeals(valid);
      setInvalidSeals(invalid);
      setCurrentPage(1);

      // Show warning if there are invalid seals
      if (invalid.length > 0) {
        alert(`⚠️ ${invalid.length} código(s) inválido(s) foi/foram ignorado(s).\n\nValor mínimo: 10 dígitos numéricos.`);
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      alert('Erro ao processar o arquivo. Verifique o formato.');
      setSeals([]);
      setInvalidSeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-leve-blue text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl font-bold">LEVE MOBILIDADE</div>
            <span className="text-gray-300 text-sm"> - SETOR DE AUDITORIA</span>
          </div>
          <p className="text-gray-200 text-sm">Ferramenta de geração de selos.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Upload do TXT</h2>
              <UploadBox onFileUpload={handleFileUpload} isLoading={isLoading} />
            </div>

            {/* Configuration Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Configurações</h3>
              
              <div className="flex flex-col gap-4">
                {/* Convenio Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Convênio / Liberação
                  </label>
                  <input
                    type="text"
                    value={convenio}
                    onChange={(e) => setConvenio(e.target.value)}
                    placeholder="ex: LIBERAÇÃO GERÊNCIA - LT12082026"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se preenchido, será aplicado a todos os selos
                  </p>
                </div>

                {/* Barcode Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Código
                  </label>
                  <select
                    value={barcodeType}
                    onChange={(e) => setBarcodeType(e.target.value as 'numeric' | 'code128')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue"
                    disabled={isLoading}
                  >
                    <option value="numeric">Numérico</option>
                    <option value="code128">Code 128</option>
                  </select>
                </div>

                {/* Seals Per Page */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Selos por página
                  </label>
                  <select
                    value={sealsPerPage}
                    onChange={(e) => setSealsPerPage(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue"
                    disabled={isLoading}
                  >
                    <option value={6}>6 (3x2)</option>
                    <option value={12}>12 (4x3)</option>
                    <option value={22}>22 (11x2)</option>
                    <option value={24}>24 (12x2)</option>
                  </select>
                </div>

                {/* Show Borders */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBorders}
                    onChange={(e) => setShowBorders(e.target.checked)}
                    className="w-4 h-4 text-leve-blue rounded focus:ring-2 focus:ring-leve-blue"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Visualizar bordas dos selos
                  </span>
                </label>
              </div>
            </div>

            {/* Summary */}
            {seals.length > 0 && (
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-800">
                      ✓ {seals.length} selos carregados
                    </h4>
                    <p className="text-xs text-green-700 mt-1">
                      Pronto para impressão
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Toolbar */}
            {seals.length > 0 && (
              <Toolbar
                seals={seals}
                zoom={zoom}
                onZoomChange={setZoom}
                showBorders={showBorders}
                onShowBordersChange={setShowBorders}
                barcodeType={barcodeType}
                onBarcodeTypeChange={setBarcodeType}
                sealsPerPage={sealsPerPage}
                onSealsPerPageChange={setSealsPerPage}
                convenio={convenio}
                onConvenioChange={setConvenio}
                isLoading={isLoading}
              />
            )}

            {/* Preview */}
            {seals.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Visualização</h2>
                <SealGrid
                  seals={seals}
                  sealsPerPage={sealsPerPage}
                  showBorders={showBorders}
                  zoom={zoom}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-gray-500 font-semibold">Nenhum arquivo carregado</p>
                    <p className="text-gray-400 text-sm mt-1">Carregue um arquivo TXT para começar</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-4 mt-12">
        <p className="text-sm">
          Desenvolvido por Alex Lopes - Solução rápida para geração de selos de liberação
        </p>
      </footer>
    </div>
  );
}
