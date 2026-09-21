import React from 'react';
import { generatePdf } from '../utils/generatePdf';
import { Seal } from '../utils/parseTxt';

interface ToolbarProps {
  seals: Seal[];
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showBorders: boolean;
  onShowBordersChange: (show: boolean) => void;
  barcodeType: 'numeric' | 'code128';
  onBarcodeTypeChange: (type: 'numeric' | 'code128') => void;
  sealsPerPage: number;
  onSealsPerPageChange: (count: number) => void;
  convenio?: string;
  onConvenioChange?: (convenio: string) => void;
  isLoading?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  seals,
  zoom,
  onZoomChange,
  showBorders,
  onShowBordersChange,
  barcodeType,
  onBarcodeTypeChange,
  sealsPerPage,
  onSealsPerPageChange,
  convenio = '',
  onConvenioChange,
  isLoading = false,
}) => {
  const handleExportPdf = async () => {
    if (seals.length === 0) {
      alert('Nenhum selo para exportar');
      return;
    }

    try {
      await generatePdf(seals, {
        sealsPerPage,
        showBorders,
        barcodeType,
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF');
    }
  };

  return (
    <div className="bg-leve-blue text-white p-6 rounded-xl shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-6">
        {/* Zoom Control */}
        <div className="flex flex-col gap-3">
          <label className="text-[15px] font-semibold">Zoom</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onZoomChange(Math.max(50, zoom - 10))}
              className="w-9 h-9 flex items-center justify-center bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-lg leading-none"
              disabled={isLoading}
            >
              −
            </button>
            <span className="text-base font-medium w-12 text-center">{zoom}%</span>
            <button
              onClick={() => onZoomChange(Math.min(200, zoom + 10))}
              className="w-9 h-9 flex items-center justify-center bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-lg leading-none"
              disabled={isLoading}
            >
              +
            </button>
          </div>
        </div>

        {/* Barcode Type */}
        <div className="flex flex-col gap-3">
          <label className="text-[15px] font-semibold">Tipo de Código</label>
          <select
            value={barcodeType}
            onChange={(e) => onBarcodeTypeChange(e.target.value as 'numeric' | 'code128')}
            className="px-4 py-2.5 rounded-lg text-gray-800 text-sm"
            disabled={isLoading}
          >
            <option value="numeric">Numérico</option>
            <option value="code128">Code 128</option>
          </select>
        </div>

        {/* Seals Per Page */}
        <div className="flex flex-col gap-3">
          <label className="text-[15px] font-semibold">Selos por página</label>
          <select
            value={sealsPerPage}
            onChange={(e) => onSealsPerPageChange(Number(e.target.value))}
            className="px-4 py-2.5 rounded-lg text-gray-800 text-sm"
            disabled={isLoading}
          >
            <option value={6}>6 (3x2)</option>
            <option value={12}>12 (4x3)</option>
            <option value={22}>22 (11x2)</option>
            <option value={24}>24 (12x2)</option>
          </select>
        </div>

        {/* Borders */}
        <div className="flex flex-col gap-3">
          <label className="text-[15px] font-semibold">Borda</label>
          <label className="flex items-center gap-2.5 cursor-pointer h-[42px]">
            <input
              type="checkbox"
              checked={showBorders}
              onChange={(e) => onShowBordersChange(e.target.checked)}
              className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
              disabled={isLoading}
            />
            <span className="text-sm">Mostrar bordas</span>
          </label>
        </div>
      </div>

      {/* Bottom Row: status on the left, Exportar PDF on the right */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-white border-opacity-20">
        <div className="text-sm">
          {seals.length > 0 && (
            <>
              <span className="font-semibold">✓ {seals.length} selos carregados com sucesso!</span>
              <span className="ml-2 opacity-80">Pronto para impressão.</span>
            </>
          )}
        </div>

        <button
          onClick={handleExportPdf}
          disabled={seals.length === 0 || isLoading}
          className="flex items-center gap-2 px-5 py-3 bg-white text-leve-blue font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Exportar PDF
        </button>
      </div>
    </div>
  );
};
