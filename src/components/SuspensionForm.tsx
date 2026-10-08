import { useState } from 'react';
import { generateSuspensionPdf, SuspensionData } from '../utils/generateSuspensionPdf';
import { LEVE_LOGO_BASE64 } from '../assets/leveLogoBase64';

interface SuspensionFormProps {
  onBack: () => void;
}

const EMPTY_DATA: SuspensionData = {
  nomeEmpregado: '',
  ctps: '',
  serie: '',
  funcao: '',
  setorLotacao: '',
  diasSuspensao: '1',
  dataCometimento: '',
  tipoAto: '',
  letraArtigo: '',
  motivo: '',
  dataOcorrido: '',
  dataRetorno: '',
  resumoSuspensao: '',
  local: 'Recife',
  dataDocumento: '',
  razaoSocial: 'Propark Estacionamentos LTDA',
  cnpj: '10.755.459/0034-17',
  testemunha1Nome: '',
  testemunha1Data: '',
  testemunha2Nome: '',
  testemunha2Data: '',
};

// Converts a <input type="date"> value ("yyyy-mm-dd") to "dd/mm/yyyy" for
// display/PDF, since the letter uses the Brazilian date format throughout.
function toBrDate(isoDate: string): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

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
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue"
      />
    </div>
  );
}

