import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  UserCheck,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  Sparkles,
  Tag,
  MessageSquareQuote,
  Target,
  FileText,
  Filter,
  Search,
  ChevronRight
} from 'lucide-react';
import { TeachingJournalItem, Student, TaggedStudentNote } from '../types';

interface JurnalMengajarProps {
  journals?: TeachingJournalItem[];
  setJournals?: React.Dispatch<React.SetStateAction<TeachingJournalItem[]>>;
  students?: Student[];
  availableClasses?: string[];
}

export const JurnalMengajar: React.FC<JurnalMengajarProps> = ({
  journals = [],
  setJournals,
  students = [],
  availableClasses = ['XI-1', 'XI-2', 'XI-3', 'XI-4'],
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingJournal, setEditingJournal] = useState<TeachingJournalItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formHari, setFormHari] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'>('Senin');
  const [formTanggal, setFormTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formJamKe, setFormJamKe] = useState<string>('1 - 2 (07.30 - 09.00)');
  const [formKelas, setFormKelas] = useState<string>((availableClasses && availableClasses[0]) || 'XI-1');
  const [formMateri, setFormMateri] = useState<string>('Fungsi Komposisi dan Fungsi Invers');
  const [formTP, setFormTP] = useState<string>('TP 11.2 Menentukan rumus aljabar fungsi komposisi (f o g)(x)');
  const [formAktivitas, setFormAktivitas] = useState<string>('');
  const [formRefleksi, setFormRefleksi] = useState<string>('');

  // Tagged Students State for special notes
  const [taggedNotes, setTaggedNotes] = useState<TaggedStudentNote[]>([]);
  const [selectedStudentToTag, setSelectedStudentToTag] = useState<string>('');
  const [studentNoteInput, setStudentNoteInput] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter students in currently selected form class
  const studentsInFormClass = useMemo(() => {
    return (students || []).filter((s) => s.kelas === formKelas);
  }, [students, formKelas]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingJournal(null);
    setFormHari('Senin');
    setFormTanggal(new Date().toISOString().split('T')[0]);
    setFormJamKe('1 - 2 (07.30 - 09.00)');
    setFormKelas(availableClasses[0] || 'XI-1');
    setFormMateri('Fungsi Komposisi dan Fungsi Invers');
    setFormTP('TP 11.2 Menentukan rumus aljabar fungsi komposisi (f o g)(x)');
    setFormAktivitas('Pembelajaran saintifik berbasis masalah (PBL) dan diskusi kelompok.');
    setFormRefleksi('Siswa aktif berpartisipasi. Pemahaman aljabar sudah baik, perlu latihan variasi soal.');
    setTaggedNotes([]);
    setSelectedStudentToTag('');
    setStudentNoteInput('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: TeachingJournalItem) => {
    setEditingJournal(item);
    setFormHari(item.hari);
    setFormTanggal(item.tanggal);
    setFormJamKe(item.jamKe);
    setFormKelas(item.kelas);
    setFormMateri(item.materi);
    setFormTP(item.tujuanPembelajaran || '');
    setFormAktivitas(item.aktivitasPembelajaran);
    setFormRefleksi(item.refleksiGuru);
    setTaggedNotes(item.catatanSiswaKhusus || []);
    setSelectedStudentToTag('');
    setStudentNoteInput('');
    setIsModalOpen(true);
  };

  // Delete Journal
  const handleDelete = (id: string, kelas: string, tanggal: string) => {
    if (window.confirm(`Hapus catatan jurnal mengajar kelas ${kelas} tanggal ${tanggal}?`)) {
      setJournals((prev) => prev.filter((j) => j.id !== id));
      showToast('Jurnal mengajar berhasil dihapus.');
    }
  };

  // Add Tagged Student with personal note
  const handleAddTaggedStudent = () => {
    if (!selectedStudentToTag) {
      alert('Pilih siswa yang ingin di-tag terlebih dahulu!');
      return;
    }
    if (!studentNoteInput.trim()) {
      alert('Ketik catatan bimbingan atau apresiasi untuk siswa tersebut!');
      return;
    }

    const st = students.find((s) => s.nisn === selectedStudentToTag);
    if (!st) return;

    // Check if already tagged
    if (taggedNotes.some((t) => t.nisn === selectedStudentToTag)) {
      // Update existing note
      setTaggedNotes((prev) =>
        prev.map((t) =>
          t.nisn === selectedStudentToTag
            ? { ...t, catatan: studentNoteInput.trim() }
            : t
        )
      );
    } else {
      // Add new tag
      setTaggedNotes((prev) => [
        ...prev,
        {
          nisn: st.nisn,
          nama_lengkap: st.nama_lengkap,
          catatan: studentNoteInput.trim(),
        },
      ]);
    }

    setSelectedStudentToTag('');
    setStudentNoteInput('');
  };

  // Remove tagged student
  const handleRemoveTaggedStudent = (nisn: string) => {
    setTaggedNotes((prev) => prev.filter((t) => t.nisn !== nisn));
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTanggal || !formKelas || !formMateri || !formRefleksi) {
      alert('Tanggal, Kelas, Materi Pokok, dan Refleksi Guru wajib diisi!');
      return;
    }

    if (editingJournal) {
      // Update
      setJournals((prev) =>
        prev.map((j) =>
          j.id === editingJournal.id
            ? {
                ...j,
                hari: formHari,
                tanggal: formTanggal,
                jamKe: formJamKe,
                kelas: formKelas,
                materi: formMateri,
                tujuanPembelajaran: formTP,
                aktivitasPembelajaran: formAktivitas,
                refleksiGuru: formRefleksi,
                catatanSiswaKhusus: taggedNotes,
              }
            : j
        )
      );
      showToast(`Jurnal mengajar kelas ${formKelas} berhasil diperbarui!`);
    } else {
      // Create new
      const newJournal: TeachingJournalItem = {
        id: `journal-${Date.now()}`,
        tanggal: formTanggal,
        hari: formHari,
        jamKe: formJamKe,
        kelas: formKelas,
        materi: formMateri,
        tujuanPembelajaran: formTP,
        aktivitasPembelajaran: formAktivitas,
        refleksiGuru: formRefleksi,
        catatanSiswaKhusus: taggedNotes,
        createdAt: new Date().toISOString(),
      };
      setJournals((prev) => [newJournal, ...prev]);
      showToast(
        `Jurnal KBM kelas ${newJournal.kelas} berhasil disimpan dan ${taggedNotes.length} catatan siswa berhasil disinkronkan ke dashboard siswa!`
      );
    }

    setIsModalOpen(false);
  };

  // Filter journals for display
  const filteredJournals = useMemo(() => {
    return (journals || []).filter((item) => {
      const matchClass = selectedClassFilter === 'all' || item.kelas === selectedClassFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        item.materi.toLowerCase().includes(q) ||
        (item.tujuanPembelajaran && item.tujuanPembelajaran.toLowerCase().includes(q)) ||
        item.refleksiGuru.toLowerCase().includes(q) ||
        item.catatanSiswaKhusus.some((t) => t.nama_lengkap.toLowerCase().includes(q) || t.catatan.toLowerCase().includes(q));

      return matchClass && matchSearch;
    });
  }, [journals, selectedClassFilter, searchTerm]);

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Jurnal Mengajar & Refleksi Guru Matematika</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasikan aktivitas KBM, evaluasi/refleksi guru, serta berikan catatan khusus ke siswa (otomatis masuk ke portal siswa)
          </p>
        </div>

        <button
          id="btn-tambah-jurnal"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jurnal Mengajar</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Filter Kelas:
          </span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Kelas ({(journals || []).length} Jurnal)</option>
            {(availableClasses || []).map((cls) => {
              const count = (journals || []).filter((j) => j.kelas === cls).length;
              return (
                <option key={cls} value={cls}>
                  Kelas {cls} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari materi, refleksi, atau siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Journal Cards List */}
      <div className="space-y-4">
        {filteredJournals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 text-sm">Belum Ada Catatan Jurnal Mengajar</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Klik tombol "Tambah Jurnal Mengajar" untuk mendokumentasikan kegiatan pembelajaran dan memberikan catatan bimbingan siswa.
            </p>
          </div>
        ) : (
          filteredJournals.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all space-y-4"
            >
              {/* Top Row: Date, Class, Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs font-mono">
                    Kelas {item.kelas}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{item.hari}, {item.tanggal}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{item.jamKe}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Jurnal"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.kelas, item.tanggal)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Jurnal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Materi & Tujuan Pembelajaran */}
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-blue-600">●</span>
                  <span>{item.materi}</span>
                </h4>
                {item.tujuanPembelajaran && (
                  <p className="text-xs text-indigo-700 bg-indigo-50/70 px-3 py-1.5 rounded-xl font-medium border border-indigo-100/60 inline-block">
                    🎯 {item.tujuanPembelajaran}
                  </p>
                )}
              </div>

              {/* Aktivitas KBM */}
              <div className="text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                  Aktivitas KBM:
                </span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {item.aktivitasPembelajaran || 'Tidak ada catatan aktivitas.'}
                </p>
              </div>

              {/* Refleksi Guru (Highlighted) */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-blue-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-blue-600" />
                  <span>Refleksi & Evaluasi Guru:</span>
                </span>
                <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 p-3.5 rounded-xl border border-blue-200/70 text-slate-800 leading-relaxed font-medium">
                  {item.refleksiGuru}
                </div>
              </div>

              {/* Tagged Students & Personal Notes (User Request 7) */}
              {item.catatanSiswaKhusus && item.catatanSiswaKhusus.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span>Catatan Khusus Siswa Yang Di-tag ({item.catatanSiswaKhusus.length} Siswa):</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono italic">
                      *Otomatis tampil di menu Catatan Siswa di portal siswa
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {item.catatanSiswaKhusus.map((tag) => (
                      <div
                        key={tag.nisn}
                        className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-amber-950">
                          <span className="text-slate-900">{tag.nama_lengkap}</span>
                          <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                            {tag.nisn}
                          </span>
                        </div>
                        <p className="text-slate-700 italic text-[11px] leading-snug">
                          "{tag.catatan}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Input / Edit Jurnal Mengajar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-800 text-base">
                  {editingJournal ? 'Edit Jurnal Mengajar' : 'Input Jurnal Mengajar & Refleksi Guru'}
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
              {/* Row 1: Hari, Tanggal, Jam */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Hari *
                  </label>
                  <select
                    value={formHari}
                    onChange={(e) =>
                      setFormHari(
                        e.target.value as 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Pilih Kelas *
                  </label>
                  <select
                    value={formKelas}
                    onChange={(e) => {
                      setFormKelas(e.target.value);
                      // Clear tagged students if class changes
                      setTaggedNotes([]);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        Kelas {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Jam Ke & Materi Pokok */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Jam Ke / Waktu
                  </label>
                  <input
                    type="text"
                    value={formJamKe}
                    onChange={(e) => setFormJamKe(e.target.value)}
                    placeholder="Contoh: 1 - 2 (07.30 - 09.00)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Materi Pokok Pembelajaran *
                  </label>
                  <input
                    type="text"
                    required
                    value={formMateri}
                    onChange={(e) => setFormMateri(e.target.value)}
                    placeholder="Contoh: Fungsi Komposisi dan Invers"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tujuan Pembelajaran */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tujuan Pembelajaran (TP)
                </label>
                <input
                  type="text"
                  value={formTP}
                  onChange={(e) => setFormTP(e.target.value)}
                  placeholder="Contoh: TP 11.2 Menentukan rumus aljabar fungsi komposisi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Aktivitas KBM */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Aktivitas Kegiatan Pembelajaran (KBM)
                </label>
                <textarea
                  rows={2}
                  value={formAktivitas}
                  onChange={(e) => setFormAktivitas(e.target.value)}
                  placeholder="Ceritakan singkat alur kegiatan belajar mengajar di kelas..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Refleksi Guru (Menu Wajib Refleksi) */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1.5">
                <label className="font-bold text-blue-900 block flex items-center gap-1.5">
                  <MessageSquareQuote className="w-4 h-4 text-blue-700" />
                  <span>Refleksi Guru (Evaluasi KBM, Hambatan & Solusi) *</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formRefleksi}
                  onChange={(e) => setFormRefleksi(e.target.value)}
                  placeholder="Tuliskan refleksi hasil belajar siswa, bagian materi yang masih sulit dipahami, suasana kelas, dan rencana tindak lanjut..."
                  className="w-full bg-white border border-blue-200 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 resize-none font-medium leading-relaxed shadow-2xs"
                />
              </div>

              {/* TAG SISWA SECARA KHUSUS (Permintaan 7) */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-700" />
                    <span>Mentaq Siswa Secara Khusus (Catatan Masuk ke Dashboard Siswa)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-semibold">
                    Fitur Sinkronisasi Portal Siswa
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-tight">
                  Pilih siswa kelas {formKelas} untuk diberikan catatan perkembangan/bimbingan/apresiasi khusus. Catatan ini akan otomatis muncul saat siswa tersebut login ke akunnya pada menu <strong>Catatan Siswa</strong>.
                </p>

                {/* Tag Input Form */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-amber-200">
                  <div className="sm:col-span-5">
                    <select
                      value={selectedStudentToTag}
                      onChange={(e) => setSelectedStudentToTag(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      <option value="">-- Pilih Siswa yang Ditag --</option>
                      {studentsInFormClass.map((st) => (
                        <option key={st.nisn} value={st.nisn}>
                          {st.nama_lengkap} ({st.nisn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Tulis catatan personal untuk siswa..."
                      value={studentNoteInput}
                      onChange={(e) => setStudentNoteInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddTaggedStudent}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-2 rounded-lg text-xs transition-colors shadow-2xs"
                    >
                      + Tag Siswa
                    </button>
                  </div>
                </div>

                {/* List of currently tagged students */}
                {taggedNotes.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                      Daftar Siswa yang Di-tag dalam Jurnal Ini ({taggedNotes.length}):
                    </span>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {taggedNotes.map((tag) => (
                        <div
                          key={tag.nisn}
                          className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-amber-200 text-[11px]"
                        >
                          <div className="truncate flex-1">
                            <span className="font-bold text-slate-800 mr-2">
                              {tag.nama_lengkap}:
                            </span>
                            <span className="text-slate-600 italic truncate">
                              "{tag.catatan}"
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTaggedStudent(tag.nisn)}
                            className="text-rose-500 hover:text-rose-700 p-1 shrink-0"
                            title="Hapus tag"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
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
                  {editingJournal ? 'Simpan Perubahan' : 'Simpan Jurnal & Kirim Catatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
