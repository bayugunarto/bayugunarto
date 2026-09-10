import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { ScheduleItem } from '../types';

interface JadwalMengajarProps {
  schedules?: ScheduleItem[];
  setSchedules?: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  availableClasses?: string[];
}

export const JadwalMengajar: React.FC<JadwalMengajarProps> = ({
  schedules = [],
  setSchedules,
  availableClasses = ['XI-1', 'XI-2', 'XI-3', 'XI-4'],
}) => {
  const days: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat')[] = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    hari: 'Senin',
    jamMulai: '07.30',
    jamSelesai: '09.00',
    kelas: (availableClasses && availableClasses[0]) || 'XI-1',
    mataPelajaran: 'Matematika Tingkat Lanjut',
    ruang: 'R.201',
    topik: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setFormData({
      hari: 'Senin',
      jamMulai: '07.30',
      jamSelesai: '09.00',
      kelas: (availableClasses && availableClasses[0]) || 'XI-1',
      mataPelajaran: 'Matematika Tingkat Lanjut',
      ruang: 'R.201',
      topik: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingSchedule(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, kelas: string, hari: string) => {
    if (window.confirm(`Hapus jadwal mengajar kelas ${kelas} pada hari ${hari}?`)) {
      if (setSchedules) {
        setSchedules((prev) => (prev || []).filter((s) => s.id !== id));
      }
      showToast(`Jadwal mengajar kelas ${kelas} berhasil dihapus.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hari || !formData.kelas || !formData.jamMulai || !formData.jamSelesai) {
      alert('Hari, Kelas, Jam Mulai, dan Jam Selesai wajib diisi!');
      return;
    }

    if (!setSchedules) return;

    if (editingSchedule) {
      // Update
      setSchedules((prev) =>
        (prev || []).map((s) =>
          s.id === editingSchedule.id
            ? {
                ...s,
                hari: formData.hari as 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat',
                jamMulai: formData.jamMulai!,
                jamSelesai: formData.jamSelesai!,
                kelas: formData.kelas!,
                mataPelajaran: formData.mataPelajaran || 'Matematika',
                ruang: formData.ruang || 'R.201',
                topik: formData.topik || '',
              }
            : s
        )
      );
      showToast(`Jadwal hari ${formData.hari} kelas ${formData.kelas} berhasil diperbarui!`);
    } else {
      // Add
      const newSchedule: ScheduleItem = {
        id: `sch-${Date.now()}`,
        hari: formData.hari as 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat',
        jamMulai: formData.jamMulai!,
        jamSelesai: formData.jamSelesai!,
        kelas: formData.kelas!,
        mataPelajaran: formData.mataPelajaran || 'Matematika',
        ruang: formData.ruang || 'R.201',
        topik: formData.topik || '',
      };
      setSchedules((prev) => [...(prev || []), newSchedule]);
      showToast(`Jadwal baru hari ${newSchedule.hari} kelas ${newSchedule.kelas} berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner with Add Button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Jadwal Mengajar Tatap Muka</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mata Pelajaran Matematika - Bayu Gunarto, M.Pd (Tahun Ajaran 2026/2027)
          </p>
        </div>

        <button
          id="btn-tambah-jadwal"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Input Jadwal Mengajar</span>
        </button>
      </div>

      {/* Schedule Grid by Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {days.map((day) => {
          const daySchedules = (schedules || [])
            .filter((s) => s.hari === day)
            .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));

          return (
            <div
              key={day}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col h-full"
            >
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">{day}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                  {daySchedules.length} Sesi
                </span>
              </div>

              <div className="space-y-3 mt-3 flex-1">
                {daySchedules.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    Tidak ada jam mengajar
                  </div>
                ) : (
                  daySchedules.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 rounded-xl text-xs space-y-1.5 transition-all group relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-700 font-mono text-xs">
                          {item.kelas}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Edit Jadwal"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.kelas, item.hari)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Hapus Jadwal"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.jamMulai} - {item.jamSelesai}</span>
                      </div>

                      <div className="font-semibold text-slate-800 leading-tight">
                        {item.mataPelajaran}
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Ruang {item.ruang}</span>
                      </div>

                      {item.topik && (
                        <div className="pt-1.5 text-[11px] text-indigo-700 flex items-center gap-1 border-t border-slate-200/60 font-medium">
                          <BookOpen className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.topik}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Input Jadwal Mengajar (Jawaban Pertanyaan 3) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-800 text-base">
                  {editingSchedule ? 'Edit Jadwal Mengajar' : 'Input Jadwal Mengajar Baru'}
                </h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Pilih Hari *
                  </label>
                  <select
                    value={formData.hari}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hari: e.target.value as 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat',
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Pilih Kelas *
                  </label>
                  <select
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {availableClasses.map((c) => (
                      <option key={c} value={c}>
                        Kelas {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Jam Mulai *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 07.30"
                    value={formData.jamMulai || ''}
                    onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Jam Selesai *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 09.00"
                    value={formData.jamSelesai || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, jamSelesai: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mata Pelajaran
                </label>
                <input
                  type="text"
                  required
                  value={formData.mataPelajaran || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, mataPelajaran: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Ruang Mengajar
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: R.201 / Lab"
                    value={formData.ruang || ''}
                    onChange={(e) => setFormData({ ...formData, ruang: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Topik / Materi Pokok
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Fungsi Komposisi"
                    value={formData.topik || ''}
                    onChange={(e) => setFormData({ ...formData, topik: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  {editingSchedule ? 'Simpan Perubahan' : 'Tambah ke Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
