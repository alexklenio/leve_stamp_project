import { useMemo, useState } from 'react';

interface WhatsappAdvertenciaFormProps {
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** "yyyy-mm-dd" (date input) -> "dd/mm/yyyy" */
function toBrDate(isoDate: string): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

/** Applies the 000.000.000-00 mask while typing (digits only, max 11). */
function formatCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/**
 * Turns what the user typed ("B, E", "B e E", "b,h,e") into the format used in
 * the message: “B” e “E”  /  “B”, “H” e “E”. If the text isn't a list of
 * single letters (a–l), it is kept exactly as typed.
 */
function formatLetras(raw: string): { text: string; plural: boolean } {
  const trimmed = raw.trim();
  if (!trimmed) return { text: '', plural: true };

  const tokens = trimmed.split(/[\s,;/&]+/).filter(Boolean);
  // A lowercase "e" between two other tokens is the conjunction ("B e E").
  const candidates = tokens.filter((t, i) => !(t === 'e' && i > 0 && i < tokens.length - 1));

  if (candidates.length === 0 || !candidates.every((t) => /^[a-lA-L]$/.test(t))) {
    return { text: trimmed, plural: true };
  }

  const letters = Array.from(new Set(candidates.map((t) => t.toUpperCase())));
  const quoted = letters.map((l) => `“${l}”`);
  const text =
    quoted.length === 1
      ? quoted[0]
      : `${quoted.slice(0, -1).join(', ')} e ${quoted[quoted.length - 1]}`;

  return { text, plural: quoted.length > 1 };
}

interface MessageData {
  nome: string;
  assunto: string;
  cpf: string;
  operacao: string;
  dataOcorrencia: string; // dd/mm/yyyy
  ocorrencias: string[];
  atos: string;
  letras: string;
  dataEnvio: string; // dd/mm/yyyy
}

const BLANK = '____';
const BLANK_DATE = '__/__/____';

/** Builds the full WhatsApp message. Used for BOTH the preview and the copy. */
function buildMessage(d: MessageData): string {
  const items = d.ocorrencias.map((o) => o.trim()).filter(Boolean);
  const bullets = (items.length > 0 ? items : [BLANK]).map((item) => `· ${item}`).join('\n\n');

  const { text: letrasText, plural } = formatLetras(d.letras);

  return [
    `Olá, ${d.nome.trim() || BLANK}, tudo bem?\nAqui falo em nome da Auditoria da Leve Mobilidade.`,
    `Assunto: ${d.assunto.trim() || BLANK}\nCPF do Colaborador: ${d.cpf || BLANK}\nOperação: ${d.operacao.trim() || BLANK}`,
    'Estou entrando em contato para lembrá-lo sobre a importância de seguir as orientações do nosso Manual de Conduta, que é uma ferramenta essencial para garantir o bom funcionamento da nossa empresa e o cumprimento das normas estabelecidas.',
    `Identificamos que no dia ${d.dataOcorrencia || BLANK_DATE}:`,
    bullets,
    `Assim, cometido o(s) ato(s) de ${d.atos.trim() || BLANK} e infringido o dispositivo legal ${plural ? 'das letras' : 'da letra'} ${letrasText || BLANK} do Artigo 482 da CLT-Consolidação das Leis do Trabalho.`,
    'Contamos com sua colaboração para garantir que todos os procedimentos da empresa sejam seguidos corretamente.',
    'Caso tenha alguma dúvida ou precise reforçar os procedimentos e bons hábitos na operação por favor procurar o supervisor responsável.',
    `Atenciosamente,\nAuditoria da Leve Mobilidade\n${d.dataEnvio || BLANK_DATE}`,
    'Por gentileza, declarar recebimento da ação disciplinar',
  ].join('\n\n');
}

/** Clipboard copy with a fallback for browsers/contexts without the Clipboard API. */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy approach below
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue';
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WhatsappAdvertenciaForm({ onBack }: WhatsappAdvertenciaFormProps) {
  const [nome, setNome] = useState('');
  const [assunto, setAssunto] = useState('');
  const [cpf, setCpf] = useState('');
  const [operacao, setOperacao] = useState('');
  const [dataOcorrenciaIso, setDataOcorrenciaIso] = useState('');
  const [ocorrencias, setOcorrencias] = useState<string[]>(['']);
  const [atos, setAtos] = useState('');
  const [letras, setLetras] = useState('');
  const [dataEnvioIso, setDataEnvioIso] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const message = useMemo(
    () =>
      buildMessage({
        nome,
        assunto,
        cpf,
        operacao,
        dataOcorrencia: toBrDate(dataOcorrenciaIso),
        ocorrencias,
        atos,
        letras,
        dataEnvio: toBrDate(dataEnvioIso),
      }),
    [nome, assunto, cpf, operacao, dataOcorrenciaIso, ocorrencias, atos, letras, dataEnvioIso]
  );

  const updateOcorrencia = (index: number, value: string) =>
    setOcorrencias((prev) => prev.map((o, i) => (i === index ? value : o)));
  const addOcorrencia = () => setOcorrencias((prev) => [...prev, '']);
  const removeOcorrencia = (index: number) =>
    setOcorrencias((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const handleCopy = async () => {
    const ok = await copyToClipboard(message);
    setCopyState(ok ? 'copied' : 'error');
    setTimeout(() => setCopyState('idle'), 2500);
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
        <h1 className="text-lg font-bold text-gray-800">Advertência via WhatsApp</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: form */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Dados do Colaborador</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Nome do Colaborador" value={nome} onChange={setNome} />
              </div>
              <Field label="CPF do Colaborador" value={cpf} onChange={(v) => setCpf(formatCpf(v))} />
              <Field label="Operação" value={operacao} onChange={setOperacao} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Dados da Advertência</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Assunto" value={assunto} onChange={setAssunto} />
              </div>
              <Field label="Data da Ocorrência" value={dataOcorrenciaIso} onChange={setDataOcorrenciaIso} type="date" />
              <Field label="Data do Envio" value={dataEnvioIso} onChange={setDataEnvioIso} type="date" />
              <div className="sm:col-span-2">
                <Field label="Atos cometidos" value={atos} onChange={setAtos} />
              </div>
              <div className="sm:col-span-2">
                <Field label="Letras do Artigo 482" value={letras} onChange={setLetras} />
                <p className="text-xs text-gray-500 mt-1">
                  Separe por vírgula (ex.: B, E). O texto coloca as aspas e o "e" automaticamente.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ocorrências</h3>
            <div className="flex flex-col gap-4">
              {ocorrencias.map((ocorrencia, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Ocorrência {index + 1}
                    </label>
                    {ocorrencias.length > 1 && (
                      <button
                        onClick={() => removeOcorrencia(index)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <textarea
                    value={ocorrencia}
                    onChange={(e) => updateOcorrencia(index, e.target.value)}
                    rows={4}
                    className={`${inputClass} resize-y`}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={addOcorrencia}
              className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-leve-blue hover:text-blue-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar ocorrência
            </button>
          </div>
        </div>

        {/* Right: message preview + copy */}
        <div className="lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-gray-800">Mensagem</h2>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                  copyState === 'copied'
                    ? 'bg-green-600'
                    : copyState === 'error'
                    ? 'bg-red-600'
                    : 'bg-leve-blue hover:bg-blue-900'
                }`}
              >
                {copyState === 'copied' ? (
                  <>✓ Copiado!</>
                ) : copyState === 'error' ? (
                  <>Não foi possível copiar</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar texto
                  </>
                )}
              </button>
            </div>

            <div
              className="bg-[#005c4b] text-white rounded-lg p-4 overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 14rem)' }}
            >
              <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-relaxed">
                {message}
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              O texto é copiado exatamente como aparece acima, pronto para colar no WhatsApp.
              Campos em branco aparecem como ____.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
