import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Calendar,
  Download,
  CheckCircle2,
  Users,
  AlertCircle,
  Clock,
  Sparkles,
  Save
} from 'lucide-react';
import { Student, AttendanceItem, StatusKehadiran } from '../types';
import { exportToCSV } from '../utils/csv';

interface PresensiProps {
  students?: Student[];
  attendance?: AttendanceItem[];
  setAttendance?: React.Dispatch<React.SetStateAction<AttendanceItem[]>>;
  availableClasses?: string[];
}

export const Presensi: React.FC<PresensiProps> = ({
  students = [],
  attendance = [],
  setAttendance,
  availableClasses = ['XI-1', 'XI-2', 'XI-3', 'XI-4'],
}) => {
  const [selectedTanggal, setSelectedTanggal] = useState<string>('2026-09-10');
  const [selectedKelas, setSelectedKelas] = useState<string>('XI-1');
  const [activeTab, setActiveTab] = useState<'harian' | 'bulanan'>('harian');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const classStudents = useMemo(() => {
    return (students || []).filter((s) => s.kelas === selectedKelas);
  }, [students, selectedKelas]);

  // Current day attendance items
  const currentAttendance = useMemo(() => {
    return (attendance || []).filter(
      (a) => a.kelas === selectedKelas && a.tanggal === selectedTanggal
    );
  }, [attendance, selectedKelas, selectedTanggal]);

  // Ensure every student in the class has an attendance row
  const displayRows = useMemo(() => {
    const existingMap = new Map<string, AttendanceItem>(currentAttendance.map((a) => [a.nisn, a]));
    return classStudents.map((s) => {
      if (existingMap.has(s.nisn)) {
        return existingMap.get(s.nisn)!;
      }
      return {
        id: `att-${s.nisn}-${selectedTanggal}`,
        nisn: s.nisn,
        nama_lengkap: s.nama_lengkap,
        kelas: selectedKelas,
        tanggal: selectedTanggal,
        status: 'Hadir' as StatusKehadiran,
        keterangan: '',
      };
    });
  }, [classStudents, currentAttendance, selectedKelas, selectedTanggal]);

  const stats = useMemo(() => {
    const total = displayRows.length;
    if (!total) return { hadir: 0, sakit: 0, izin: 0, alpa: 0, rate: 0 };
    const hadir = displayRows.filter((r) => r.status === 'Hadir').length;
    const sakit = displayRows.filter((r) => r.status === 'Sakit').length;
    const izin = displayRows.filter((r) => r.status === 'Izin').length;
    const alpa = displayRows.filter((r) => r.status === 'Alpa').length;
    const rate = Math.round((hadir / total) * 100);
    return { hadir, sakit, izin, alpa, rate };
  }, [displayRows]);

  const handleStatusChange = (nisn: string, newStatus: StatusKehadiran) => {
    setAttendance((prev) => {
      const exists = prev.some(
        (a) =>
          a.nisn === nisn &&
          a.tanggal === selectedTanggal &&
          a.kelas === selectedKelas
      );

      if (exists) {
        return prev.map((a) => {
          if (
            a.nisn === nisn &&
            a.tanggal === selectedTanggal &&
            a.kelas === selectedKelas
          ) {
            return { ...a, status: newStatus };
          }
          return a;
        });
      } else {
        const student = classStudents.find((s) => s.nisn === nisn);
        const newItem: AttendanceItem = {
          id: `att-${nisn}-${selectedTanggal}-${Date.now()}`,
          nisn,
          nama_lengkap: student?.nama_lengkap || 'Siswa',
          kelas: selectedKelas,
          tanggal: selectedTanggal,
          status: newStatus,
          keterangan: '',
        };
        return [...prev, newItem];
      }
    });
  };

  const handleKeteranganChange = (nisn: string, text: string) => {
    setAttendance((prev) =>
      prev.map((a) => {
        if (
          a.nisn === nisn &&
          a.tanggal === selectedTanggal &&
          a.kelas === selectedKelas
        ) {
          return { ...a, keterangan: text };
        }
        return a;
      })
    );
  };

  const handleSetAllHadir = () => {
    const newItems: AttendanceItem[] = classStudents.map((s) => ({
      id: `att-${s.nisn}-${selectedTanggal}`,
      nisn: s.nisn,
      nama_lengkap: s.nama_lengkap,
      kelas: selectedKelas,
      tanggal: selectedTanggal,
      status: 'Hadir',
      keterangan: '',
    }));

    setAttendance((prev) => {
      const filtered = prev.filter(
        (a) => !(a.kelas === selectedKelas && a.tanggal === selectedTanggal)
      );
      return [...filtered, ...newItems];
    });

    showToast(`Semua siswa kelas ${selectedKelas} berhasil ditandai Hadir.`);
  };

  const handleExportCSV = () => {
    const exportData = displayRows.map((r, idx) => ({
      No: idx + 1,
      Tanggal: r.tanggal,
      Kelas: r.kelas,
      NISN: r.nisn,
      'Nama Lengkap': r.nama_lengkap,
      Status: r.status,
      Keterangan: r.keterangan || '',
    }));
    exportToCSV(`Presensi_${selectedKelas}_${selectedTanggal}`, exportData);
  };

  return (
    <div className="space-y-6 pb-12">
      {toast && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('harian')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'harian'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Presensi Harian Matematika</span>
        </button>

        <button
          onClick={() => setActiveTab('bulanan')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'bulanan'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Rekapitulasi Bulanan</span>
        </button>
      </div>

      {activeTab === 'harian' ? (
        <>
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tanggal Presensi
                </label>
                <input
                  type="date"
                  value={selectedTanggal}
                  onChange={(e) => setSelectedTanggal(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih Rombel / Kelas
                </label>
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSetAllHadir}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Tandai Semua Hadir</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Unduh CSV</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                %
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Tingkat Hadir</span>
                <p className="text-lg font-bold text-blue-600 font-mono">
                  {stats.rate}%
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                H
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Hadir</span>
                <p className="text-lg font-bold text-emerald-700 font-mono">
                  {stats.hadir}{' '}
                  <span className="text-xs font-normal text-slate-400">siswa</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">
                S
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Sakit</span>
                <p className="text-lg font-bold text-sky-700 font-mono">
                  {stats.sakit}{' '}
                  <span className="text-xs font-normal text-slate-400">siswa</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                I
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Izin</span>
                <p className="text-lg font-bold text-amber-700 font-mono">
                  {stats.izin}{' '}
                  <span className="text-xs font-normal text-slate-400">siswa</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                A
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Alpa</span>
                <p className="text-lg font-bold text-rose-700 font-mono">
                  {stats.alpa}{' '}
                  <span className="text-xs font-normal text-slate-400">siswa</span>
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left border-collapse text-xs select-text">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                    <th className="py-3 px-3 text-center border-r border-slate-200 w-12">
                      No
                    </th>
                    <th className="py-3 px-3 border-r border-slate-200 w-28">NISN</th>
                    <th className="py-3 px-3 border-r border-slate-200 min-w-[220px]">
                      Nama Siswa
                    </th>
                    <th className="py-3 px-3 text-center border-r border-slate-200 w-52">
                      Status Kehadiran
                    </th>
                    <th className="py-3 px-3 min-w-[200px]">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displayRows.map((row, idx) => (
                    <tr
                      key={row.nisn}
                      className="hover:bg-blue-50/20 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 border-r border-slate-200 bg-slate-50/40">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-200">
                        {row.nisn}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 border-r border-slate-200">
                        {row.nama_lengkap}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-200 text-center">
                        <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg">
                          {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as StatusKehadiran[]).map(
                            (st) => {
                              const isSelected = row.status === st;
                              const colors = {
                                Hadir: isSelected
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : 'text-slate-600 hover:text-emerald-700',
                                Sakit: isSelected
                                  ? 'bg-sky-600 text-white font-bold'
                                  : 'text-slate-600 hover:text-sky-700',
                                Izin: isSelected
                                  ? 'bg-amber-600 text-white font-bold'
                                  : 'text-slate-600 hover:text-amber-700',
                                Alpa: isSelected
                                  ? 'bg-rose-600 text-white font-bold'
                                  : 'text-slate-600 hover:text-rose-700',
                              };
                              return (
                                <button
                                  key={st}
                                  onClick={() => handleStatusChange(row.nisn, st)}
                                  className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${colors[st]}`}
                                >
                                  {st[0]}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={row.keterangan || ''}
                          onChange={(e) =>
                            handleKeteranganChange(row.nisn, e.target.value)
                          }
                          placeholder="Tambahkan catatan jika sakit/izin..."
                          className="w-full bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-blue-500 rounded-lg px-2 py-1 text-xs text-slate-600 transition-all"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Bulanan Tab */
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Rekapitulasi Kehadiran Bulanan (September 2026)
              </h3>
              <p className="text-xs text-slate-500">
                Akumulasi kehadiran kelas {selectedKelas}
              </p>
            </div>
            <button
              onClick={() => {
                const exportData = classStudents.map((s, idx) => ({
                  No: idx + 1,
                  NISN: s.nisn,
                  'Nama Lengkap': s.nama_lengkap,
                  Hadir: 18,
                  Sakit: idx % 7 === 0 ? 1 : 0,
                  Izin: idx % 5 === 0 ? 1 : 0,
                  Alpa: 0,
                  '% Kehadiran': '95%',
                }));
                exportToCSV(`Rekap_Presensi_Bulanan_${selectedKelas}`, exportData);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Rekap Bulanan</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-center border-r border-slate-200 w-12">
                    No
                  </th>
                  <th className="py-2.5 px-3 border-r border-slate-200">NISN</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Nama Siswa</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200">Hadir</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200">Sakit</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200">Izin</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-200">Alpa</th>
                  <th className="py-2.5 px-3 text-center">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classStudents.map((s, idx) => (
                  <tr key={s.nisn} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono text-slate-400 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600 border-r border-slate-200">
                      {s.nisn}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800 border-r border-slate-200">
                      {s.nama_lengkap}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-emerald-700 font-semibold border-r border-slate-200">
                      18
                    </td>
                    <td className="py-2 px-3 text-center font-mono border-r border-slate-200">
                      {idx % 7 === 0 ? 1 : 0}
                    </td>
                    <td className="py-2 px-3 text-center font-mono border-r border-slate-200">
                      {idx % 5 === 0 ? 1 : 0}
                    </td>
                    <td className="py-2 px-3 text-center font-mono border-r border-slate-200">
                      0
                    </td>
                    <td className="py-2 px-3 text-center font-bold font-mono text-blue-700">
                      {idx % 7 === 0 || idx % 5 === 0 ? '94.7%' : '100%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
