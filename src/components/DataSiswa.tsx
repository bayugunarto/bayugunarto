import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  GraduationCap,
  Edit2,
  Trash2,
  UserCheck,
  Phone,
  FileSpreadsheet,
  CheckCircle2,
  X
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

  // New Student form
  const [formData, setFormData] = useState<Student>({
    nisn: '',
    nama_lengkap: '',
    kelas: 'XI-1',
    no_HP: '',
    agama: 'Islam',
    hoby: '',
    rencana_tamat_SMA: '',
    riwayat_penyakit: '',
    nama_ayah: '',
    pekerjaan_ayah: '',
    no_HP_ayah: '',
    nama_ibu: '',
    pekerjaan_ibu: '',
    no_HP_ibu: '',
    alamat_rumah: '',
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredStudents = useMemo(() => {
    return (students || []).filter((student) => {
      const matchSearch =
        student.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nisn.includes(searchTerm) ||
        (student.hoby && student.hoby.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchClass = filterKelas === 'Semua' || student.kelas === filterKelas;
      return matchSearch && matchClass;
    });
  }, [students, searchTerm, filterKelas]);

  const handleExportCSV = () => {
    const exportData = filteredStudents.map((s, idx) => ({
      No: idx + 1,
      NISN: s.nisn,
      nama_lengkap: s.nama_lengkap,
      kelas: s.kelas,
      no_HP: s.no_HP || '',
      agama: s.agama || '',
      hoby: s.hoby || '',
      rencana_tamat_SMA: s.rencana_tamat_SMA || '',
      nama_ayah: s.nama_ayah || '',
      pekerjaan_ayah: s.pekerjaan_ayah || '',
      no_HP_ayah: s.no_HP_ayah || '',
      nama_ibu: s.nama_ibu || '',
      pekerjaan_ibu: s.pekerjaan_ibu || '',
      no_HP_ibu: s.no_HP_ibu || '',
      alamat_rumah: s.alamat_rumah || '',
      status_tempat_tinggal: s.status_tempat_tinggal || '',
      pembelajaran_nyaman: s.pembelajaran_nyaman || '',
      harapan_guru_matematika: s.harapan_guru_matematika || '',
      URL_foto: s.URL_foto || '',
    }));
    exportToCSV(`Data_Siswa_${filterKelas}`, exportData);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          alert('File CSV kosong atau tidak valid.');
          return;
        }

        const newStudents: Student[] = parsed.map((row) => ({
          nisn: row['NISN'] || row['nisn'] || `10${Math.floor(1000000 + Math.random() * 9000000)}`,
          nama_lengkap: row['nama_lengkap'] || row['Nama Siswa'] || row['Nama'] || 'Siswa Baru',
          kelas: row['kelas'] || row['Kelas'] || 'XI-1',
          no_HP: row['no_HP'] || row['No HP'] || '',
          agama: row['agama'] || row['Agama'] || '',
          hoby: row['hoby'] || row['Hobi'] || '',
          rencana_tamat_SMA: row['rencana_tamat_SMA'] || row['Rencana Tamat SMA'] || '',
          riwayat_penyakit: row['riwayat_penyakit'] || '',
          nama_ayah: row['nama_ayah'] || '',
          pekerjaan_ayah: row['pekerjaan_ayah'] || '',
          no_HP_ayah: row['no_HP_ayah'] || '',
          nama_ibu: row['nama_ibu'] || '',
          pekerjaan_ibu: row['pekerjaan_ibu'] || '',
          no_HP_ibu: row['no_HP_ibu'] || '',
          alamat_rumah: row['alamat_rumah'] || '',
          status_tempat_tinggal: row['status_tempat_tinggal'] || 'Bersama Orang Tua',
          pembelajaran_nyaman: row['pembelajaran_nyaman'] || '',
          harapan_guru_matematika: row['harapan_guru_matematika'] || '',
          URL_foto: row['URL_foto'] || '',
        }));

        setStudents((prev) => {
          const existingNisns = new Set(prev.map((s) => s.nisn));
          const additions = newStudents.filter((s) => !existingNisns.has(s.nisn));
          return [...prev, ...additions];
        });

        showNotification(`Berhasil mengimpor siswa dari spreadsheet CSV!`);
      } catch (err) {
        alert('Gagal mengurai file CSV.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nisn || !formData.nama_lengkap) {
      alert('NISN dan Nama Lengkap wajib diisi!');
      return;
    }
    setStudents((prev) => [formData, ...prev]);
    setIsAddModalOpen(false);
    showNotification(`Siswa ${formData.nama_lengkap} berhasil ditambahkan.`);
    setFormData({
      nisn: '',
      nama_lengkap: '',
      kelas: 'XI-1',
      no_HP: '',
      agama: 'Islam',
      hoby: '',
      rencana_tamat_SMA: '',
      riwayat_penyakit: '',
      nama_ayah: '',
      pekerjaan_ayah: '',
      no_HP_ayah: '',
      nama_ibu: '',
      pekerjaan_ibu: '',
      no_HP_ibu: '',
      alamat_rumah: '',
    });
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setStudents((prev) =>
      prev.map((s) => (s.nisn === selectedStudent.nisn ? selectedStudent : s))
    );
    setIsEditModalOpen(false);
    showNotification(`Data ${selectedStudent.nama_lengkap} diperbarui.`);
  };

  const handleDeleteStudent = (nisn: string) => {
    if (confirm('Yakin ingin menghapus data siswa ini?')) {
      setStudents((prev) => prev.filter((s) => s.nisn !== nisn));
      showNotification('Siswa berhasil dihapus dari sistem.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {notification && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Data Pokok Siswa (Buku Induk)
            </h3>
            <p className="text-xs text-slate-500">
              Total {students.length} siswa terdaftar di mata pelajaran Matematika
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            id="btn-tambah-siswa"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>

          <label
            htmlFor="upload-siswa-csv"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
            <input
              id="upload-siswa-csv"
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>

          <button
            id="btn-export-siswa-csv"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and search */}
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
                placeholder="Cari nama, NISN, cita-cita..."
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

          <span className="text-xs font-mono text-slate-500">
            Menampilkan {filteredStudents.length} siswa
          </span>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse text-xs select-text">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                <th className="py-3 px-3 text-center border-r border-slate-200 w-12">
                  No
                </th>
                <th className="py-3 px-3 border-r border-slate-200 w-28">NISN</th>
                <th className="py-3 px-3 border-r border-slate-200 min-w-[200px]">
                  Nama Lengkap
                </th>
                <th className="py-3 px-3 border-r border-slate-200 w-20 text-center">
                  Kelas
                </th>
                <th className="py-3 px-3 border-r border-slate-200 w-28">No. HP</th>
                <th className="py-3 px-3 border-r border-slate-200 w-24">Agama</th>
                <th className="py-3 px-3 border-r border-slate-200 w-32">Hobi</th>
                <th className="py-3 px-3 border-r border-slate-200 min-w-[150px]">
                  Rencana Tamat SMA
                </th>
                <th className="py-3 px-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data siswa.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr
                    key={student.nisn}
                    className="hover:bg-blue-50/20 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400 border-r border-slate-200 bg-slate-50/40">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {student.nisn}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 border-r border-slate-200">
                      {student.nama_lengkap}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-blue-700 border-r border-slate-200">
                      {student.kelas}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-200">
                      {student.no_HP || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                      {student.agama || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                      {student.hoby || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                      <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                        {student.rencana_tamat_SMA || '-'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                        title="Edit Siswa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.nisn)}
                        className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded ml-1"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Siswa */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 text-base">
                Edit Data Siswa
              </h4>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    NISN
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedStudent.nisn}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Kelas
                  </label>
                  <select
                    value={selectedStudent.kelas}
                    onChange={(e) =>
                      setSelectedStudent({ ...selectedStudent, kelas: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={selectedStudent.nama_lengkap}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      nama_lengkap: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    No. Handphone
                  </label>
                  <input
                    type="text"
                    value={selectedStudent.no_HP || ''}
                    onChange={(e) =>
                      setSelectedStudent({
                        ...selectedStudent,
                        no_HP: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Hobi
                  </label>
                  <input
                    type="text"
                    value={selectedStudent.hoby || ''}
                    onChange={(e) =>
                      setSelectedStudent({
                        ...selectedStudent,
                        hoby: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Rencana Tamat SMA (Cita-cita / Jurusan PTN)
                </label>
                <input
                  type="text"
                  value={selectedStudent.rencana_tamat_SMA || ''}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      rencana_tamat_SMA: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Siswa */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 text-base">
                Tambah Siswa Baru
              </h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddStudent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    NISN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 10889211"
                    value={formData.nisn}
                    onChange={(e) =>
                      setFormData({ ...formData, nisn: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Kelas *
                  </label>
                  <select
                    value={formData.kelas}
                    onChange={(e) =>
                      setFormData({ ...formData, kelas: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama sesuai akta lahir"
                  value={formData.nama_lengkap}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_lengkap: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    No. HP
                  </label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxx"
                    value={formData.no_HP || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, no_HP: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Rencana Tamat SMA
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kuliah PTN / Kedokteran"
                    value={formData.rencana_tamat_SMA || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, rencana_tamat_SMA: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
