import { useMemo, useState } from 'react';
import { AUDIENCIAS_CONFIG } from '../config/audiencias';
import { useAudiencias } from '../hooks/useAudiencias';
import {
  buildCompromissos,
  detectColumns,
  displayLabel,
  distinctValues,
  formatForSheet,
  inputKindFor,
  normalize,
  refMatches,
  SheetColumn,
  situationValues,
  submitCompromisso,
} from '../utils/audienciasSheet';

interface NovoCompromissoFormProps {
  /** Goes back to the agenda. */
  onBack: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue';
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';

export default function NovoCompromissoForm({ onBack }: NovoCompromissoFormProps) {
  const { data, error, loading, configured, refresh } = useAudiencias();

  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  // For processes that still have no hearing date ("AG AUDIÊNCIA", "AG SENTENÇA"...).
  const [situacao, setSituacao] = useState('');

  const columns = useMemo(() => (data ? data.columns : []), [data]);
  const map = useMemo(() => detectColumns(columns, AUDIENCIAS_CONFIG), [columns]);

  // The form mirrors the sheet: one field per column, except the ones excluded in the config
  // (listed by header name or column letter).
  const formColumns = useMemo(
    () =>
      columns.filter(
        (c) => !AUDIENCIAS_CONFIG.formExcludedColumns.some((ref) => refMatches(c, ref))
      ),
    [columns]
  );

  const situations = useMemo(() => (data ? situationValues(data, map) : []), [data, map]);

  const suggestions = useMemo(() => {
    const result: Record<string, string[]> = {};
    if (!data) return result;
    formColumns.forEach((c) => {
      if (c.type === 'string' && inputKindFor(c, map) === 'text') {
        const list = distinctValues(data, c.label);
        if (list.length > 0) result[c.label] = list;
      }
    });
    return result;
  }, [data, formColumns, map]);

  // How many rows exist today — shown after saving, to confirm the new one appeared.
  const totalRows = useMemo(
    () => (data ? buildCompromissos(data, AUDIENCIAS_CONFIG).compromissos.length : 0),
    [data]
  );

  const setValue = (label: string, value: string) =>
    setValues((prev) => ({ ...prev, [label]: value }));

  const isDirty = situacao !== '' || Object.values(values).some((v) => v !== '');

  const handleClear = () => {
    if (window.confirm('Limpar todos os campos? Essa ação não pode ser desfeita.')) {
      setValues({});
      setSituacao('');
      setSubmitError(null);
    }
  };

  const dateColumn = map.dateCol;
  const timeColumn = map.timeCol;
  const dateMissing =
    dateColumn !== null && situacao === '' && (values[dateColumn.label] ?? '') === '';

  const handleSituacaoChange = (value: string) => {
    setSituacao(value);
    if (value !== '') {
      // A situation takes the place of the date and time.
      setValues((prev) => {
        const next = { ...prev };
        if (dateColumn) next[dateColumn.label] = '';
        if (timeColumn) next[timeColumn.label] = '';
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    if (dateMissing) {
      setSubmitError(
        situations.length > 0
          ? `Informe a data (${displayLabel(dateColumn ? dateColumn.label : 'data')}) ou escolha uma situação antes de registrar.`
          : `Preencha o campo "${displayLabel(dateColumn ? dateColumn.label : 'data')}" antes de registrar.`
      );
      return;
    }

    const payload: Record<string, string> = {};
    formColumns.forEach((col: SheetColumn) => {
      const raw = values[col.label] ?? '';
      if (raw !== '') payload[col.label] = formatForSheet(col, inputKindFor(col, map), raw);
    });

    // Same pattern the sheet already uses: the situation goes in the date AND time columns.
    if (situacao !== '' && dateColumn) {
      payload[dateColumn.label] = situacao;
      if (timeColumn) payload[timeColumn.label] = situacao;
    }

    if (Object.keys(payload).length === 0) {
      setSubmitError('Preencha pelo menos um campo.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitCompromisso(AUDIENCIAS_CONFIG, payload, columns);
      setSaved(true);
      setValues({});
      setSituacao('');
      refresh(); // read the sheet again so the agenda already shows the new row
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Não foi possível registrar o compromisso.');
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------------ render
  return (
    <div className="max-w-3xl mx-auto px-6 pb-6">
      {/* Back link + title */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-leve-blue hover:text-blue-900 font-semibold text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para a agenda
        </button>
        <span className="text-gray-300">|</span>
        <h1 className="text-lg font-bold text-gray-800">Novo compromisso</h1>
        {isDirty && !saved && (
          <button
            onClick={handleClear}
            className="ml-auto text-sm font-semibold text-red-600 hover:text-red-800"
          >
            Limpar
          </button>
        )}
      </div>

      {!configured && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-900">
          Ligue a dashboard à planilha em <span className="font-mono">src/config/audiencias.ts</span>{' '}
          antes de registrar compromissos (veja <span className="font-mono">AUDIENCIAS_SETUP.md</span>).
        </div>
      )}

      {configured && loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          Carregando as colunas da planilha...
        </div>
      )}

      {configured && !data && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-800">
          <p className="font-bold mb-1">Não foi possível ler a planilha</p>
          <p>{error}</p>
          <button onClick={refresh} className="mt-3 font-semibold underline">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Saved */}
      {configured && data && saved && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-green-800 mb-1">✓ Compromisso registrado na planilha</h2>
          <p className="text-sm text-green-700 mb-4">
            A agenda já foi atualizada ({totalRows} compromissos com data na planilha).
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-leve-blue text-white rounded-lg text-sm font-semibold hover:bg-blue-900"
            >
              Ver a agenda
            </button>
            <button
              onClick={() => setSaved(false)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Registrar outro
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      {configured && data && !saved && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Dados do compromisso</h3>
          <p className="text-xs text-gray-500 mb-5">
            Os campos seguem as colunas da planilha. Ao registrar, uma nova linha é adicionada ao final dela.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dateColumn && situations.length > 0 && (
              <div className="sm:col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className={labelClass}>Situação (quando ainda não há data de audiência)</label>
                <select
                  value={situacao}
                  onChange={(e) => handleSituacaoChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Tem data marcada</option>
                  {situations.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Ao escolher uma situação, ela é gravada nas colunas de data e de hora, como já é feito na planilha.
                </p>
              </div>
            )}

            {formColumns.map((col) => {
              const kind = inputKindFor(col, map);
              const value = values[col.label] ?? '';
              const isDate = dateColumn !== null && col === dateColumn;
              const isTime = timeColumn !== null && col === timeColumn;
              const lockedBySituation = situacao !== '' && (isDate || isTime);
              const listId = `sugestoes-${normalize(col.label).replace(/[^a-z0-9]+/g, '-')}`;

              if (kind === 'checkbox') {
                return (
                  <label key={col.label} className="flex items-center gap-2.5 cursor-pointer sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={value === 'true'}
                      onChange={(e) => setValue(col.label, e.target.checked ? 'true' : '')}
                      className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-700">{displayLabel(col.label)}</span>
                  </label>
                );
              }

              return (
                <div key={col.label} className={kind === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className={labelClass}>
                    {displayLabel(col.label)} {isDate && <span className="text-red-500">*</span>}
                  </label>

                  {kind === 'textarea' ? (
                    <textarea
                      value={value}
                      onChange={(e) => setValue(col.label, e.target.value)}
                      rows={3}
                      className={`${inputClass} resize-y`}
                    />
                  ) : (
                    <input
                      type={
                        kind === 'datetime' ? 'datetime-local' : kind === 'number' ? 'text' : kind
                      }
                      inputMode={kind === 'number' ? 'decimal' : undefined}
                      value={value}
                      onChange={(e) => setValue(col.label, e.target.value)}
                      list={suggestions[col.label] ? listId : undefined}
                      disabled={lockedBySituation}
                      className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-400`}
                    />
                  )}

                  {suggestions[col.label] && (
                    <datalist id={listId}>
                      {suggestions[col.label].map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  )}
                </div>
              );
            })}
          </div>

          {!AUDIENCIAS_CONFIG.scriptUrl.trim() && (
            <p className="mt-5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              A gravação ainda não está ligada: falta preencher <span className="font-mono">scriptUrl</span> em{' '}
              <span className="font-mono">src/config/audiencias.ts</span> (veja{' '}
              <span className="font-mono">AUDIENCIAS_SETUP.md</span>).
            </p>
          )}

          {submitError && (
            <p className="mt-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {submitError}
            </p>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-3 bg-leve-blue text-white font-semibold rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Registrando...' : 'Registrar compromisso'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