export default function SuspensionForm({ onBack }: SuspensionFormProps) {
  // Dates are kept as native <input type="date"> (yyyy-mm-dd) in state for
  // a proper date picker UX, and converted to dd/mm/yyyy only when building
  // the data sent to the PDF / preview.
  const [form, setForm] = useState({
    ...EMPTY_DATA,
    dataCometimentoIso: '',
    dataOcorridoIso: '',
    dataRetornoIso: '',
    dataDocumentoIso: '',
    testemunha1DataIso: '',
    testemunha2DataIso: '',
  });
  const [isExporting, setIsExporting] = useState(false);

  const set = (key: string) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const buildData = (): SuspensionData => ({
    nomeEmpregado: form.nomeEmpregado,
    ctps: form.ctps,
    serie: form.serie,
    funcao: form.funcao,
    setorLotacao: form.setorLotacao,
    diasSuspensao: form.diasSuspensao,
    dataCometimento: toBrDate(form.dataCometimentoIso),
    tipoAto: form.tipoAto,
    letraArtigo: form.letraArtigo,
    motivo: form.motivo,
    dataOcorrido: toBrDate(form.dataOcorridoIso),
    dataRetorno: toBrDate(form.dataRetornoIso),
    resumoSuspensao: form.resumoSuspensao,
    local: form.local,
    dataDocumento: toBrDate(form.dataDocumentoIso),
    razaoSocial: form.razaoSocial,
    cnpj: form.cnpj,
    testemunha1Nome: form.testemunha1Nome,
    testemunha1Data: toBrDate(form.testemunha1DataIso),
    testemunha2Nome: form.testemunha2Nome,
    testemunha2Data: toBrDate(form.testemunha2DataIso),
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await generateSuspensionPdf(buildData());
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const data = buildData();

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
        <h1 className="text-lg font-bold text-gray-800">Carta de Suspensão Disciplinar</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="flex flex-col gap-6">
          {/* Dados do Funcionário */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Dados do Funcionário</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <Field label="Nome do Empregado" value={form.nomeEmpregado} onChange={set('nomeEmpregado')} />
              </div>
              <Field label="CTPS" value={form.ctps} onChange={set('ctps')} />
              <Field label="Série" value={form.serie} onChange={set('serie')} />
              <div className="sm:col-span-2">
                <Field label="Função" value={form.funcao} onChange={set('funcao')} />
              </div>
              <div className="sm:col-span-2">
                <Field label="Setor / Lotação" value={form.setorLotacao} onChange={set('setorLotacao')} />
              </div>
            </div>
          </div>

          {/* Dados da Suspensão */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Dados da Suspensão</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Dias de Suspensão" value={form.diasSuspensao} onChange={set('diasSuspensao')} type="number" />
              <Field label="Data do Cometimento (desde)" value={form.dataCometimentoIso} onChange={set('dataCometimentoIso')} type="date" />
              <div className="sm:col-span-2">
                <Field label="Tipo de Ato / Procedimento" value={form.tipoAto} onChange={set('tipoAto')} />
              </div>
              <Field label="Letra do Artigo 482" value={form.letraArtigo} onChange={set('letraArtigo')} />
              <div className="sm:col-span-2">
                <Field label="Motivo da Suspensão" value={form.motivo} onChange={set('motivo')} />
              </div>
              <Field label="Data de Ocorrência do Fato" value={form.dataOcorridoIso} onChange={set('dataOcorridoIso')} type="date" />
              <Field label="Data de Retorno" value={form.dataRetornoIso} onChange={set('dataRetornoIso')} type="date" />
              <div className="sm:col-span-2">
                <Field label="Resumo da Suspensão" value={form.resumoSuspensao} onChange={set('resumoSuspensao')} />
              </div>
            </div>
          </div>

          {/* Local, Data e Empresa */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Local, Data e Empresa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Local" value={form.local} onChange={set('local')} />
              <Field label="Data do Documento" value={form.dataDocumentoIso} onChange={set('dataDocumentoIso')} type="date" />
              <div className="sm:col-span-2">
                <Field label="Razão Social" value={form.razaoSocial} onChange={set('razaoSocial')} />
              </div>
              <Field label="CNPJ" value={form.cnpj} onChange={set('cnpj')} />
            </div>
          </div>

          {/* Testemunhas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Testemunhas (opcional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Testemunha 1 — Nome" value={form.testemunha1Nome} onChange={set('testemunha1Nome')} />
              <Field label="Testemunha 1 — Data" value={form.testemunha1DataIso} onChange={set('testemunha1DataIso')} type="date" />
              <Field label="Testemunha 2 — Nome" value={form.testemunha2Nome} onChange={set('testemunha2Nome')} />
              <Field label="Testemunha 2 — Data" value={form.testemunha2DataIso} onChange={set('testemunha2DataIso')} type="date" />
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-leve-blue text-white font-semibold rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {isExporting ? 'Gerando PDF...' : 'Exportar PDF'}
          </button>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Pré-visualização</h2>
            <div className="text-[12px] leading-relaxed text-gray-900 bg-white">
              {/* Box A — title (centered) + logo */}
              <div className="relative border border-black flex items-center justify-center py-3 mb-1">
                <h3 className="font-bold text-sm text-center">CARTA DE SUSPENSÃO DISCIPLINAR</h3>
                <img
                  src={LEVE_LOGO_BASE64}
                  alt="LEVÉ Mobilidade"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-auto"
                />
              </div>

              {/* Box B — letter body */}
              <div className="border border-black">
                <div className="px-3 py-2 border-b border-black">
                  <p>
                    <span>Sra./Sr.: </span>
                    <span className="font-bold">{data.nomeEmpregado || '—'}</span>
                    <span className="ml-4">CTPS: </span>
                    <span className="font-bold">{data.ctps || '—'}</span>
                    <span className="ml-4">SÉRIE: </span>
                    <span className="font-bold">{data.serie || '—'}</span>
                  </p>
                  <p>
                    <span>Função: </span>
                    <span className="font-bold">{data.funcao || '—'}</span>
                  </p>
                  <p>
                    <span>Setor / Lotação: </span>
                    <span className="font-bold">{data.setorLotacao || '—'}</span>
                  </p>
                </div>

                <div className="px-3 py-3">
                  <p className="font-bold mb-2">
                    Referente à: Suspensão {data.diasSuspensao || '1'} dia(s)
                  </p>
                  <p className="mb-3">
                    Ao Sr. Empregado desta empresa, desde{' '}
                    <span className="font-semibold">{data.dataCometimento || '____/____/____'}</span>{' '}
                    tendo em vista ter cometido o(s) ato(s) de{' '}
                    <span className="font-semibold">{(data.tipoAto || '—').toUpperCase()}</span>,
                    infringindo os dispositivos legais das letras "
                    <span className="font-semibold">{data.letraArtigo || '—'}</span>" do Artigo 482
                    da CLT Consolidação das Leis do Trabalho, resolvemos aplicar-lhe como medida
                    disciplinar, a presente SUSPENSÃO {data.diasSuspensao || '1'} DIA(S) por{' '}
                    <span className="font-semibold">{data.motivo || '—'}</span>, fato ocorrido em{' '}
                    <span className="font-semibold">{data.dataOcorrido || '____/____/____'}</span>.
                  </p>

                  <p>
                    <span>Retornar em: </span>
                    <span className="font-bold">{data.dataRetorno || '—'}</span>
                  </p>
                  <p className="mb-4">
                    <span>Resumo da Suspensão: </span>
                    <span className="font-bold">{data.resumoSuspensao || '—'}</span>
                  </p>

                  <p className="text-center mb-4">
                    {data.local || 'Recife'}
                    {(() => {
                      const [d, m, y] = (data.dataDocumento || '').split('/');
                      const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
                      const mi = parseInt(m, 10);
                      const mesExt = !isNaN(mi) ? meses[mi - 1] : '____';
                      return `, ${d || '__'} de ${mesExt} de ${y || '____'}.`;
                    })()}
                  </p>

                  <p className="text-center font-bold">{data.razaoSocial || '—'}</p>
                  <p className="text-center mb-5">{data.cnpj || '—'}</p>

                  <div className="text-center mb-4">
                    <div className="border-t border-black w-48 mx-auto mb-1" />
                    <p className="font-bold">{data.nomeEmpregado || '—'}</p>
                  </div>

                  <p className="text-xs mb-2">
                    Em caso de recusa do empregado a dar ciência nesta:
                  </p>
                  {[
                    { label: 'Testemunha 1:', nome: data.testemunha1Nome, dt: data.testemunha1Data },
                    { label: 'Testemunha 2:', nome: data.testemunha2Nome, dt: data.testemunha2Data },
                  ].map((t) => (
                    <div key={t.label} className="flex items-end text-xs mb-3">
                      <span className="w-[5.5rem] flex-shrink-0">{t.label}</span>
                      {/* Signature line (fixed width) */}
                      <div className="w-44 sm:w-56 flex-shrink-0 border-b border-black h-5 flex items-end px-1">
                        {t.nome && <strong className="truncate">{t.nome}</strong>}
                      </div>
                      {/* Date: fixed position, right after the signature line */}
                      <span className="ml-5 flex-shrink-0">Data:</span>
                      <span className="ml-2 flex-shrink-0 w-28">
                        {t.dt ? <strong>{t.dt}</strong> : '____/____/____'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-gray-500 mt-2 text-center">
                O PDF exportado inclui também a transcrição do Artigo 482 da CLT.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
