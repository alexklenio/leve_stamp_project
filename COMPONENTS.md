# Documentação dos Componentes

## Componentes React

### UploadBox

Área de upload com drag-and-drop para arquivo TXT.

```tsx
<UploadBox 
  onFileUpload={(content: string) => {}}
  isLoading?: boolean
/>
```

**Props:**
- `onFileUpload(content)` - Callback acionado quando arquivo é carregado
- `isLoading` - Desabilita upload durante processamento

---

### Seal

Componente visual de um único selo.

```tsx
<Seal 
  seal={{
    id: string
    codigo: string
    convenio?: string
  }}
  showBorders?: boolean
  barcodeType?: 'numeric' | 'code128'
/>
```

**Props:**
- `seal` - Objeto com dados do selo
- `showBorders` - Mostrar borda ao redor do selo (padrão: true)
- `barcodeType` - Tipo de código de barras

**Dimensões:** 7cm × 2.5cm

---

### SealGrid

Grade de selos com paginação e zoom.

```tsx
<SealGrid 
  seals={Seal[]}
  sealsPerPage?: number
  showBorders?: boolean
  zoom?: number
  currentPage?: number
  onPageChange?: (page: number) => void
/>
```

**Props:**
- `seals` - Array de selos para exibir
- `sealsPerPage` - Quantidade por página (padrão: 22)
- `showBorders` - Exibir bordas (padrão: true)
- `zoom` - Nível de zoom em % (padrão: 100)
- `currentPage` - Página atual (padrão: 1)
- `onPageChange` - Callback ao mudar página

---

### Toolbar

Controles para zoom, exportação, impressão e configurações.

```tsx
<Toolbar 
  seals={Seal[]}
  zoom={number}
  onZoomChange={(zoom: number) => {}}
  showBorders={boolean}
  onShowBordersChange={(show: boolean) => {}}
  barcodeType={'numeric' | 'code128'}
  onBarcodeTypeChange={(type: string) => {}}
  sealsPerPage={number}
  onSealsPerPageChange={(count: number) => {}}
  convenio?: string
  onConvenioChange?: (convenio: string) => {}}
  isLoading?: boolean
/>
```

---

## Utilitários

### parseTxt

Parse de arquivo TXT para array de selos.

```tsx
import { parseTxt, validateSeals, isValidCode } from '@/utils/parseTxt'

// Parsear arquivo
const seals = parseTxt(fileContent)

// Validar selos
const { valid, invalid } = validateSeals(seals)

// Validar código individual
const isValid = isValidCode('9800010430276')
```

**Formatos suportados:**
```
9800010430276
9800010430276;CONVÊNIO
```

---

### barcode

Geração de código de barras.

```tsx
import { generateBarcode, generateBarcodes } from '@/utils/barcode'

// Gerar barcode individual
const barcodeImage = generateBarcode('9800010430276', 'code128')

// Gerar múltiplos
const barcodes = await generateBarcodes(['9800010430276', '9800010430277'], 'code128')
```

---

### generatePdf

Geração de PDF para impressão.

```tsx
import { generatePdf, generatePdfPreview } from '@/utils/generatePdf'

// Exportar PDF
await generatePdf(seals, {
  sealsPerPage: 22,
  showBorders: true,
  barcodeType: 'code128'
})

// Preview como Blob
const pdfBlob = await generatePdfPreview(seals, true)
```

**Opções:**
- `sealsPerPage` - 6, 12, 22 ou 24
- `showBorders` - Exibir bordas
- `barcodeType` - 'numeric' ou 'code128'

---

## Tipos

### Seal

```typescript
interface Seal {
  id: string           // Identificador único
  codigo: string       // Código de liberação (mínimo 10 dígitos)
  convenio?: string    // Convênio/liberação (opcional)
}
```

---

## Styling

A aplicação usa Tailwind CSS com tema LEVÉ:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'leve-blue': '#003366'  // Azul LEVÉ
    }
  }
}
```

---

## Exemplo de Uso Completo

```tsx
import { useState } from 'react'
import { parseTxt, validateSeals } from '@/utils/parseTxt'
import { generatePdf } from '@/utils/generatePdf'
import { UploadBox } from '@/components/UploadBox'
import { SealGrid } from '@/components/SealGrid'
import { Toolbar } from '@/components/Toolbar'

export default function MyApp() {
  const [seals, setSeals] = useState([])
  const [page, setPage] = useState(1)

  const handleUpload = (content) => {
    const parsed = parseTxt(content)
    const { valid } = validateSeals(parsed)
    setSeals(valid)
  }

  const handleExport = async () => {
    await generatePdf(seals)
  }

  return (
    <div>
      <UploadBox onFileUpload={handleUpload} />
      <Toolbar seals={seals} />
      <SealGrid 
        seals={seals} 
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  )
}
```
