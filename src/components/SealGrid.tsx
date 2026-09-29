import React, { useState, useMemo } from 'react';
import { Seal as SealType } from '../utils/parseTxt';
import { Seal } from './Seal';

interface SealGridProps {
  seals: SealType[];
  sealsPerPage?: number;
  showBorders?: boolean;
  zoom?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export const SealGrid: React.FC<SealGridProps> = ({
  seals,
  sealsPerPage = 22,
  showBorders = true,
  zoom = 100,
  currentPage = 1,
  onPageChange,
}) => {
  const totalPages = Math.ceil(seals.length / sealsPerPage);
  const startIndex = (currentPage - 1) * sealsPerPage;
  const endIndex = startIndex + sealsPerPage;
  const currentSeals = seals.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange?.(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Grid — the OUTER box has a fixed height and overflow:hidden, so it
          can never grow or bleed past its box no matter what. Scrolling
          happens on the INNER wrapper, and the zoom transform is applied
          only to the wrapper inside that — so zooming only changes the
          seals' visual size, never the footprint this component occupies
          on the page. */}
      <div
        className="bg-white rounded-lg shadow-sm"
        style={{ height: '70vh', overflow: 'hidden' }}
      >
        <div
          className="w-full h-full overflow-auto"
        >
          <div
            className="p-8"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              width: 'fit-content',
            }}
          >
            <div className="grid grid-cols-2 gap-4 w-fit">
              {currentSeals.map((seal) => (
                <div key={seal.id} className="flex justify-center">
                  <Seal seal={seal} showBorders={showBorders} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600 font-semibold">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="text-center text-sm text-gray-600">
        Exibindo {startIndex + 1} a {Math.min(endIndex, seals.length)} de {seals.length} selos
      </div>
    </div>
  );
};
