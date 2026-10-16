import { useMemo, useState } from 'react';
import { UploadBox } from './UploadBox';
import { SealGrid } from './SealGrid';
import { Toolbar } from './Toolbar';
import { parseTxt, validateSeals, Seal } from '../utils/parseTxt';

interface SealGeneratorToolProps {
  onBack: () => void;
}

export default function SealGeneratorTool({ onBack }: SealGeneratorToolProps) {
  // The list of codes, one per line. It is filled by pasting into the text
  // area OR by uploading a TXT (the file content is loaded into the same
  // area), so both ways go through exactly the same recognition below.
  const [codesText, setCodesText] = useState('');
  const [zoom, setZoom] = useState(100);
  const [showBorders, setShowBorders] = useState(true);
  const [barcodeType, setBarcodeType] = useState<'numeric' | 'code128'>('code128');
  const [sealsPerPage, setSealsPerPage] = useState(22);
  const [currentPage, setCurrentPage] = useState(1);
  const [convenio, setConvenio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const parsed = useMemo(() => validateSeals(parseTxt(codesText)), [codesText]);
  const rawSeals = parsed.valid;
  const ignoredLines = parsed.invalid;
  const duplicateCount = useMemo(
    () => rawSeals.length - new Set(rawSeals.map((s) => s.codigo)).size,
    [rawSeals]
  );

  // Seals actually shown and exported. The convênio typed in the field is
  // applied here, so inserting/changing it updates the preview and the PDF
  // immediately — no need to upload the TXT again. A convênio that comes
  // inside the TXT line itself is kept as is.
  const seals = useMemo<Seal[]>(() => {
    const convenioTrimmed = convenio.trim();
    if (!convenioTrimmed) return rawSeals;
    return rawSeals.map((seal) => ({
      ...seal,
      convenio: seal.convenio || convenioTrimmed,
    }));
  }, [rawSeals, convenio]);

  const totalPages = Math.max(1, Math.ceil(seals.length / sealsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const handleFileUpload = (content: string) => {
    setIsLoading(true);
    try {
      setCodesText(content);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Back link + title */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-leve-blue hover:text-blue-900 font-semibold text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar ao Dashboard
        </button>
        <span className="text-gray-300">|</span>
        <h1 className="text-lg font-bold text-gray-800">Gerador de Selos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Convenio Section — applied live to every seal (preview and PDF). */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Convênio / Liberação</h3>
            <input
              type="text"
              value={convenio}
              onChange={(e) => setConvenio(e.target.value)}
              placeholder="ex: LIBERAÇÃO GERÊNCIA - LT12082026"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Pode preencher ou alterar a qualquer momento — os selos são atualizados na hora
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Upload do TXT</h2>
            <UploadBox onFileUpload={handleFileUpload} isLoading={isLoading} />
          </div>

          {/* Paste codes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Colar códigos</h2>
              {codesText && (
                <button
                  onClick={() => {
                    setCodesText('');
                    setCurrentPage(1);
                  }}
                  className="text-xs font-semibold text-red-600 hover:text-red-800"
                >
                  Limpar
                </button>
              )}
            </div>
            <textarea
              value={codesText}
              onChange={(e) => setCodesText(e.target.value)}
              rows={8}
              spellCheck={false}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-leve-blue resize-y"
            />
            <p className="text-xs text-gray-500 mt-1">
              Cole a lista com um código por linha (também aceita código;convênio). Os selos são
              gerados na hora. O conteúdo de um TXT enviado aparece aqui e pode ser editado.
            </p>

            {rawSeals.length > 0 && (
              <p className="text-xs font-semibold text-green-700 mt-2">
                ✓ {rawSeals.length} {rawSeals.length === 1 ? 'código reconhecido' : 'códigos reconhecidos'}
              </p>
            )}
            {duplicateCount > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                ⚠️ {duplicateCount} {duplicateCount === 1 ? 'código repetido' : 'códigos repetidos'} na lista.
              </p>
            )}
            {ignoredLines.length > 0 && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                <p className="font-semibold">
                  ⚠️ {ignoredLines.length} {ignoredLines.length === 1 ? 'linha ignorada' : 'linhas ignoradas'} (o código precisa ter ao menos 10 dígitos numéricos):
                </p>
                <p className="font-mono break-all mt-1">
                  {ignoredLines.slice(0, 3).map((l) => l.codigo || '(vazio)').join(' · ')}
                  {ignoredLines.length > 3 && ` · … e mais ${ignoredLines.length - 3}`}
                </p>
              </div>
            )}
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
                currentPage={safePage}
                onPageChange={setCurrentPage}
                barcodeType={barcodeType}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="flex flex-col items-center justify-center gap-4">
                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-gray-500 font-semibold">Nenhum código carregado</p>
                  <p className="text-gray-400 text-sm mt-1">Carregue um arquivo TXT ou cole os códigos para começar</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
