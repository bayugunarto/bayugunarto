import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  GraduationCap,
  Edit2,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  X,
  FileDown,
  CheckSquare,
  Square
} from 'lucide-react';
import { Student } from '../types';
import { exportToCSV, parseCSV } from '../utils/csv';

interface DataSiswaProps {
  students?: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  availableClasses?: string[];
}

export const DataSiswa: React.FC<DataSiswaProps> = ({
  students = [],
  setStudents,
  availableClasses = ['XI-1', 'XI-2', 'XI-3', 'XI-4'],
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterKelas, setFilterKelas] = useState<string>('Semua');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Selected students for bulk delete
  const [selectedNisns, setSelectedNisns] = useState<string[]>([]);

  // Simple Add Student form state (NISN, Nama Siswa, Kelas)
  const [formData, setFormData] = useState<{
    nisn: string;
    nama_lengkap: string;
    kelas: string;
  }>({
    nisn: '',
    nama_lengkap: '',
    kelas: availableClasses[0] || 'XI-1',
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredStudents = useMemo(() => {
    return (students || []).filter((student) => {
      const matchSearch =
        student.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nisn.includes(searchTerm);
      const matchClass = filterKelas === 'Semua' || student.kelas === filterKelas;
      return matchSearch && matchClass;
    });
  }, [students, searchTerm, filterKelas]);

  // Bulk selection logic
  const allFilteredNisns = useMemo(() => filteredStudents.map((s) => s.nisn), [filteredStudents]);
  const isAllSelected =
    allFilteredNisns.length > 0 && allFilteredNisns.every((nisn) => selectedNisns.includes(nisn));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all filtered
      setSelectedNisns((prev) => prev.filter((nisn) => !allFilteredNisns.includes(nisn)));
    } else {
      // Select all filtered
      setSelectedNisns((prev) => Array.from(new Set([...prev, ...allFilteredNisns])));
    }
  };

  const handleToggleSelectRow = (nisn: string) => {
    setSelectedNisns((prev) =>
      prev.includes(nisn) ? prev.filter((id) => id !== nisn) : [...prev, nisn]
    );
  };

  // Bulk Delete
  const handleDeleteSelected = () => {
    if (selectedNisns.length === 0) return;
    const count = selectedNisns.length;
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus ${count} siswa yang dipilih sekaligus? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      setStudents((prev) => prev.filter((s) => !selectedNisns.includes(s.nisn)));
      setSelectedNisns([]);
      showNotification(`${count} siswa berhasil dihapus sekaligus.`);
    }
  };

  // Download Template CSV (Hanya NISN, Nama Siswa, Kelas)
  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        NISN: '10889201',
        'Nama Siswa': 'ADITYA PRATAMA',
        Kelas: filterKelas !== 'Semua' ? filterKelas : 'XI-1',
      },
      {
        NISN: '10889202',
        'Nama Siswa': 'BELLA SAFITRI',
        Kelas: filterKelas !== 'Semua' ? filterKelas : 'XI-1',
      },
      {
        NISN: '10889203',
        'Nama Siswa': 'DIMAS ARDIAN',
        Kelas: filterKelas !== 'Semua' ? filterKelas : 'XI-1',
      },
    ];

    exportToCSV(`Template_Siswa_${filterKelas !== 'Semua' ? filterKelas : 'Baru'}`, templateRows);
    showNotification('Template CSV siswa berhasil diunduh. Silakan isi dan unggah kembali.');
  };

  // Export current list to CSV
  const handleExportCSV = () => {
    const exportData = filteredStudents.map((s, idx) => ({
      No: idx + 1,
      NISN: s.nisn,
      'Nama Siswa': s.nama_lengkap,
      Kelas: s.kelas,
    }));
    exportToCSV(`Data_Siswa_${filterKelas}`, exportData);
    showNotification('Data siswa berhasil diekspor ke CSV.');
  };

  // Import CSV Kolektif (NISN, Nama Siswa, Kelas)
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        if (!parsed || parsed.length === 0) {
          alert('File CSV kosong atau format tidak sesuai.');
          return;
        }

        let importedCount = 0;
        let updatedCount = 0;

        setStudents((prev) => {
          const map = new Map<string, Student>(prev.map((s) => [s.nisn, s]));

          parsed.forEach((row) => {
            const rawNisn = row['NISN'] || row['nisn'] || row['Nisn'];
            const rawNama =
              row['Nama Siswa'] ||
              row['nama_lengkap'] ||
              row['Nama'] ||
              row['nama'] ||
              row['Nama Lengkap'];
            const rawKelas = row['Kelas'] || row['kelas'] || (filterKelas !== 'Semua' ? filterKelas : 'XI-1');

            if (rawNisn && rawNama) {
              const cleanNisn = String(rawNisn).trim();
              const cleanNama = String(rawNama).trim().toUpperCase();
              const cleanKelas = String(rawKelas).trim();

              const existing = map.get(cleanNisn);
              if (existing) {
                map.set(cleanNisn, {
                  ...existing,
                  nama_lengkap: cleanNama,
                  kelas: cleanKelas,
                });
                updatedCount++;
              } else {
                map.set(cleanNisn, {
                  nisn: cleanNisn,
                  nama_lengkap: cleanNama,
                  kelas: cleanKelas,
                  password: '12345',
                  status_tempat_tinggal: 'Bersama Orang Tua',
                });
                importedCount++;
              }
            }
          });

          return Array.from(map.values());
        });

        showNotification(
          `Impor CSV selesai! ${importedCount} siswa baru ditambahkan, ${updatedCount} siswa diperbarui.`
        );
      } catch (err) {
        console.error(err);
        alert('Gagal membaca file CSV. Pastikan kolom sesuai: NISN, Nama Siswa, Kelas.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Tambah Siswa Satu per Satu
  const handleSaveAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNisn = formData.nisn.trim();
    const cleanNama = formData.nama_lengkap.trim().toUpperCase();

    if (!cleanNisn || !cleanNama) {
      alert('NISN dan Nama Siswa wajib diisi!');
      return;
    }

    if (students.some((s) => s.nisn === cleanNisn)) {
      alert(`Siswa dengan NISN "${cleanNisn}" sudah ada dalam data!`);
      return;
    }

    const newStudent: Student = {
      nisn: cleanNisn,
      nama_lengkap: cleanNama,
      kelas: formData.kelas,
      password: '12345',
      status_tempat_tinggal: 'Bersama Orang Tua',
    };

    setStudents((prev) => [newStudent, ...prev]);
    setIsAddModalOpen(false);
    showNotification(`Siswa ${cleanNama} berhasil ditambahkan!`);
    setFormData({
      nisn: '',
      nama_lengkap: '',
      kelas: availableClasses[0] || 'XI-1',
    });
  };

  // Edit Siswa
  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.nisn === selectedStudent.nisn
          ? {
              ...s,
              nama_lengkap: selectedStudent.nama_lengkap.trim().toUpperCase(),
              kelas: selectedStudent.kelas,
            }
          : s
      )
    );
    setIsEditModalOpen(false);
    showNotification(`Data siswa ${selectedStudent.nama_lengkap} berhasil diperbarui.`);
  };

  // Hapus Siswa Satu per Satu
  const handleDeleteSingleStudent = (nisn: string, nama: string) => {
    if (window.confirm(`Yakin ingin menghapus siswa "${nama}" (NISN: ${nisn})?`)) {
      setStudents((prev) => prev.filter((s) => s.nisn !== nisn));
      setSelectedNisns((prev) => prev.filter((id) => id !== nisn));
      showNotification(`Siswa ${nama} berhasil dihapus.`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {notification && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Data Siswa
            </h3>
            <p className="text-xs text-slate-500">
              Total {students.length} siswa terdaftar di mata pelajaran Matematika
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Tombol Hapus Sekaligus (Muncul jika ada siswa yang dicentang) */}
          {selectedNisns.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors animate-in fade-in"
              title="Hapus semua siswa yang dicentang"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus ({selectedNisns.length}) Terpilih</span>
            </button>
          )}

          {/* Tambah Siswa Satu per Satu */}
          <button
            id="btn-tambah-siswa"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>

          {/* Unduh Template CSV Siswa */}
          <button
            id="btn-unduh-template-siswa"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            title="Unduh format template CSV siswa (NISN, Nama Siswa, Kelas)"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            <span>Unduh Template CSV</span>
          </button>

          {/* Upload File CSV Kolektif */}
          <label
            htmlFor="upload-siswa-csv"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
            title="Upload data siswa kolektif via file CSV"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV Siswa</span>
            <input
              id="upload-siswa-csv"
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>

          {/* Ekspor CSV */}
          <button
            id="btn-export-siswa-csv"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition-colors shadow-2xs"
            title="Unduh daftar siswa saat ini ke CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-siswa"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau NISN..."
                className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-60 md:w-80"
              />
            </div>

            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option value="Semua">Semua Kelas</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            {selectedNisns.length > 0 && (
              <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                {selectedNisns.length} siswa dicentang
              </span>
            )}
            <span className="font-mono">
              Menampilkan {filteredStudents.length} siswa
            </span>
          </div>
        </div>

        {/* Tabel Data Siswa: Hanya No, Centang, NISN, Nama Siswa, Kelas, Aksi */}
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse text-xs select-text">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                {/* Header Checkbox (Pilih Semua) */}
                <th className="py-3 px-3 text-center border-r border-slate-200 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title={isAllSelected ? 'Batal pilih semua' : 'Pilih semua siswa di tabel'}
                  />
                </th>
                <th className="py-3 px-3 text-center border-r border-slate-200 w-12">
                  No
                </th>
                <th className="py-3 px-3 border-r border-slate-200 w-36 font-mono">
                  NISN
                </th>
                <th className="py-3 px-3 border-r border-slate-200 min-w-[240px]">
                  Nama Siswa
                </th>
                <th className="py-3 px-3 border-r border-slate-200 w-24 text-center">
                  Kelas
                </th>
                <th className="py-3 px-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Tidak ditemukan data siswa. Silakan tambah siswa atau impor CSV.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const isChecked = selectedNisns.includes(student.nisn);
                  return (
                    <tr
                      key={student.nisn}
                      className={`transition-colors ${
                        isChecked ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Checkbox per baris */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-200 bg-slate-50/30">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectRow(student.nisn)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 border-r border-slate-200 bg-slate-50/30">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 font-semibold border-r border-slate-200 whitespace-nowrap">
                        {student.nisn}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                        {student.nama_lengkap}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-700 border-r border-slate-200">
                        <span className="inline-block bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 rounded-lg">
                          {student.kelas}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSingleStudent(student.nisn, student.nama_lengkap)}
                          className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center ml-1"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Siswa (Sederhana: Hanya NISN, Nama Siswa, Kelas) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">
                  Tambah Siswa Baru
                </h4>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddStudent} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  NISN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan 10 digit NISN (contoh: 10889211)"
                  value={formData.nisn}
                  onChange={(e) =>
                    setFormData({ ...formData, nisn: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan Nama Lengkap Siswa"
                  value={formData.nama_lengkap}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_lengkap: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none transition-colors uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Kelas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.kelas}
                  onChange={(e) =>
                    setFormData({ ...formData, kelas: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition-colors"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Siswa (Hanya NISN, Nama Siswa, Kelas) */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">
                  Edit Data Siswa
                </h4>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  NISN (Tidak dapat diubah)
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedStudent.nisn}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={selectedStudent.nama_lengkap}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      nama_lengkap: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none transition-colors uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Kelas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedStudent.kelas}
                  onChange={(e) =>
                    setSelectedStudent({ ...selectedStudent, kelas: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition-colors"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
