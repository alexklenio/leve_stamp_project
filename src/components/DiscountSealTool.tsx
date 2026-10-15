import { useMemo, useState } from 'react';
import { SealGrid } from './SealGrid';
import { generatePdf } from '../utils/generatePdf';
import { Seal } from '../utils/parseTxt';

interface DiscountSealToolProps {
  onBack: () => void;
}

// AVC Sistemas discount-seal pattern (11 numeric digits):
//   digit 1        -> always 7 (identifies a discount seal for the system)
//   digit 2        -> discount type: 1 = Horas, 2 = Valor, 3 = Percentual
//   digits 3 to 7  -> sequence number of the seal (5 digits)
//   digits 8 to 11 -> discount value (4 digits)
const TIPOS = [
  { value: '1', label: 'Horas' },
  { value: '2', label: 'Valor' },
  { value: '3', label: 'Percentual' },
];

const SEALS_PER_PAGE = 22; // same fixed layout the PDF export uses (2 columns x 11 rows)
const MAX_SEQUENCE = 99999;

const onlyDigits = (value: string, maxLength: number) =>
  value.replace(/\D/g, '').slice(0, maxLength);

const pad = (value: number | string, size: number) => String(value).padStart(size, '0');

export default function DiscountSealTool({ onBack }: DiscountSealToolProps) {
  const [tipo, setTipo] = useState('');
  const [sequenciaInicial, setSequenciaInicial] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valor, setValor] = useState('');
  const [convenio, setConvenio] = useState('');

  const [zoom, setZoom] = useState(100);
  const [showBorders, setShowBorders] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const startNum = sequenciaInicial === '' ? null : parseInt(sequenciaInicial, 10);
  const qtyNum = quantidade === '' ? null : parseInt(quantidade, 10);

  let error: string | null = null;
  if (startNum !== null && qtyNum !== null) {
    if (qtyNum < 1) {
      error = 'A quantidade deve ser de pelo menos 1 selo.';
    } else if (startNum + qtyNum - 1 > MAX_SEQUENCE) {
      error = `A sequência passaria de ${MAX_SEQUENCE}. Com início em ${pad(startNum, 5)}, a quantidade máxima é ${MAX_SEQUENCE - startNum + 1}.`;
    }
  }

  const ready =
    tipo !== '' && startNum !== null && qtyNum !== null && valor !== '' && error === null;

  // Seals are generated live from the form — no "generate" button needed.
  const seals = useMemo<Seal[]>(() => {
    if (!ready || startNum === null || qtyNum === null) return [];
    const list: Seal[] = [];
    for (let i = 0; i < qtyNum; i++) {
      const codigo = `7${tipo}${pad(startNum + i, 5)}${pad(valor, 4)}`;
      list.push({
        id: `desconto-${i}-${codigo}`,
        codigo,
        convenio: convenio.trim() || undefined,
      });
    }
    return list;
  }, [ready, startNum, qtyNum, tipo, valor, convenio]);

  const totalPages = Math.max(1, Math.ceil(seals.length / SEALS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const handleExport = async () => {
    if (seals.length === 0) return;
    setIsExporting(true);
    try {
      await generatePdf(seals, {
        sealsPerPage: SEALS_PER_PAGE,
        showBorders,
        barcodeType: 'numeric', // discount seals are numeric only (no barcode graphic)
      });
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      alert('Erro ao exportar PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Breakdown of the first seal's code, to make it easy to double-check.
  const tipoLabel = TIPOS.find((t) => t.value === tipo)?.label;
  const breakdown = [
    { digits: '7', title: 'Dígito 1', desc: 'Fixo: selo do sistema' },
    { digits: tipo || '?', title: 'Dígito 2', desc: tipoLabel ? `Tipo: ${tipoLabel}` : 'Tipo de desconto' },
    { digits: startNum !== null ? pad(startNum, 5) : '?????', title: 'Dígitos 3 a 7', desc: 'Sequência' },
    { digits: valor !== '' ? pad(valor, 4) : '????', title: 'Dígitos 8 a 11', desc: 'Valor do desconto' },
  ];

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue';
  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';

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
        <h1 className="text-lg font-bold text-gray-800">Selos de Desconto (AVC)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar: form */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Convenio Section — first in the form, same as the original seal generator.
              Applied live to every seal (preview and PDF). */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Convênio / Liberação</h3>
            <input
              type="text"
              value={convenio}
              onChange={(e) => setConvenio(e.target.value)}
              placeholder="ex: LIBERAÇÃO GERÊNCIA - LT12082026"
              className={inputClass}
            />
            <p className="text-xs text-gray-500 mt-1">
              Pode preencher ou alterar a qualquer momento — os selos são atualizados na hora
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Dados dos Selos</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Tipo de desconto</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Selecione</option>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} ({t.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Sequência inicial (5 dígitos)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={sequenciaInicial}
                  onChange={(e) => setSequenciaInicial(onlyDigits(e.target.value, 5))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Quantidade de selos</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={quantidade}
                  onChange={(e) => setQuantidade(onlyDigits(e.target.value, 5))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Valor do desconto (4 dígitos)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={valor}
                  onChange={(e) => setValor(onlyDigits(e.target.value, 4))}
                  className={inputClass}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Zeros à esquerda são completados automaticamente.
                </p>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </p>
            )}
          </div>

          {/* Code breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Composição do código</h3>
            <div className="flex flex-col gap-2">
              {breakdown.map((part) => (
                <div key={part.title} className="flex items-center gap-3">
                  <span className="font-mono font-bold text-leve-blue bg-blue-50 rounded px-2 py-1 min-w-[3.5rem] text-center">
                    {part.digits}
                  </span>
                  <div className="leading-tight">
                    <p className="text-xs font-semibold text-gray-700">{part.title}</p>
                    <p className="text-xs text-gray-500">{part.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {seals.length > 0 && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-6">
              <h4 className="text-sm font-semibold text-green-800">
                ✓ {seals.length} {seals.length === 1 ? 'selo gerado' : 'selos gerados'}
              </h4>
              <p className="text-xs text-green-700 mt-1 font-mono break-all">
                {seals[0].codigo}
                {seals.length > 1 && <> até {seals[seals.length - 1].codigo}</>}
              </p>
            </div>
          )}
        </div>

        {/* Right content: toolbar + preview */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {seals.length > 0 && (
            <div className="bg-leve-blue text-white p-6 rounded-xl shadow-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                {/* Zoom */}
                <div className="flex flex-col gap-3">
                  <label className="text-[15px] font-semibold">Zoom</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setZoom((z) => Math.max(50, z - 10))}
                      className="w-9 h-9 flex items-center justify-center bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-lg leading-none"
                    >
                      −
                    </button>
                    <span className="text-base font-medium w-12 text-center">{zoom}%</span>
                    <button
                      onClick={() => setZoom((z) => Math.min(200, z + 10))}
                      className="w-9 h-9 flex items-center justify-center bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-lg leading-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Borders */}
                <div className="flex flex-col gap-3">
                  <label className="text-[15px] font-semibold">Borda</label>
                  <label className="flex items-center gap-2.5 cursor-pointer h-[36px]">
                    <input
                      type="checkbox"
                      checked={showBorders}
                      onChange={(e) => setShowBorders(e.target.checked)}
                      className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm">Mostrar bordas</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-white border-opacity-20">
                <div className="text-sm">
                  <span className="font-semibold">✓ {seals.length} selos gerados com sucesso!</span>
                  <span className="ml-2 opacity-80">Pronto para impressão.</span>
                </div>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-leve-blue font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {isExporting ? 'Gerando PDF...' : 'Exportar PDF'}
                </button>
              </div>
            </div>
          )}

          {seals.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Visualização</h2>
              <SealGrid
                seals={seals}
                sealsPerPage={SEALS_PER_PAGE}
                showBorders={showBorders}
                zoom={zoom}
                currentPage={safePage}
                onPageChange={setCurrentPage}
                barcodeType="numeric"
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="flex flex-col items-center justify-center gap-4">
                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-gray-500 font-semibold">Nenhum selo gerado</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Preencha tipo, sequência, quantidade e valor para gerar os selos
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
