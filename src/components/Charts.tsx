import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { QSO, OperatorStats, StationStats } from '../types';
import {
  BANDS_ORDER,
  buildBandModeMatrix,
  calculateActivityTimeline,
  getTopBandModeCombinations,
} from '../services/analytics/statsEngine';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartsProps {
  qsos: QSO[];
  operatorStats: OperatorStats[];
  stationStats: StationStats[];
}

export const Charts: React.FC<ChartsProps> = ({ qsos, operatorStats, stationStats }) => {
  const matrix = buildBandModeMatrix(qsos);
  const totalQsos = qsos.length || 1;
  const timeline = calculateActivityTimeline(qsos);
  const topCombos = getTopBandModeCombinations(qsos, 20);

  // 1. Full-Width Simplified Single Line Activity Timeline
  const timelineData = {
    labels: timeline.bins.map((b) => b.timeLabel),
    datasets: [
      {
        label: 'Total QSOs / Hour',
        data: timeline.bins.map((b) => b.qsoCount),
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.2)',
        fill: true,
        borderWidth: 3,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#38bdf8',
        pointHoverRadius: 7,
      },
    ],
  };

  const timelineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
    },
  };

  // 2. Mode Share Pie Chart Data with Percentages
  const phoneCount = Object.values(matrix).reduce((sum, r) => sum + r.phone, 0);
  const cwCount = Object.values(matrix).reduce((sum, r) => sum + r.cw, 0);
  const digitalCount = Object.values(matrix).reduce((sum, r) => sum + r.digital, 0);

  const phonePct = ((phoneCount / totalQsos) * 100).toFixed(1);
  const cwPct = ((cwCount / totalQsos) * 100).toFixed(1);
  const digitalPct = ((digitalCount / totalQsos) * 100).toFixed(1);

  const modePieData = {
    labels: [
      `Phone (SSB) - ${phonePct}% (${phoneCount.toLocaleString()} QSOs)`,
      `CW - ${cwPct}% (${cwCount.toLocaleString()} QSOs)`,
      `Digital - ${digitalPct}% (${digitalCount.toLocaleString()} QSOs)`,
    ],
    datasets: [
      {
        data: [phoneCount, cwCount, digitalCount],
        backgroundColor: ['#22c55e', '#3b82f6', '#eab308'],
        borderWidth: 2,
        borderColor: '#0f172a',
      },
    ],
  };

  // 3. Band Share Pie Chart Data with Percentages
  const activeBands = BANDS_ORDER.filter((b) => (matrix[b]?.total || 0) > 0);
  const bandPieData = {
    labels: activeBands.map((b) => {
      const count = matrix[b].total;
      const pct = ((count / totalQsos) * 100).toFixed(1);
      return `${b} - ${pct}% (${count} QSOs)`;
    }),
    datasets: [
      {
        data: activeBands.map((b) => matrix[b].total),
        backgroundColor: [
          '#9333ea',
          '#3b82f6',
          '#06b6d4',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#ec4899',
          '#8b5cf6',
          '#6366f1',
          '#f43f5e',
          '#64748b',
        ],
        borderWidth: 2,
        borderColor: '#0f172a',
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: '#cbd5e1', font: { family: 'Inter', size: 10 } },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            const pct = ((val / totalQsos) * 100).toFixed(1);
            return `${context.label.split('-')[0].trim()}: ${val.toLocaleString()} QSOs (${pct}%)`;
          },
        },
      },
    },
  };

  // 4. Top 20 Band/Mode Bar Chart
  const comboData = {
    labels: topCombos.map((c) => c.combo),
    datasets: [
      {
        label: 'QSOs',
        data: topCombos.map((c) => c.count),
        backgroundColor: topCombos.map((c) => {
          if (c.combo.includes('DIG')) return '#eab308';
          if (c.combo.includes('SSB') || c.combo.includes('PHONE')) return '#22c55e';
          return '#3b82f6';
        }),
        borderRadius: 4,
      },
    ],
  };

  const comboOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#f8fafc', font: { family: 'JetBrains Mono', size: 11, weight: 'bold' as const } },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* 1. Full-Width Activity Rate Timeline Line Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 w-full">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h2 className="text-base font-bold text-slate-100">Activity Graph (Local Timezone)</h2>
            <p className="text-xs text-slate-400">Total QSOs per hour across Field Day operating window</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Peak Rate</span>
            <div className="text-sm font-extrabold text-sky-400 font-mono">
              {timeline.peakHourlyRate} QSOs/hr
            </div>
          </div>
        </div>
        <div className="h-64 relative w-full pt-2">
          <Line data={timelineData} options={timelineOptions} />
        </div>
      </div>

      {/* 2. Band & Mode Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-base font-bold text-slate-100">Band & Operating Mode Matrix</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-2.5">Band</th>
                <th className="p-2.5 text-right text-blue-400">CW QSOs</th>
                <th className="p-2.5 text-right text-emerald-400">Phone (SSB)</th>
                <th className="p-2.5 text-right text-amber-400">Digital</th>
                <th className="p-2.5 text-right font-bold text-slate-100">Total QSOs</th>
                <th className="p-2.5 text-right">% Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {BANDS_ORDER.map((band) => {
                const row = matrix[band] || { cw: 0, phone: 0, digital: 0, total: 0 };
                const pct = qsos.length > 0 ? ((row.total / qsos.length) * 100).toFixed(1) : '0.0';

                return (
                  <tr key={band} className="hover:bg-slate-800/30 transition">
                    <td className="p-2.5 font-bold text-sky-400 font-mono">{band}</td>
                    <td className="p-2.5 text-right text-blue-300">{row.cw}</td>
                    <td className="p-2.5 text-right text-emerald-300">{row.phone}</td>
                    <td className="p-2.5 text-right text-amber-300">{row.digital}</td>
                    <td className="p-2.5 text-right font-bold text-slate-100">{row.total}</td>
                    <td className="p-2.5 text-right text-slate-400">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-800 font-mono">
              <tr>
                <td className="p-2.5 text-slate-100 font-sans">TOTALS</td>
                <td className="p-2.5 text-right text-blue-400">{cwCount}</td>
                <td className="p-2.5 text-right text-emerald-400">{phoneCount}</td>
                <td className="p-2.5 text-right text-amber-400">{digitalCount}</td>
                <td className="p-2.5 text-right text-sky-400">{qsos.length}</td>
                <td className="p-2.5 text-right text-slate-100">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 3. Visual Analytics Pie Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Operating Mode Share</h3>
          <div className="h-56 relative">
            <Pie data={modePieData} options={pieOptions} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Band Distribution Share</h3>
          <div className="h-56 relative">
            <Pie data={bandPieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* 4. Top 20 Band/Mode Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col space-y-3 w-full">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h2 className="text-base font-bold text-slate-100">Top Band/Mode Combinations</h2>
            <p className="text-xs text-slate-400">Ranked contact totals by band and mode</p>
          </div>
        </div>
        <div className="h-64 relative w-full pt-2">
          <Bar data={comboData} options={comboOptions} />
        </div>
      </div>

      {/* 5. Operator & Station Leaderboard Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operator Leaderboard */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-slate-100">Operator Leaderboard</h3>
            <span className="text-xs text-slate-400 font-mono">{operatorStats.length} Operators</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase">
                <tr>
                  <th className="p-2">Rank</th>
                  <th className="p-2">Callsign</th>
                  <th className="p-2 text-right">QSOs</th>
                  <th className="p-2 text-right">Hours</th>
                  <th className="p-2 text-right">Top Band</th>
                  <th className="p-2 text-right">% Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {operatorStats.slice(0, 10).map((op, index) => (
                  <tr key={op.callsign} className="hover:bg-slate-800/30">
                    <td className="p-2 text-slate-500 font-sans font-semibold">#{index + 1}</td>
                    <td className="p-2 font-bold text-sky-400">{op.callsign}</td>
                    <td className="p-2 text-right font-bold text-slate-100">{op.totalQsos}</td>
                    <td className="p-2 text-right text-slate-400">{op.activeHours} hrs</td>
                    <td className="p-2 text-right text-amber-400">{op.topBand}</td>
                    <td className="p-2 text-right text-slate-400">{op.pctOfTotal}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Station Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-bold text-slate-100">Station Breakdown</h3>
            <span className="text-xs text-slate-400 font-mono">{stationStats.length} Stations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase">
                <tr>
                  <th className="p-2">Station Name</th>
                  <th className="p-2 text-right">QSOs</th>
                  <th className="p-2 text-right">CW</th>
                  <th className="p-2 text-right">Phone</th>
                  <th className="p-2 text-right">Digital</th>
                  <th className="p-2 text-right">% Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {stationStats.map((st) => (
                  <tr key={st.name} className="hover:bg-slate-800/30">
                    <td className="p-2 font-bold text-emerald-400">{st.name}</td>
                    <td className="p-2 text-right font-bold text-slate-100">{st.totalQsos}</td>
                    <td className="p-2 text-right text-blue-300">{st.cwQsos}</td>
                    <td className="p-2 text-right text-emerald-300">{st.phoneQsos}</td>
                    <td className="p-2 text-right text-amber-300">{st.digitalQsos}</td>
                    <td className="p-2 text-right text-slate-400">{st.pctOfTotal}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
