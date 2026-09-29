# LEVÉ Gerador de Selos

Solução rápida, prática e segura para geração de selos de liberação LEVÉ Mobilidade.

## Características

- ✅ Upload de arquivo TXT com drag-and-drop
- ✅ Suporte a dois formatos: apenas código ou código + convênio
- ✅ Layout personalizado de selos (7cm × 2.5cm)
- ✅ Pré-visualização em tempo real com zoom
- ✅ Geração de PDF para impressão em alta qualidade
- ✅ Múltiplas opções de layout (6, 12, 22 ou 24 selos por página)
- ✅ Código de barras automático (Code 128 ou numérico)
- ✅ Impressão direta do navegador
- ✅ Interface responsiva e intuitiva

## Tecnologias

- **Frontend:** React 18, TypeScript
- **Styling:** Tailwind CSS
- **PDF:** jsPDF
- **Código de Barras:** JsBarcode
- **Upload:** react-dropzone
- **Build:** Vite

## Instalação

### Pré-requisitos

- Node.js 16+ e npm (ou yarn/pnpm)

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/leve-selos.git
cd leve-selos
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

A aplicação será aberta automaticamente em http://localhost:5173

4. **Build para produção**
```bash
npm run build
npm run preview
```

## Uso

### 1. Preparar o arquivo TXT

Crie um arquivo de texto com os códigos de liberação. Dois formatos são suportados:

**Formato 1: Apenas código**
```
9800010430276
9800010430277
9800010430278
```

**Formato 2: Código + Convênio**
```
9800010430276;LIBERAÇÃO GERÊNCIA - LT12082026
9800010430277;LIBERAÇÃO GERÊNCIA - LT12082026
9800010430278;LIBERAÇÃO GERÊNCIA - LT12082026
```

### 2. Carregar o arquivo

1. Clique na área de upload ou arraste o arquivo TXT
2. O sistema validará automaticamente os códigos (mínimo 10 dígitos numéricos)

### 3. Configurar os parâmetros

- **Convênio/Liberação:** Se não estiver no arquivo, preencha aqui (será aplicado a todos os selos)
- **Tipo de Código:** Escolha entre numérico ou Code 128
- **Selos por página:** 6, 12, 22 ou 24
- **Visualizar bordas:** Marque para ver o contorno de cada selo

### 4. Visualizar

- Use o zoom para aumentar/diminuir a visualização
- Navegue entre as páginas com os botões de paginação

### 5. Exportar ou Imprimir

- **Exportar PDF:** Baixa um arquivo PDF pronto para impressão
- **Imprimir:** Abre a janela de impressão do navegador

## Estrutura do Projeto

```
leve-selos/
├── src/
│   ├── components/
│   │   ├── Seal.tsx              # Componente individual do selo
│   │   ├── SealGrid.tsx          # Grade de selos com paginação
│   │   ├── UploadBox.tsx         # Área de upload com drag-and-drop
│   │   └── Toolbar.tsx           # Controles e botões de ação
│   ├── utils/
│   │   ├── parseTxt.ts           # Parser de arquivo TXT
│   │   ├── barcode.ts            # Geração de código de barras
│   │   └── generatePdf.ts        # Geração de PDF
│   ├── App.tsx                   # Componente principal
│   ├── main.tsx                  # Entry point React
│   └── index.css                 # Estilos globais
├── index.html                    # Template HTML
├── package.json                  # Dependências e scripts
├── tsconfig.json                 # Configuração TypeScript
├── vite.config.ts                # Configuração Vite
├── tailwind.config.js            # Configuração Tailwind
├── postcss.config.js             # Configuração PostCSS
└── README.md                     # Este arquivo
```

## Especificações dos Selos

- **Dimensões:** 7.0 cm × 2.5 cm (198 × 71 px)
- **Logo:** Fixo à esquerda (LEVÉ Mobilidade)
- **Código:** Centralizado, 16pt, negrito
- **Convênio:** Centralizado, 6pt
- **Borda:** Impressão configurável

## Validação de Códigos

- Mínimo 10 dígitos numéricos
- Códigos inválidos são automaticamente filtrados
- Sistema avisa quantos códigos foram rejeitados

## Impressão

### Recomendações

1. **Papel:** A4, 80g/m²
2. **Modo:** Preto e branco ou cores
3. **Margem:** 10mm em todos os lados (já configurado)
4. **Escala:** 100% (não fazer zoom no navegador)

### Passos

1. Clique em "Imprimir" ou use Ctrl+P / Cmd+P
2. Selecione sua impressora
3. Verifique as margens (10mm recomendado)
4. Imprima!

## Formatos de Exportação

- **PDF:** Compatível com qualquer leitor de PDF
- **Impressão:** Otimizado para impressoras padrão A4

## Troubleshooting

### Códigos não são reconhecidos

Verifique se:
- Tem pelo menos 10 dígitos
- São apenas números (sem espaços ou caracteres especiais)
- Não há linhas vazias no arquivo

### PDF não abre

- Verifique se seu navegador suporta download de arquivos
- Tente atualizar a página e fazer upload novamente
- Teste em outro navegador

### Impressão sai fora do alinhamento

- Verifique as margens da impressora (10mm)
- Desabilite "Mais configurações" > "Cabeçalhos e rodapés"
- Teste com 100% de escala (não zoom)

## Suporte

Para reportar bugs ou sugerir melhorias, abra uma issue no repositório.

## Licença

MIT

---

**LEVÉ Mobilidade** © 2024
