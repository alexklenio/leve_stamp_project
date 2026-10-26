import { ReactNode } from 'react';
import { motivoColor, niceScale, StackGroup, StackSegment } from '../utils/produtividadeData';

// All charts are plain SVG (no chart library), drawn from the already filtered data.
// Colours come from the GLOBAL motivo order, so a motivo keeps its colour whatever the filters.

const GRID = '#E0E0E0';
const AXIS_TEXT = '#5F6368';

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-center text-gray-500 text-base md:text-lg font-medium mb-3">{title}</h3>
      {children}
    </div>
  );
}

function NoData() {
  return <p className="text-center text-sm text-gray-400 py-10">Sem dados para os filtros selecionados.</p>;
}

function Legend({ order }: { order: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-gray-700 mb-2">
      {order.map((label) => (
        <span key={label} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: motivoColor(order, label) }}
          />
          {label}
        </span>
      ))}
    </div>
  );
}

function shorten(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// ---------------------------------------------------------------------------
// KPI
// ---------------------------------------------------------------------------

export function KpiCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div
        className="px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wide text-white"
        style={{ backgroundColor: '#4285F4' }}
      >
        {title}
      </div>
      <p className="text-center text-6xl font-light text-gray-900 py-5 leading-none">
        {value.toLocaleString('pt-BR')}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pie
// ---------------------------------------------------------------------------

function slicePath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
}

