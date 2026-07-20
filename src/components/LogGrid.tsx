import React, { useState, useMemo } from 'react';
import { QSO } from '../types';
import { Search, ChevronDown, ChevronUp, Database } from 'lucide-react';

interface LogGridProps {
  qsos: QSO[];
  onDeleteQso?: (id: string) => void;
  onDeleteSelected?: (ids: string[]) => void;
}

type SortField = 'date' | 'call' | 'band' | 'mode' | 'operator' | 'station' | 'section';

export const LogGrid: React.FC<LogGridProps> = ({ qsos }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const filteredQsos = useMemo(() => {
    return qsos.filter((q) => {
      const term = searchTerm.toLowerCase();
      return (
        q.call.toLowerCase().includes(term) ||
        q.operator.toLowerCase().includes(term) ||
        q.station.toLowerCase().includes(term) ||
        q.section.toLowerCase().includes(term) ||
        q.band.toLowerCase().includes(term) ||
        q.rawMode.toLowerCase().includes(term)
      );
    });
  }, [qsos, searchTerm]);

  const sortedQsos = useMemo(() => {
    return [...filteredQsos].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'date') {
        valA = a.timestamp;
        valB = b.timestamp;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredQsos, sortField, sortDirection]);

  const totalPages = Math.max(Math.ceil(sortedQsos.length / pageSize), 1);
  const paginatedQsos = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedQsos.slice(start, start + pageSize);
  }, [sortedQsos, page]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Table Title & Filter Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="text-base font-bold text-slate-100">Full QSO Log</h2>
            <p className="text-xs text-slate-400">
              {qsos.length.toLocaleString()} Total Parsed Records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search call, op, section, band..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* QSO Data Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 select-none">
            <tr>
              <th className="p-2.5 cursor-pointer hover:text-slate-200" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-1">
                  Date / Time (UTC)
                  {sortField === 'date' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="p-2.5 cursor-pointer hover:text-slate-200" onClick={() => handleSort('call')}>
                <div className="flex items-center gap-1">
                  Call
                  {sortField === 'call' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="p-2.5 cursor-pointer hover:text-slate-200" onClick={() => handleSort('band')}>
                <div className="flex items-center gap-1">
                  Band
                  {sortField === 'band' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="p-2.5 cursor-pointer hover:text-slate-200" onClick={() => handleSort('mode')}>
                <div className="flex items-center gap-1">
                  Mode
                  {sortField === 'mode' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="p-2.5 cursor-pointer hover:text-slate-200" onClick={() => handleSort('section')}>
                <div className="flex items-center gap-1">
                  Section
                  {sortField === 'section' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="p-2.5 cursor-pointer hover:text-slate-200" onClick={() => handleSort('operator')}>
                <div className="flex items-center gap-1">
                  Operator
                  {sortField === 'operator' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="p-2.5 cursor-pointer hover:text-slate-200" onClick={() => handleSort('station')}>
                <div className="flex items-center gap-1">
                  Station Rig
                  {sortField === 'station' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {paginatedQsos.map((qso) => (
              <tr key={qso.id} className="hover:bg-slate-800/40 transition">
                <td className="p-2.5 text-slate-400 font-sans text-[11px]">
                  {qso.date} {qso.time}
                </td>
                <td className="p-2.5 font-bold text-sky-400 font-mono text-sm">{qso.call}</td>
                <td className="p-2.5 font-bold text-emerald-400 font-mono">{qso.band}</td>
                <td className="p-2.5 font-semibold text-slate-200">{qso.rawMode}</td>
                <td className="p-2.5 font-bold text-amber-400">{qso.section}</td>
                <td className="p-2.5 font-bold text-sky-300 font-sans">{qso.operator}</td>
                <td className="p-2.5 text-slate-400 font-sans">{qso.station}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <div>
          Showing {paginatedQsos.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(page * pageSize, sortedQsos.length)} of {sortedQsos.length} entries
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
