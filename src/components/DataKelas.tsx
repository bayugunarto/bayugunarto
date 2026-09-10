import React, { useState } from 'react';
import {
  Building2,
  Users,
  User,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  Phone,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { ClassItem, Student } from '../types';

interface DataKelasProps {
  classes?: ClassItem[];
  setClasses?: React.Dispatch<React.SetStateAction<ClassItem[]>>;
  onSelectClass?: (className: string) => void;
  students?: Student[];
}

export const DataKelas: React.FC<DataKelasProps> = ({
  classes = [],
  setClasses,
  onSelectClass,
  students = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ClassItem>>({
    nama: '',
    tingkat: 'XI',
    jurusan: 'MIPA / Peminatan',
    waliKelas: '',
    nipWaliKelas: '',
    noHpWaliKelas: '',
    ruang: 'R.201',
    totalSiswa: 25,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      nama: '',
      tingkat: 'XI',
      jurusan: 'MIPA / Peminatan',
      waliKelas: '',
      nipWaliKelas: '',
      noHpWaliKelas: '',
      ruang: 'R.201',
      totalSiswa: 25,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setEditingClass(cls);
    setFormData({ ...cls });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Apakah Bapak yakin ingin menghapus rombel Kelas ${nama}?`)) {
      setClasses((prev) => prev.filter((c) => c.id !== id));
      showToast(`Kelas ${nama} berhasil dihapus.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.waliKelas) {
      alert('Nama Kelas dan Nama Wali Kelas wajib diisi!');
      return;
    }

    if (editingClass) {
      // Update existing
      setClasses((prev) =>
        prev.map((c) =>
          c.id === editingClass.id
            ? {
                ...c,
                nama: formData.nama!,
                tingkat: (formData.tingkat as 'X' | 'XI' | 'XII') || 'XI',
                jurusan: formData.jurusan || 'Umum',
                waliKelas: formData.waliKelas!,
                nipWaliKelas: formData.nipWaliKelas || '',
                noHpWaliKelas: formData.noHpWaliKelas || '',
                ruang: formData.ruang || 'R.201',
                totalSiswa: Number(formData.totalSiswa) || 0,
              }
            : c
        )
      );
      showToast(`Data Wali Kelas & Rombel ${formData.nama} berhasil diperbarui!`);
    } else {
      // Create new
      const newClass: ClassItem = {
        id: `class-${Date.now()}`,
        nama: formData.nama!,
        tingkat: (formData.tingkat as 'X' | 'XI' | 'XII') || 'XI',
        jurusan: formData.jurusan || 'MIPA / Peminatan',
        waliKelas: formData.waliKelas!,
        nipWaliKelas: formData.nipWaliKelas || '',
        noHpWaliKelas: formData.noHpWaliKelas || '',
        ruang: formData.ruang || 'R.201',
        totalSiswa: Number(formData.totalSiswa) || 0,
      };
      setClasses((prev) => [...prev, newClass]);
      showToast(`Rombel Kelas ${newClass.nama} dengan Wali Kelas ${newClass.waliKelas} berhasil ditambahkan!`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast notification */}
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
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Data Kelas & Rombongan Belajar (Wali Kelas)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola identitas rombongan belajar, nama Wali Kelas, kontak, ruangan, dan jumlah siswa
          </p>
        </div>

        <button
          id="btn-tambah-kelas"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(classes || []).map((cls) => {
          // Count active students in this class
          const countInClass = (students || []).filter((s) => s.kelas === cls.nama).length || cls.totalSiswa;

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {cls.tingkat}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                      {cls.jurusan}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Data Wali Kelas & Ruangan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {classes.length > 1 && (
                      <button
                        onClick={() => handleDelete(cls.id, cls.nama)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="text-lg font-bold text-slate-800 tracking-tight">
                  Kelas {cls.nama}
                </h4>

                {/* Wali Kelas Highlight Card */}
                <div className="mt-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700">
                      Wali Kelas:
                    </span>
                    {cls.noHpWaliKelas && (
                      <a
                        href={`https://wa.me/${cls.noHpWaliKelas.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Phone className="w-2.5 h-2.5" />
                        <span>WA</span>
                      </a>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {cls.waliKelas || 'Belum diisi'}
                  </p>
                  {cls.nipWaliKelas && (
                    <p className="text-[10px] font-mono text-slate-500">
                      NIP: {cls.nipWaliKelas}
                    </p>
                  )}
                </div>

                <div className="space-y-2 mt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ruang: {cls.ruang}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Jumlah: {countInClass} Siswa Aktif</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(cls)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors text-center"
                >
                  Edit Wali Kelas
                </button>
                <button
                  onClick={() => onSelectClass(cls.nama)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors text-center shadow-2xs"
                >
                  Kelola Nilai
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Input / Edit Data Kelas & Wali Kelas */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-800 text-base">
                  {editingClass ? `Edit Kelas ${editingClass.nama}` : 'Tambah Rombongan Belajar'}
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
                    Nama Rombel / Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: XI-1"
                    value={formData.nama || ''}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tingkat Jenjang *
                  </label>
                  <select
                    value={formData.tingkat || 'XI'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tingkat: e.target.value as 'X' | 'XI' | 'XII',
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="X">Kelas X (Fase E)</option>
                    <option value="XI">Kelas XI (Fase F)</option>
                    <option value="XII">Kelas XII (Fase F Lanjut)</option>
                  </select>
                </div>
              </div>

              {/* INPUT WALI KELAS (Pertanyaan 1 User) */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-3">
                <span className="font-bold text-blue-900 block text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-700" />
                  <span>Data Guru Wali Kelas *</span>
                </span>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Nama Lengkap & Gelar Wali Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dra. Nurhasanah / Bayu Gunarto, M.Pd"
                    value={formData.waliKelas || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, waliKelas: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      NIP Wali Kelas
                    </label>
                    <input
                      type="text"
                      placeholder="198001..."
                      value={formData.nipWaliKelas || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, nipWaliKelas: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      No. HP / WhatsApp Wali Kelas
                    </label>
                    <input
                      type="text"
                      placeholder="0812..."
                      value={formData.noHpWaliKelas || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, noHpWaliKelas: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Ruang Kelas
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: R.201"
                    value={formData.ruang || ''}
                    onChange={(e) => setFormData({ ...formData, ruang: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Program / Jurusan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: MIPA / Umum"
                    value={formData.jurusan || ''}
                    onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
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
                  {editingClass ? 'Simpan Perubahan' : 'Tambah Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
