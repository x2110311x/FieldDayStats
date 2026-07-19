import React, { useState, useMemo } from 'react';
import { QSO } from '../types';
import { Search, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface LogGridProps {
  qsos: QSO[];
  onDeleteQso: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
}

export const LogGrid: React.FC<LogGridProps> = ({ qsos, onDeleteQso, onDeleteSelected }) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof QSO>('timestamp');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return qsos;
    return qsos.filter(
      (q) =>
        q.call.toLowerCase().includes(term) ||
        q.operator.toLowerCase().includes(term) ||
        q.section.toLowerCase().includes(term) ||
        q.band.toLowerCase().includes(term) ||
        q.mode.toLowerCase().includes(term) ||
        q.grid.toLowerCase().includes(term) ||
        q.station.toLowerCase().includes(term)
    );
  }, [qsos, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a[sortField] ?? '';
      const valB = b[sortField] ?? '';
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortAsc]);

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const handleSort = (field: keyof QSO) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((q) => q.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDeleteBulk = () => {
    onDeleteSelected(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search callsign, op, band, section..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filtered.length} / {qsos.length} QSOs
          </span>
        </div>

        {selectedIds.size > 0 && (
          <button
            onClick={handleDeleteBulk}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold shadow-md transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Tabular QSO Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="p-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={paginated.length > 0 && selectedIds.size === paginated.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-700 text-sky-500 focus:ring-0"
                />
              </th>
              <th className="p-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-1">Date/Time <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('call')}>
                <div className="flex items-center gap-1">Callsign <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('band')}>
                <div className="flex items-center gap-1">Band <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('mode')}>
                <div className="flex items-center gap-1">Mode <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('section')}>
                <div className="flex items-center gap-1">Section <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('operator')}>
                <div className="flex items-center gap-1">Operator <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('station')}>
                <div className="flex items-center gap-1">Rig/Station <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('grid')}>
                <div className="flex items-center gap-1">Grid <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {paginated.length > 0 ? (
              paginated.map((qso) => (
                <tr
                  key={qso.id}
                  className={`hover:bg-slate-800/40 transition ${
                    qso.isGota ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(qso.id)}
                      onChange={() => toggleSelectRow(qso.id)}
                      className="rounded border-slate-700 text-sky-500 focus:ring-0"
                    />
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-400">
                    {qso.date} {qso.time}
                  </td>
                  <td className="p-3 font-bold text-sky-400 font-mono">
                    {qso.call}
                    {qso.isGota && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-sans font-semibold">
                        GOTA
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-semibold text-slate-200">{qso.band}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        qso.mode === 'CW'
                          ? 'bg-blue-500/20 text-blue-300'
                          : qso.mode === 'PHONE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {qso.rawMode || qso.mode}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-amber-400">{qso.section}</td>
                  <td className="p-3 text-slate-300">{qso.operator}</td>
                  <td className="p-3 text-slate-400">{qso.station}</td>
                  <td className="p-3 text-slate-400">{qso.grid || '-'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onDeleteQso(qso.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                      title="Purge QSO record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-6 text-center text-slate-500 font-sans">
                  No QSO records match search filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <div>
          Page <span className="font-semibold text-slate-200">{page}</span> of{' '}
          <span className="font-semibold text-slate-200">{totalPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-1.5 rounded bg-slate-950 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-1.5 rounded bg-slate-950 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
