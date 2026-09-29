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

  const handlePrint = () => {
    if (seals.length === 0) {
      alert('Nenhum selo para imprimir');
      return;
    }
    window.print();
  };

  return (
    <div className="bg-leve-blue text-white p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Zoom Control */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Zoom</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onZoomChange(Math.max(50, zoom - 10))}
              className="px-2 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded"
              disabled={isLoading}
            >
              −
            </button>
            <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
            <button
              onClick={() => onZoomChange(Math.min(200, zoom + 10))}
              className="px-2 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded"
              disabled={isLoading}
            >
              +
            </button>
          </div>
        </div>

        {/* Barcode Type */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Tipo de Código</label>
          <select
            value={barcodeType}
            onChange={(e) => onBarcodeTypeChange(e.target.value as 'numeric' | 'code128')}
            className="px-3 py-1 rounded text-gray-800 text-sm"
            disabled={isLoading}
          >
            <option value="numeric">Numérico</option>
            <option value="code128">Code 128</option>
          </select>
        </div>

        {/* Seals Per Page */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Selos por página</label>
          <select
            value={sealsPerPage}
            onChange={(e) => onSealsPerPageChange(Number(e.target.value))}
            className="px-3 py-1 rounded text-gray-800 text-sm"
            disabled={isLoading}
          >
            <option value={6}>6 (3x2)</option>
            <option value={12}>12 (4x3)</option>
            <option value={22}>22 (11x2)</option>
            <option value={24}>24 (12x2)</option>
          </select>
        </div>

        {/* Borders */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Borda</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showBorders}
              onChange={(e) => onShowBordersChange(e.target.checked)}
              className="w-4 h-4"
              disabled={isLoading}
            />
            <span className="text-sm">Mostrar bordas</span>
          </label>
        </div>
      </div>

      {/* Buttons Row */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={handleExportPdf}
          disabled={seals.length === 0 || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white text-leve-blue font-semibold rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Exportar PDF
        </button>
        <button
          onClick={handlePrint}
          disabled={seals.length === 0 || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white text-leve-blue font-semibold rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h10a2 2 0 002-2v-2a2 2 0 00-2-2h-2m-4-4V9m0 4v6m0 0v2m0-2v-2" />
          </svg>
          Imprimir
        </button>
      </div>

      {/* Status Summary */}
      {seals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white border-opacity-20 text-sm">
          <span className="font-semibold">✓ {seals.length} selos carregados com sucesso!</span>
          <span className="ml-2 opacity-80">Pronto para impressão.</span>
        </div>
      )}
    </div>
  );
};
