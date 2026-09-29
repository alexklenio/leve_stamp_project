import React, { useEffect, useRef } from 'react';
import { Seal as SealType } from '../utils/parseTxt';
import JsBarcode from 'jsbarcode';

interface SealProps {
  seal: SealType;
  showBorders?: boolean;
  barcodeType?: 'numeric' | 'code128';
}

export const Seal: React.FC<SealProps> = ({ 
  seal, 
  showBorders = true,
  barcodeType = 'code128' 
}) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, seal.codigo, {
          format: 'CODE128',
          width: 1.5,
          height: 30,
          displayValue: false,
          margin: 0,
        });
      } catch (error) {
        console.error('Error rendering barcode:', error);
      }
    }
  }, [seal.codigo]);

  // Seal dimensions: 7cm × 2.5cm = 198.4px × 70.9px at 72 DPI
  const sealWidth = 198; // pixels for 7cm
  const sealHeight = 71; // pixels for 2.5cm

  return (
    <div
      className={`bg-white inline-block ${showBorders ? 'border border-gray-300' : ''}`}
      style={{
        width: `${sealWidth}px`,
        height: `${sealHeight}px`,
      }}
    >
      <div className="flex items-center h-full px-3 gap-2">
        {/* Logo */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="text-xs font-bold text-leve-blue" style={{ fontSize: '10px' }}>
            LEVÉ
          </div>
          <div className="text-xs text-leve-blue" style={{ fontSize: '6px', lineHeight: 1 }}>
            MOBILIDADE
          </div>
        </div>

        {/* Code and Convenio */}
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
          <div
            className="font-bold text-black text-center leading-none"
            style={{ fontSize: '14px' }}
          >
            {seal.codigo}
          </div>
          {seal.convenio && (
            <div
              className="text-gray-700 text-center leading-none"
              style={{ fontSize: '5px' }}
            >
              {seal.convenio.length > 35
                ? `${seal.convenio.substring(0, 32)}...`
                : seal.convenio}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Preview component for tooltip/modal
export const SealPreview: React.FC<SealProps> = ({ seal, showBorders, barcodeType }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <Seal seal={seal} showBorders={showBorders} barcodeType={barcodeType} />
    </div>
  );
};
