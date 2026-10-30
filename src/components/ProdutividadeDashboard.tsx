import { useMemo, useState } from 'react';
import { PRODUTIVIDADE_CONFIG } from '../config/produtividade';
import { useSheetData } from '../hooks/useSheetData';
import { pad2 } from '../utils/audienciasSheet';
import {
  aggregate,
  applyFilters,
  buildProdExport,
  buildProdRows,
  EMPTY_FILTERS,
  filterOptions,
  Filters,
  hasActiveFilters,
  MONTH_NAMES,
  motivoColor,
} from '../utils/produtividadeData';
import { buildXlsx, downloadXlsx } from '../utils/xlsxExport';
import MultiSelect from './MultiSelect';
import { KpiCard, PieChartCard, StackedBarsCard, StackedColumnsCard } from './ProdutividadeCharts';

const PAGE_SIZE = 100;

export default function ProdutividadeDashboard() {
  const { data, error, loading, refreshing, lastUpdated, configured, refresh } = useSheetData(
    PRODUTIVIDADE_CONFIG,
    PRODUTIVIDADE_CONFIG.refreshIntervalMs
  );

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const built = useMemo(() => (data ? buildProdRows(data, PRODUTIVIDADE_CONFIG) : null), [data]);
  const options = useMemo(() => filterOptions(built ? built.rows : []), [built]);
  const filtered = useMemo(
    () => (built ? applyFilters(built.rows, filters) : []),
    [built, filters]
  );
  // Colours follow the order of ALL motivos, so they don't change when filtering.
  const aggregates = useMemo(() => aggregate(filtered, options.motivos), [filtered, options.motivos]);

  const filtering = hasActiveFilters(filters);

  const updateFilters = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setLimit(PAGE_SIZE);
  };
  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setLimit(PAGE_SIZE);
  };

  // Exports the table exactly as filtered now: everything when no filter is active,
  // otherwise only the filtered rows (all of them, not just the ones loaded on screen).
  const handleExport = () => {
    if (!built || filtered.length === 0) return;
    try {
      const sheets = buildProdExport(built, filtered, filters);
      const today = new Date();
      const stamp = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
      downloadXlsx(buildXlsx(sheets), `produtividade${filtering ? '_filtrado' : ''}_${stamp}.xlsx`);
    } catch (err) {
      console.error('Erro ao exportar .xlsx:', err);
      alert('Não foi possível gerar o arquivo .xlsx.');
    }
  };

  const updatedText = lastUpdated
    ? `Atualizado às ${pad2(lastUpdated.getHours())}:${pad2(lastUpdated.getMinutes())}`
    : '';

  // Which of the four filter columns the sheet is missing (so the user knows what to configure).
  const missing: string[] = [];
  if (built) {
    if (!built.map.auditor) missing.push('AUDITOR');
    if (!built.map.motivo) missing.push('MOTIVO');
    if (options.months.length === 0) missing.push('MÊS');
    if (options.years.length === 0) missing.push('ANO');
  }

  const shownRows = filtered.slice(0, limit);

  // ------------------------------------------------------------------ render
  return (
    <div className="max-w-7xl mx-auto px-6 pb-6">
      {/* Title + actions */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Produtividade</h1>
          <p className="text-sm text-gray-500">
            Indicadores do setor, direto da planilha
            {updatedText && <> · {updatedText} · atualiza sozinho</>}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={!configured || refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {/* Not configured */}
      {!configured && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-900">
          <p className="font-bold mb-1">Falta ligar a dashboard à planilha</p>
          <p>
            Preencha o <span className="font-mono">sheetId</span> em{' '}
            <span className="font-mono">src/config/produtividade.ts</span>.
          </p>
        </div>
      )}

      {configured && loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          Carregando dados da planilha...
        </div>
      )}

      {/* Error */}
      {configured && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-800 mb-6">
          <p className="font-bold mb-1">Não foi possível ler a planilha</p>
          <p>{error}</p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-xs">
            <li>
              O compartilhamento precisa estar como <b>Qualquer pessoa com o link: Leitor</b>.
            </li>
            <li>
              Se a planilha for um arquivo do <b>Excel (.xlsx)</b> aberto no Google Planilhas
              (aparece ".XLSX" ao lado do nome), ela precisa ser convertida: <b>Arquivo → Salvar
              como Planilha Google</b>. Depois, troque o <span className="font-mono">sheetId</span> e o{' '}
              <span className="font-mono">sheetGid</span> em{' '}
              <span className="font-mono">src/config/produtividade.ts</span> pelos da nova planilha.
            </li>
          </ul>
          {data && <p className="mt-3 text-xs">Exibindo os últimos dados carregados.</p>}
        </div>
      )}

      {configured && data && built && (
        <>
          {/* Filter strip */}
          <div className="bg-white rounded-lg shadow-md p-5 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MultiSelect
                label="Auditor"
                options={options.auditors.map((a) => ({ value: a, label: a }))}
                selected={filters.auditors}
                onChange={(auditors) => updateFilters({ auditors })}
                disabled={!built.map.auditor}
              />
              <MultiSelect
                label="Motivo"
                options={options.motivos.map((m) => ({ value: m, label: m }))}
                selected={filters.motivos}
                onChange={(motivos) => updateFilters({ motivos })}
                disabled={!built.map.motivo}
              />
              <MultiSelect
                label="Mês"
                options={options.months.map((m) => ({ value: m, label: MONTH_NAMES[m - 1] }))}
                selected={filters.months}
                onChange={(months) => updateFilters({ months })}
                disabled={options.months.length === 0}
              />
              <MultiSelect
                label="Ano"
                options={options.years.map((y) => ({ value: y, label: String(y) }))}
                selected={filters.years}
                onChange={(years) => updateFilters({ years })}
                disabled={options.years.length === 0}
              />
            </div>

            {/* Search by collaborator name */}
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Colaborador</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => updateFilters({ name: e.target.value })}
                  placeholder="Buscar pelo nome do colaborador"
                  className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue ${
                    filters.name.trim() !== '' ? 'border-leve-blue' : 'border-gray-300'
                  }`}
                />
                {filters.name !== '' && (
                  <button
                    type="button"
                    onClick={() => updateFilters({ name: '' })}
                    aria-label="Limpar busca por nome"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {!built.map.name && (
                <p className="mt-1 text-xs text-amber-700">
                  Não encontrei a coluna do colaborador: a busca olha todas as colunas. Informe o nome
                  dela em <span className="font-mono">nameColumn</span> (src/config/produtividade.ts).
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100 text-sm">
              <p className="text-gray-500">
                Mostrando <b className="text-gray-800">{filtered.length.toLocaleString('pt-BR')}</b> de{' '}
                {built.rows.length.toLocaleString('pt-BR')} registros
              </p>
              <div className="flex items-center gap-4">
                {filtering && (
                  <button
                    onClick={clearFilters}
                    className="font-semibold text-red-600 hover:text-red-800"
                  >
                    Limpar filtros
                  </button>
                )}
                <button
                  onClick={handleExport}
                  disabled={filtered.length === 0}
                  title={
                    filtering
                      ? `Exporta os ${filtered.length.toLocaleString('pt-BR')} registros filtrados`
                      : `Exporta todos os ${filtered.length.toLocaleString('pt-BR')} registros`
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-leve-blue text-white rounded-lg font-semibold hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                  </svg>
                  Exportar .xlsx
                </button>
              </div>
            </div>

            {missing.length > 0 && (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                Não encontrei na planilha: <b>{missing.join(', ')}</b>. Informe o nome (ou a letra) da
                coluna em <span className="font-mono">src/config/produtividade.ts</span>.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Data table (the big area) */}
            <section className="lg:col-span-2 bg-white rounded-lg shadow-md lg:sticky lg:top-4">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">
                  Registros{' '}
                  <span className="text-sm font-medium text-gray-400">
                    ({filtered.length.toLocaleString('pt-BR')})
                  </span>
                </h2>
              </div>

              {filtered.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-16">
                  Nenhum registro para os filtros selecionados.
                </p>
              ) : (
                <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 9rem)' }}>
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                      <tr>
                        {built.columns.map((column) => (
                          <th
                            key={column.label}
                            className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-500 whitespace-nowrap border-b border-gray-200"
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shownRows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          {built.columns.map((column) => {
                            const text = row.cells[column.label] ?? '';
                            const isMotivo = built.map.motivo === column;
                            return (
                              <td
                                key={column.label}
                                className="px-3 py-2 border-b border-gray-100 text-gray-800 align-top"
                              >
                                {isMotivo && text !== '' ? (
                                  <span className="flex items-center gap-2 whitespace-nowrap">
                                    <span
                                      className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                                      style={{ backgroundColor: motivoColor(options.motivos, row.motivo) }}
                                    />
                                    {text}
                                  </span>
                                ) : (
                                  text
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filtered.length > limit && (
                    <div className="flex items-center justify-center gap-4 py-4 text-sm">
                      <span className="text-gray-500">
                        {limit.toLocaleString('pt-BR')} de {filtered.length.toLocaleString('pt-BR')}
                      </span>
                      <button
                        onClick={() => setLimit((l) => l + PAGE_SIZE)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700"
                      >
                        Mostrar mais
                      </button>
                      <button
                        onClick={() => setLimit(filtered.length)}
                        className="font-semibold text-leve-blue hover:text-blue-900"
                      >
                        Mostrar todos
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Charts */}
            <div className="flex flex-col gap-6">
              <KpiCard
                title={filtering ? 'TOTAL DE JUSTAS NO FILTRO' : 'TOTAL GERAL DE JUSTAS DO SETOR'}
                value={aggregates.total}
              />
              <PieChartCard
                title="DISTRIBUIÇÃO POR ALÍNEA"
                data={aggregates.byMotivo}
                order={options.motivos}
              />
              <StackedColumnsCard
                title="DISTRIBUIÇÃO - ANO x ALÍNEA"
                groups={aggregates.byYear}
                order={options.motivos}
              />
              <StackedBarsCard
                title="DISTRIBUIÇÃO POR AUDITOR"
                groups={aggregates.byAuditor}
                order={options.motivos}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
