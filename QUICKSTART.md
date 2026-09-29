# Quick Start — LEVÉ Gerador de Selos

## Instalação Rápida (1 minuto)

```bash
npm install
npm run dev
```

A aplicação abrirá automaticamente em http://localhost:5173

## Usar (3 minutos)

### Opção 1: Usar arquivo de exemplo

1. Clique na área de upload ou arraste `sample.txt`
2. Clique em "Exportar PDF"
3. Pronto! ✅

### Opção 2: Criar seu próprio arquivo

**Passo 1:** Criar arquivo `meus-codigos.txt` com:
```
9800010430276;LIBERAÇÃO GERÊNCIA - LT12082026
9800010430277;LIBERAÇÃO GERÊNCIA - LT12082026
9800010430278;LIBERAÇÃO GERÊNCIA - LT12082026
```

**Passo 2:** Carregar no navegador

**Passo 3:** Clique em "Exportar PDF" ou "Imprimir"

## Formatos Suportados

### Apenas código:
```
9800010430276
9800010430277
9800010430278
```

### Código + Convênio:
```
9800010430276;LIBERAÇÃO GERÊNCIA - LT12082026
9800010430277;LIBERAÇÃO GERÊNCIA - LT12082026
```

## Validação

✅ Mínimo 10 dígitos numéricos por código
✅ Códigos inválidos são automaticamente filtrados
✅ Sistema avisa quantos foram rejeitados

## Tudo Pronto!

- PDF: Salvo como `selos_leve.pdf`
- Impressão: Use Ctrl+P ou Cmd+P

## Problemas?

Veja [README.md](./README.md) → Troubleshooting