export function PieChartCard({
  title,
  data,
  order,
}: {
  title: string;
  data: StackSegment[];
  order: string[];
}) {
  const slices = data.filter((d) => d.count > 0);
  const total = slices.reduce((sum, d) => sum + d.count, 0);

  const cx = 100;
  const cy = 100;
  const r = 92;
  let angle = -Math.PI / 2;
  const paths = slices.map((d) => {
    const start = angle;
    angle += (d.count / total) * 2 * Math.PI;
    return { ...d, start, end: angle, percent: Math.round((d.count / total) * 100) };
  });

  return (
    <ChartCard title={title}>
      {total === 0 ? (
        <NoData />
      ) : (
        <>
          <svg viewBox="0 0 200 200" width="190" height="190" className="mx-auto block" role="img" aria-label={title}>
            {paths.length === 1 ? (
              <circle cx={cx} cy={cy} r={r} fill={motivoColor(order, paths[0].label)}>
                <title>{`${paths[0].label}: ${paths[0].count} (100%)`}</title>
              </circle>
            ) : (
              paths.map((p) => (
                <path
                  key={p.label}
                  d={slicePath(cx, cy, r, p.start, p.end)}
                  fill={motivoColor(order, p.label)}
                  stroke="#FFFFFF"
                  strokeWidth="1"
                >
                  <title>{`${p.label}: ${p.count} (${p.percent}%)`}</title>
                </path>
              ))
            )}
          </svg>

          <ul className="mt-3 flex flex-col gap-1 text-xs text-gray-700">
            {paths.map((p) => (
              <li key={p.label} className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: motivoColor(order, p.label) }}
                />
                <span className="flex-1 min-w-0 break-words">{p.label}</span>
                <span className="font-semibold">{p.count.toLocaleString('pt-BR')}</span>
                <span className="text-gray-400 w-10 text-right">{p.percent}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Stacked columns (e.g. year x motivo)
// ---------------------------------------------------------------------------

export function StackedColumnsCard({
  title,
  groups,
  order,
}: {
  title: string;
  groups: StackGroup[];
  order: string[];
}) {
  const W = 400;
  const H = 270;
  const left = 34;
  const right = 10;
  const top = 12;
  const bottom = 28;
  const plotW = W - left - right;
  const plotH = H - top - bottom;

  const max = Math.max(0, ...groups.map((g) => g.total));
  const scale = niceScale(max);
  const ticks: number[] = [];
  for (let v = 0; v <= scale.top; v += scale.step) ticks.push(v);

  const band = plotW / Math.max(groups.length, 1);
  const barW = Math.min(band * 0.62, 56);
  const yOf = (value: number) => top + plotH - (value / scale.top) * plotH;

  return (
    <ChartCard title={title}>
      {groups.length === 0 ? (
        <NoData />
      ) : (
        <>
          <Legend order={order} />
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={title}>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={left} x2={W - right} y1={yOf(v)} y2={yOf(v)} stroke={GRID} strokeWidth="1" />
                <text x={left - 6} y={yOf(v) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT}>
                  {v}
                </text>
              </g>
            ))}

            {groups.map((g, i) => {
              const x = left + band * i + (band - barW) / 2;
              let acc = 0;
              return (
                <g key={g.label}>
                  {order.map((motivo) => {
                    const seg = g.segments.find((s) => s.label === motivo);
                    if (!seg || seg.count === 0) return null;
                    const y0 = yOf(acc + seg.count);
                    const h = (seg.count / scale.top) * plotH;
                    acc += seg.count;
                    return (
                      <g key={motivo}>
                        <rect x={x} y={y0} width={barW} height={h} fill={motivoColor(order, motivo)}>
                          <title>{`${g.label} · ${motivo}: ${seg.count}`}</title>
                        </rect>
                        {h >= 14 && (
                          <text
                            x={x + barW / 2}
                            y={y0 + h / 2 + 4}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="700"
                            fill="#FFFFFF"
                          >
                            {seg.count}
                          </text>
                        )}
                      </g>
                    );
                  })}
                  <text x={x + barW / 2} y={H - 9} textAnchor="middle" fontSize="11" fill="#202124">
                    {g.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </>
      )}
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Stacked horizontal bars (e.g. auditor x motivo)
// ---------------------------------------------------------------------------

export function StackedBarsCard({
  title,
  groups,
  order,
}: {
  title: string;
  groups: StackGroup[];
  order: string[];
}) {
  const W = 420;
  const labelW = 112;
  const right = 36;
  const top = 6;
  const rowH = 26;
  const gap = 12;
  const axisH = 24;
  const plotW = W - labelW - right;
  const H = top + groups.length * (rowH + gap) + axisH;

  const max = Math.max(0, ...groups.map((g) => g.total));
  const scale = niceScale(max);
  const ticks: number[] = [];
  for (let v = 0; v <= scale.top; v += scale.step) ticks.push(v);
  const xOf = (value: number) => labelW + (value / scale.top) * plotW;

  return (
    <ChartCard title={title}>
      {groups.length === 0 ? (
        <NoData />
      ) : (
        <>
          <Legend order={order} />
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={title}>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={xOf(v)} x2={xOf(v)} y1={top} y2={H - axisH} stroke={GRID} strokeWidth="1" />
                <text x={xOf(v)} y={H - 8} textAnchor="middle" fontSize="11" fill="#202124">
                  {v}
                </text>
              </g>
            ))}
            <line x1={labelW} x2={labelW} y1={top} y2={H - axisH} stroke="#202124" strokeWidth="1" />

            {groups.map((g, i) => {
              const y = top + i * (rowH + gap) + gap / 2;
              let acc = 0;
              return (
                <g key={g.label}>
                  <text x={labelW - 8} y={y + rowH / 2 + 4} textAnchor="end" fontSize="10.5" fill="#202124">
                    {shorten(g.label, 17)}
                    <title>{g.label}</title>
                  </text>
                  {order.map((motivo) => {
                    const seg = g.segments.find((s) => s.label === motivo);
                    if (!seg || seg.count === 0) return null;
                    const x0 = xOf(acc);
                    const w = xOf(acc + seg.count) - x0;
                    acc += seg.count;
                    return (
                      <rect key={motivo} x={x0} y={y} width={w} height={rowH} fill={motivoColor(order, motivo)}>
                        <title>{`${g.label} · ${motivo}: ${seg.count}`}</title>
                      </rect>
                    );
                  })}
                  <text x={xOf(g.total) + 6} y={y + rowH / 2 + 4} fontSize="11" fill={AXIS_TEXT}>
                    {g.total}
                  </text>
                </g>
              );
            })}
          </svg>
        </>
      )}
    </ChartCard>
  );
}
