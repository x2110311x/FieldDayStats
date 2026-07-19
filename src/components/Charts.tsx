import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
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

  // Chart 1: Activity Timeline Line Chart
  const timelineData = {
    labels: timeline.bins.map((b) => b.timeLabel),
    datasets: [
      {
        label: 'Total QSOs/hr',
        data: timeline.bins.map((b) => b.qsoCount),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'CW',
        data: timeline.bins.map((b) => b.cwCount),
        borderColor: '#3b82f6',
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: 'Phone (SSB/FM)',
        data: timeline.bins.map((b) => b.phoneCount),
        borderColor: '#22c55e',
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: 'Digital (FT8/RTTY)',
        data: timeline.bins.map((b) => b.digitalCount),
        borderColor: '#eab308',
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const timelineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
      },
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

  // Chart 2: Top 20 Band/Mode Bar Chart
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
      {/* 1. Band & Mode Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-base font-bold text-slate-100">Band & Operating Mode Matrix</h2>
          <span className="text-xs text-slate-400 font-mono">{totalQsos} Ingested Contacts</span>
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
                <td className="p-2.5 text-right text-blue-400">
                  {Object.values(matrix).reduce((sum, r) => sum + r.cw, 0)}
                </td>
                <td className="p-2.5 text-right text-emerald-400">
                  {Object.values(matrix).reduce((sum, r) => sum + r.phone, 0)}
                </td>
                <td className="p-2.5 text-right text-amber-400">
                  {Object.values(matrix).reduce((sum, r) => sum + r.digital, 0)}
                </td>
                <td className="p-2.5 text-right text-sky-400">{qsos.length}</td>
                <td className="p-2.5 text-right text-slate-100">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline Line Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-100">Activity Rate Timeline</h2>
              <p className="text-xs text-slate-400">Hourly QSO velocity across Field Day period</p>
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

        {/* Top 20 Band/Mode Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col space-y-3">
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
      </div>

      {/* 3. Operator & Station Leaderboard Grids */}
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
            <h3 className="text-base font-bold text-slate-100">Station & Rig Profiles</h3>
            <span className="text-xs text-slate-400 font-mono">{stationStats.length} Stations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase">
                <tr>
                  <th className="p-2">Station Profile</th>
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
