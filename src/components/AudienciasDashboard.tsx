import { useEffect, useMemo, useState } from 'react';
import { AUDIENCIAS_CONFIG } from '../config/audiencias';
import { useAudiencias } from '../hooks/useAudiencias';
import {
  addDays,
  buildCompromissos,
  Compromisso,
  dayKey,
  displayLabel,
  formatDayLong,
  formatMinutes,
  isSameDay,
  normalize,
  pad2,
  relativeDayLabel,
  startOfDay,
} from '../utils/audienciasSheet';

interface AudienciasDashboardProps {
  onNew: () => void;
}

type CardStatus = 'normal' | 'passou' | 'proximo';
type Range = 7 | 30 | 0; // 0 = all

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

function badgeClass(badge: string): string {
  const key = normalize(badge);
  if (key === 'online') return 'bg-blue-100 text-blue-800';
  if (key === 'presencial') return 'bg-amber-100 text-amber-800';
  return 'bg-gray-100 text-gray-700';
}

function CompromissoCard({ item, status }: { item: Compromisso; status: CardStatus }) {
  const [expanded, setExpanded] = useState(false);
  const visibleDetails = expanded ? item.details : item.details.slice(0, 4);
  const hiddenCount = item.details.length - 4;

  return (
    <div
      className={`flex gap-4 bg-white rounded-lg shadow-md p-4 border ${
        status === 'proximo' ? 'border-leve-blue ring-1 ring-leve-blue' : 'border-gray-100'
      } ${status === 'passou' ? 'opacity-60' : ''}`}
    >
      <div className="flex-shrink-0 w-20 text-center">
        <div
          className={`rounded-lg py-2 ${
            item.minutes !== null ? 'bg-leve-blue text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <span className="text-lg font-bold leading-none">
            {item.minutes !== null ? formatMinutes(item.minutes) : '—'}
          </span>
        </div>
        {item.minutes === null && <p className="text-[10px] text-gray-400 mt-1">Sem horário</p>}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-gray-800 break-words">{item.title}</h4>
          {status === 'proximo' && (
            <span className="flex-shrink-0 text-[10px] font-bold uppercase bg-leve-blue text-white rounded px-2 py-0.5">
              Próximo
            </span>
          )}
          {status === 'passou' && (
            <span className="flex-shrink-0 text-[10px] font-bold uppercase bg-gray-200 text-gray-600 rounded px-2 py-0.5">
              Já passou
            </span>
          )}
        </div>

        {item.subtitle && <p className="text-sm text-gray-600 break-words">{item.subtitle}</p>}

        {item.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.badges.map((badge) => (
              <span
                key={badge}
                className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 ${badgeClass(badge)}`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {visibleDetails.length > 0 && (
          <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {visibleDetails.map((detail) => (
              <div key={detail.label} className="min-w-0">
                <dt className="inline text-gray-500">{displayLabel(detail.label)}: </dt>
                <dd className="inline text-gray-800 font-medium break-words">{detail.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {hiddenCount > 0 && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-2 text-xs font-semibold text-leve-blue hover:text-blue-900"
          >
            {expanded ? 'Mostrar menos' : `Mais detalhes (${hiddenCount})`}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export default function AudienciasDashboard({ onNew }: AudienciasDashboardProps) {
  const { data, error, loading, refreshing, lastUpdated, configured, refresh } = useAudiencias();

  // "now" is re-evaluated every 30s so the "next / already passed" marks stay right.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const [range, setRange] = useState<Range>(0);
  const [search, setSearch] = useState('');

  const built = useMemo(() => (data ? buildCompromissos(data, AUDIENCIAS_CONFIG) : null), [data]);

  const today = startOfDay(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const compromissos = built ? built.compromissos : [];
  const todayItems = compromissos.filter((c) => isSameDay(c.date, today));
  const futureAll = compromissos.filter((c) => c.date.getTime() > today.getTime());
  const next7 = futureAll.filter((c) => c.date.getTime() <= addDays(today, 7).getTime());

  const searchTerm = normalize(search);
  const futureShown = futureAll.filter((c) => {
    if (range !== 0 && c.date.getTime() > addDays(today, range).getTime()) return false;
    if (searchTerm !== '' && !c.searchText.includes(searchTerm)) return false;
    return true;
  });

  // Group the upcoming ones by day (already sorted by date/time).
  const groups: { key: string; date: Date; items: Compromisso[] }[] = [];
  futureShown.forEach((item) => {
    const key = dayKey(item.date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, date: item.date, items: [item] });
  });

  const nextTodayIndex = todayItems.findIndex((c) => c.minutes !== null && c.minutes >= nowMinutes);
  const statusFor = (item: Compromisso, index: number): CardStatus => {
    if (item.minutes !== null && item.minutes < nowMinutes) return 'passou';
    if (index === nextTodayIndex) return 'proximo';
    return 'normal';
  };

  const updatedText = lastUpdated
    ? `Atualizado às ${pad2(lastUpdated.getHours())}:${pad2(lastUpdated.getMinutes())}`
    : '';

  // ------------------------------------------------------------------ render
  return (
    <div className="max-w-7xl mx-auto px-6 pb-6">
      {/* Title + actions */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Audiências e Compromissos</h1>
          <p className="text-sm text-gray-500">
            {formatDayLong(now)}
            {updatedText && <> · {updatedText} · atualiza sozinho</>}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2 bg-leve-blue text-white rounded-lg text-sm font-semibold hover:bg-blue-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo compromisso
          </button>
        </div>
      </div>

      {/* Not configured yet */}
      {!configured && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-900">
          <p className="font-bold mb-1">Falta ligar a dashboard à planilha</p>
          <p>
            Abra o arquivo <span className="font-mono">src/config/audiencias.ts</span> e preencha o{' '}
            <span className="font-mono">sheetId</span> (e a aba). O passo a passo está no arquivo{' '}
            <span className="font-mono">AUDIENCIAS_SETUP.md</span>.
          </p>
        </div>
      )}

      {/* Loading / error */}
      {configured && loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          Carregando compromissos...
        </div>
      )}

      {configured && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-800 mb-6">
          <p className="font-bold mb-1">Não foi possível atualizar os compromissos</p>
          <p>{error}</p>
          {data && <p className="mt-2 text-xs">Exibindo os últimos dados carregados.</p>}
        </div>
      )}

      {/* Content */}
      {configured && data && built && (
        <>
          {/* Summary tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-leve-blue">
              <p className="text-xs font-semibold uppercase text-gray-500">Hoje</p>
              <p className="text-3xl font-bold text-gray-800">{todayItems.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-300">
              <p className="text-xs font-semibold uppercase text-gray-500">Próximos 7 dias</p>
              <p className="text-3xl font-bold text-gray-800">{next7.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-gray-300">
              <p className="text-xs font-semibold uppercase text-gray-500">Total futuros</p>
              <p className="text-3xl font-bold text-gray-800">{futureAll.length}</p>
            </div>
          </div>

          {!built.map.dateCol && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900 mb-6">
              Não encontrei uma coluna de data na planilha. Informe o nome dela em{' '}
              <span className="font-mono">dateColumn</span> no arquivo{' '}
              <span className="font-mono">src/config/audiencias.ts</span>.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Today */}
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Hoje</h2>
              <p className="text-sm text-gray-500 mb-4">{formatDayLong(today)}</p>

              {todayItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500 text-sm">
                  Nenhum compromisso para hoje.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {todayItems.map((item, index) => (
                    <CompromissoCard key={item.id} item={item} status={statusFor(item, index)} />
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming */}
            <section>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800">Próximos compromissos</h2>
                <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                  {([7, 30, 0] as Range[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => setRange(option)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        range === option
                          ? 'bg-leve-blue text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {option === 0 ? 'Todos' : `${option} dias`}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-leve-blue"
                placeholder="Buscar nos próximos compromissos"
                aria-label="Buscar nos próximos compromissos"
              />

              {groups.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500 text-sm">
                  {futureAll.length === 0
                    ? 'Nenhum compromisso futuro registrado.'
                    : 'Nenhum compromisso encontrado com esses filtros.'}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {groups.map((group) => (
                    <div key={group.key}>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-bold text-gray-700">{formatDayLong(group.date)}</h3>
                        {relativeDayLabel(group.date, today) && (
                          <span className="text-[10px] font-bold uppercase bg-blue-100 text-leve-blue rounded px-2 py-0.5">
                            {relativeDayLabel(group.date, today)}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {group.items.length} {group.items.length === 1 ? 'compromisso' : 'compromissos'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3">
                        {group.items.map((item) => (
                          <CompromissoCard key={item.id} item={item} status="normal" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {built.ignored > 0 && (
            <div className="mt-8 text-xs text-gray-500">
              <p className="font-semibold text-gray-600 mb-1">
                Processos sem audiência marcada ({built.ignored})
              </p>
              <p>{built.pending.map((group) => `${group.label}: ${group.count}`).join(' · ')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
