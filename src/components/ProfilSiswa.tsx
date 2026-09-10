import React, { useState, useMemo } from 'react';
import {
  User,
  Users,
  Search,
  Plus,
  Edit3,
  Phone,
  MessageCircle,
  MapPin,
  Home,
  Heart,
  BookOpen,
  Sparkles,
  Printer,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Target,
  Smile,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  Image as ImageIcon,
  HelpCircle,
  FolderDown,
  Upload,
  Download,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { Student } from '../types';
import { exportToCSV, parseCSV } from '../utils/csv';

interface ProfilSiswaProps {
  students?: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  availableClasses?: string[];
}

export const ProfilSiswa: React.FC<ProfilSiswaProps> = ({
  students = [],
  setStudents,
  availableClasses = ['XI-1', 'XI-2', 'XI-3', 'XI-4'],
}) => {
  // Class selection state
  const [selectedClass, setSelectedClass] = useState<string>(
    (availableClasses || []).includes('XI-1') ? 'XI-1' : (availableClasses && availableClasses[0]) || 'XI-1'
  );

  // Filter students by selected class
  const classStudents = useMemo(() => {
    return (students || []).filter((s) => s.kelas === selectedClass);
  }, [students, selectedClass]);

  // Selected student NISN state - default to first student in class if available
  const [selectedNisn, setSelectedNisn] = useState<string>(() => {
    const first = (students || []).find((s) => s.kelas === 'XI-1');
    return first ? first.nisn : (students && students[0]?.nisn) || '';
  });

  // Search filter for student list
  const [searchStudentTerm, setSearchStudentTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'profile' | 'grid'>('profile');

  // Edit / Add Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isPhotoEditOpen, setIsPhotoEditOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Selected student object
  const currentStudent = useMemo(() => {
    return (
      classStudents.find((s) => s.nisn === selectedNisn) ||
      classStudents[0] ||
      null
    );
  }, [classStudents, selectedNisn]);

  // Editing form data
  const [editFormData, setEditFormData] = useState<Student | null>(null);

  // New Student web form (NISN, Nama, Kelas as requested)
  const [newStudentData, setNewStudentData] = useState<Partial<Student>>({
    nisn: '',
    nama_lengkap: '',
    kelas: selectedClass,
    agama: 'Islam',
    no_HP: '',
    hoby: '',
    nama_ayah: '',
    pekerjaan_ayah: '',
    no_HP_ayah: '',
    nama_ibu: '',
    pekerjaan_ibu: '',
    no_HP_ibu: '',
    alamat_rumah: '',
    status_tempat_tinggal: 'Bersama Orang Tua',
    rencana_tamat_SMA: 'Kuliah PTN',
    pembelajaran_nyaman: 'Penjelasan konsep secara bertahap dan latihan soal interaktif',
    harapan_guru_matematika: 'Bapak guru sabar menjelaskan langkah rumus dan memberikan tips cara cepat',
    URL_foto: '',
  });

  const [photoUrlInput, setPhotoUrlInput] = useState<string>('');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Switch to student
  const handleSelectStudent = (nisn: string) => {
    setSelectedNisn(nisn);
    setViewMode('profile');
  };

  // Navigate prev / next
  const currentIndex = classStudents.findIndex((s) => s.nisn === currentStudent?.nisn);
  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      setSelectedNisn(classStudents[currentIndex - 1].nisn);
    }
  };
  const handleNextStudent = () => {
    if (currentIndex < classStudents.length - 1) {
      setSelectedNisn(classStudents[currentIndex + 1].nisn);
    }
  };

  // Open edit modal
  const handleOpenEdit = () => {
    if (currentStudent) {
      setEditFormData({ ...currentStudent });
      setIsEditModalOpen(true);
    }
  };

  // Save edited student
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    setStudents((prev) =>
      prev.map((s) => (s.nisn === editFormData.nisn ? editFormData : s))
    );
    setIsEditModalOpen(false);
    showToast(`Profil siswa ${editFormData.nama_lengkap} berhasil diperbarui!`);
  };

  // Save new student
  const handleSaveNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.nisn || !newStudentData.nama_lengkap || !newStudentData.kelas) {
      alert('NISN, Nama Siswa, dan Kelas wajib diisi melalui form!');
      return;
    }

    // Check duplicate NISN
    if (students.some((s) => s.nisn === newStudentData.nisn)) {
      alert('NISN ini sudah terdaftar dalam sistem!');
      return;
    }

    const fullStudent: Student = {
      nisn: newStudentData.nisn.trim(),
      nama_lengkap: newStudentData.nama_lengkap.trim().toUpperCase(),
      kelas: newStudentData.kelas,
      agama: newStudentData.agama || 'Islam',
      no_HP: newStudentData.no_HP || '',
      hoby: newStudentData.hoby || '',
      nama_ayah: newStudentData.nama_ayah || '',
      pekerjaan_ayah: newStudentData.pekerjaan_ayah || '',
      no_HP_ayah: newStudentData.no_HP_ayah || '',
      nama_ibu: newStudentData.nama_ibu || '',
      pekerjaan_ibu: newStudentData.pekerjaan_ibu || '',
      no_HP_ibu: newStudentData.no_HP_ibu || '',
      alamat_rumah: newStudentData.alamat_rumah || '',
      status_tempat_tinggal: newStudentData.status_tempat_tinggal || 'Bersama Orang Tua',
      rencana_tamat_SMA: newStudentData.rencana_tamat_SMA || '',
      pembelajaran_nyaman: newStudentData.pembelajaran_nyaman || '',
      harapan_guru_matematika: newStudentData.harapan_guru_matematika || '',
      URL_foto: newStudentData.URL_foto || '',
    };

    setStudents((prev) => [...prev, fullStudent]);
    setSelectedClass(fullStudent.kelas);
    setSelectedNisn(fullStudent.nisn);
    setIsAddModalOpen(false);
    showToast(`Siswa baru ${fullStudent.nama_lengkap} berhasil ditambahkan!`);
  };

  // Save direct photo URL
  const handleSavePhotoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.nisn === currentStudent.nisn ? { ...s, URL_foto: photoUrlInput } : s
      )
    );
    setIsPhotoEditOpen(false);
    showToast('Tautan foto siswa berhasil diperbarui!');
  };

  // Print profile card
  const handlePrint = () => {
    window.print();
  };

  // Reset student password back to 12345 (User Request 6)
  const handleResetPassword = (nisn: string, nama: string) => {
    if (
      window.confirm(
        `Reset password akun siswa untuk "${nama}" (NISN: ${nisn}) kembali ke password default "12345"?`
      )
    ) {
      setStudents((prev) =>
        prev.map((s) => (s.nisn === nisn ? { ...s, password: '12345' } : s))
      );
      showToast(`Password siswa ${nama} berhasil direset ke "12345"!`);
    }
  };

  // Collective CSV Template Download (Format Profil Siswa Lengkap)
  const handleDownloadCollectiveTemplate = () => {
    const headers = [
      { key: 'nisn' as keyof Student, label: 'NISN' },
      { key: 'nama_lengkap' as keyof Student, label: 'Nama Siswa' },
      { key: 'kelas' as keyof Student, label: 'Kelas' },
      { key: 'no_HP' as keyof Student, label: 'No HP' },
      { key: 'hoby' as keyof Student, label: 'Hoby & Kegemaran' },
      { key: 'rencana_tamat_SMA' as keyof Student, label: 'Rencana Setelah Tamat SMA' },
      { key: 'nama_ayah' as keyof Student, label: 'Nama Ayah' },
      { key: 'pekerjaan_ayah' as keyof Student, label: 'Pekerjaan Ayah' },
      { key: 'no_HP_ayah' as keyof Student, label: 'No. HP Ayah' },
      { key: 'nama_ibu' as keyof Student, label: 'Nama Ibu' },
      { key: 'pekerjaan_ibu' as keyof Student, label: 'Pekerjaan' },
      { key: 'no_HP_ibu' as keyof Student, label: 'No HP Ibu' },
      { key: 'alamat_rumah' as keyof Student, label: 'Alamat Rumah' },
      { key: 'status_tempat_tinggal' as keyof Student, label: 'Status Tinggal' },
      { key: 'pembelajaran_nyaman' as keyof Student, label: 'Pembelajaran yang membuat Nyaman' },
      { key: 'harapan_guru_matematika' as keyof Student, label: 'Harapan terhadap Guru Matematika' },
    ];

    const rowsToExport = (classStudents.length > 0 ? classStudents : students).map((s) => ({
      nisn: s.nisn,
      nama_lengkap: s.nama_lengkap,
      kelas: s.kelas,
      no_HP: s.no_HP || '',
      hoby: s.hoby || '',
      rencana_tamat_SMA: s.rencana_tamat_SMA || '',
      nama_ayah: s.nama_ayah || '',
      pekerjaan_ayah: s.pekerjaan_ayah || '',
      no_HP_ayah: s.no_HP_ayah || '',
      nama_ibu: s.nama_ibu || '',
      pekerjaan_ibu: s.pekerjaan_ibu || '',
      no_HP_ibu: s.no_HP_ibu || '',
      alamat_rumah: s.alamat_rumah || '',
      status_tempat_tinggal: s.status_tempat_tinggal || 'Bersama Orang Tua',
      pembelajaran_nyaman: s.pembelajaran_nyaman || '',
      harapan_guru_matematika: s.harapan_guru_matematika || '',
    }));

    exportToCSV(`Format_Profil_Siswa_Kelas_${selectedClass}`, rowsToExport as any, headers);
    showToast(`Format template profil siswa kelas ${selectedClass} berhasil diunduh!`);
  };

  // Collective CSV Upload (Mengisi Informasi Profil Kolektif)
  const handleUploadCSVCollective = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);

        if (!parsed || parsed.length === 0) {
          alert('File CSV kosong atau format header tidak valid!');
          return;
        }

        let updatedCount = 0;
        let addedCount = 0;

        setStudents((prev) => {
          const map = new Map<string, Student>(prev.map((s) => [s.nisn, s]));

          parsed.forEach((row) => {
            const rawNisn = row['NISN'] || row['nisn'] || row['Nisn'];
            const rawNama =
              row['Nama Siswa'] ||
              row['nama_lengkap'] ||
              row['Nama Lengkap'] ||
              row['Nama'] ||
              row['nama'];
            const rawKelas = row['Kelas'] || row['kelas'] || selectedClass;

            if (rawNisn && rawNama) {
              const nisn = String(rawNisn).trim();
              const existing = map.get(nisn);

              const updatedStudent: Student = {
                ...(existing || {}),
                nisn: nisn,
                nama_lengkap: String(rawNama).trim().toUpperCase(),
                kelas: String(rawKelas).trim(),
                no_HP: row['No HP'] || row['no_HP'] || row['No. HP'] || row['No HP Siswa'] || existing?.no_HP || '',
                hoby: row['Hoby & Kegemaran'] || row['hoby'] || row['Hobi'] || row['Hobby'] || existing?.hoby || '',
                rencana_tamat_SMA:
                  row['Rencana Setelah Tamat SMA'] ||
                  row['rencana_tamat_SMA'] ||
                  row['Rencana Tamat SMA'] ||
                  existing?.rencana_tamat_SMA ||
                  '',
                nama_ayah: row['Nama Ayah'] || row['nama_ayah'] || existing?.nama_ayah || '',
                pekerjaan_ayah: row['Pekerjaan Ayah'] || row['pekerjaan_ayah'] || existing?.pekerjaan_ayah || '',
                no_HP_ayah: row['No. HP Ayah'] || row['No HP Ayah'] || row['no_HP_ayah'] || existing?.no_HP_ayah || '',
                nama_ibu: row['Nama Ibu'] || row['nama_ibu'] || existing?.nama_ibu || '',
                pekerjaan_ibu:
                  row['Pekerjaan'] ||
                  row['Pekerjaan Ibu'] ||
                  row['pekerjaan_ibu'] ||
                  existing?.pekerjaan_ibu ||
                  '',
                no_HP_ibu: row['No HP Ibu'] || row['No. HP Ibu'] || row['no_HP_ibu'] || existing?.no_HP_ibu || '',
                alamat_rumah: row['Alamat Rumah'] || row['alamat_rumah'] || row['Alamat'] || existing?.alamat_rumah || '',
                status_tempat_tinggal:
                  row['Status Tinggal'] ||
                  row['status_tempat_tinggal'] ||
                  row['Status Tempat Tinggal'] ||
                  existing?.status_tempat_tinggal ||
                  'Bersama Orang Tua',
                pembelajaran_nyaman:
                  row['Pembelajaran yang membuat Nyaman'] ||
                  row['pembelajaran_nyaman'] ||
                  row['Pembelajaran Yang Nyaman'] ||
                  existing?.pembelajaran_nyaman ||
                  '',
                harapan_guru_matematika:
                  row['Harapan terhadap Guru Matematika'] ||
                  row['harapan_guru_matematika'] ||
                  row['Harapan Terhadap Guru Matematika'] ||
                  existing?.harapan_guru_matematika ||
                  '',
                URL_foto: existing?.URL_foto || '',
                password: existing?.password || '12345',
              };

              if (existing) {
                updatedCount++;
              } else {
                addedCount++;
              }
              map.set(nisn, updatedStudent);
            }
          });

          return Array.from(map.values());
        });

        showToast(
          `Berhasil impor profil kolektif: ${updatedCount} profil diperbarui, ${addedCount} siswa baru ditambahkan!`
        );
      } catch (err) {
        console.error(err);
        alert('Gagal membaca file CSV. Pastikan format tabel sesuai dengan template.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };


  // Helper WhatsApp link
  const getWhatsAppLink = (phone?: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="space-y-6 pb-16 print:p-0 print:space-y-2">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Filter Bar: Dropdown Pilih Kelas & Pilih Nama Siswa */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs print:hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Profil Lengkap Siswa</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih kelas dan siswa untuk melihat biodata, kontak orang tua, latar belakang, dan preferensi belajar matematika
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Toggle view mode */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
              <button
                onClick={() => setViewMode('profile')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'profile'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kartu Profil
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Galeri Foto Kelas ({classStudents.length})
              </button>
            </div>

            {/* Unduh Format Template CSV Profil */}
            <button
              id="btn-unduh-format-profil"
              onClick={handleDownloadCollectiveTemplate}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
              title="Unduh Format CSV untuk mengisi profil siswa secara kolektif"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Unduh Format CSV</span>
            </button>

            {/* Upload CSV Profil Kolektif */}
            <label
              htmlFor="upload-profil-csv"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
              title="Upload file CSV untuk mengisi data profil siswa secara kolektif"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Profil CSV Kolektif</span>
              <input
                id="upload-profil-csv"
                type="file"
                accept=".csv"
                onChange={handleUploadCSVCollective}
                className="hidden"
              />
            </label>

            {/* Tambah Siswa Baru Web Button */}
            <button
              id="btn-tambah-siswa-web"
              onClick={() => {
                setNewStudentData({
                  nisn: '',
                  nama_lengkap: '',
                  kelas: selectedClass,
                  agama: 'Islam',
                  no_HP: '',
                  hoby: '',
                  nama_ayah: '',
                  pekerjaan_ayah: '',
                  no_HP_ayah: '',
                  nama_ibu: '',
                  pekerjaan_ibu: '',
                  no_HP_ibu: '',
                  alamat_rumah: '',
                  status_tempat_tinggal: 'Bersama Orang Tua',
                  rencana_tamat_SMA: 'Kuliah PTN',
                  pembelajaran_nyaman: 'Penjelasan konsep secara bertahap dan latihan soal terstruktur',
                  harapan_guru_matematika: 'Bimbingan sabar saat murid bingung rumus dan banyak tips latihan soal',
                  URL_foto: '',
                });
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Input Siswa Baru (Web)</span>
            </button>

            {/* Print Button */}
            {currentStudent && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                title="Cetak Kartu Profil Siswa"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cetak Kartu</span>
              </button>
            )}
          </div>
        </div>

        {/* Selection Controls Grid: Pilih Kelas & Pilih Siswa */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Dropdown 1: Pilih Kelas */}
          <div className="lg:col-span-4">
            <label className="text-[11px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">
              1. Pilih Rombongan Belajar (Kelas)
            </label>
            <div className="relative">
              <select
                id="select-profil-kelas"
                value={selectedClass}
                onChange={(e) => {
                  const newClass = e.target.value;
                  setSelectedClass(newClass);
                  const firstInNewClass = students.find((s) => s.kelas === newClass);
                  if (firstInNewClass) {
                    setSelectedNisn(firstInNewClass.nisn);
                  }
                }}
                className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {(availableClasses || []).map((cls) => {
                  const count = (students || []).filter((s) => s.kelas === cls).length;
                  return (
                    <option key={cls} value={cls}>
                      Kelas {cls} ({count} Siswa)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Dropdown 2: Pilih Nama Siswa */}
          <div className="lg:col-span-5">
            <label className="text-[11px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">
              2. Pilih Nama Siswa di Kelas {selectedClass}
            </label>
            <div className="relative">
              <select
                id="select-profil-siswa"
                value={currentStudent?.nisn || ''}
                onChange={(e) => handleSelectStudent(e.target.value)}
                className="w-full bg-blue-50/50 hover:bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2 text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {classStudents.length === 0 ? (
                  <option value="">Tidak ada siswa di kelas ini</option>
                ) : (
                  classStudents.map((st, idx) => (
                    <option key={st.nisn} value={st.nisn}>
                      {idx + 1}. {st.nama_lengkap} (NISN: {st.nisn})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Navigasi Siswa Cepat Sebelumnya / Berikutnya */}
          <div className="lg:col-span-3 flex items-center justify-end gap-2 pt-4 sm:pt-0">
            <button
              onClick={handlePrevStudent}
              disabled={currentIndex <= 0}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Siswa Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <span className="text-xs font-mono text-slate-500">
              {currentIndex + 1} / {classStudents.length}
            </span>
            <button
              onClick={handleNextStudent}
              disabled={currentIndex >= classStudents.length - 1}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Siswa Berikutnya"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Horizontal Student Chips for Easy Clicking */}
        <div className="pt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-medium text-slate-400 shrink-0 mr-1">
            Pilih Cepat:
          </span>
          {classStudents.map((st, i) => {
            const isSelected = st.nisn === currentStudent?.nisn;
            const firstName = st.nama_lengkap.split(' ')[0];
            return (
              <button
                key={st.nisn}
                onClick={() => handleSelectStudent(st.nisn)}
                className={`px-2.5 py-1 rounded-lg text-xs shrink-0 font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {i + 1}. {firstName}
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: GRID VIEW OF ALL CLASS STUDENTS */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Daftar Foto & Siswa Kelas {selectedClass} ({classStudents.length} Siswa)
            </h3>
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama atau hobi..."
                value={searchStudentTerm}
                onChange={(e) => setSearchStudentTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {classStudents
              .filter((st) =>
                st.nama_lengkap.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
                st.nisn.includes(searchStudentTerm) ||
                (st.hoby && st.hoby.toLowerCase().includes(searchStudentTerm.toLowerCase()))
              )
              .map((st, index) => {
                const isCurrent = st.nisn === currentStudent?.nisn;
                return (
                  <div
                    key={st.nisn}
                    onClick={() => handleSelectStudent(st.nisn)}
                    className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                      isCurrent
                        ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div>
                      {/* Photo Thumbnail */}
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-3 group-hover:scale-[1.02] transition-transform">
                        {st.URL_foto ? (
                          <img
                            src={st.URL_foto}
                            alt={st.nama_lengkap}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // fallback on error
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        {/* Fallback avatar if no photo or error */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-slate-100 to-blue-50 text-slate-600 -z-0">
                          <User className="w-10 h-10 text-slate-300 mb-1" />
                          <span className="text-[10px] text-slate-400 font-mono">
                            Link Foto Kosong
                          </span>
                        </div>
                        <div className="absolute top-2 left-2 bg-slate-900/70 text-white font-mono text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs font-bold">
                          #{index + 1}
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-800 text-xs line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {st.nama_lengkap}
                      </h4>
                      <p className="font-mono text-[11px] text-slate-500 mt-1">
                        NISN: {st.nisn}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1 truncate">
                        Agama: {st.agama || '-'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-blue-600 font-semibold group-hover:underline">
                        Lihat Profil
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {st.hoby ? st.hoby.split('&')[0] : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: FULL STUDENT PROFILE CARD */}
      {viewMode === 'profile' && currentStudent && (
        <div
          id="student-profile-printable"
          className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Profile Header Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 px-6 sm:px-8 py-6 text-white relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-blue-200 uppercase font-bold tracking-widest block">
                    Buku Induk Biodata Siswa SMA
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {currentStudent.nama_lengkap}
                  </h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 print:hidden self-start md:self-auto">
                <button
                  id="btn-edit-profil-lengkap"
                  onClick={handleOpenEdit}
                  className="inline-flex items-center gap-1.5 bg-white text-blue-700 hover:bg-blue-50 font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Data Manual</span>
                </button>
                <button
                  onClick={() => {
                    setPhotoUrlInput(currentStudent.URL_foto || '');
                    setIsPhotoEditOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-semibold px-3 py-2 rounded-xl text-xs backdrop-blur-md border border-white/20 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Ubah Link Foto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Profile Grid: Photo Column + Information Cards */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (4 cols): Photo, Identity Badges & Fast Actions */}
            <div className="lg:col-span-4 space-y-5">
              {/* Photo Box with clean official styling */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 text-center flex flex-col items-center">
                <div className="relative w-48 h-60 rounded-xl overflow-hidden shadow-md border-4 border-white bg-slate-200">
                  {currentStudent.URL_foto ? (
                    <img
                      src={currentStudent.URL_foto}
                      alt={currentStudent.nama_lengkap}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  {/* Fallback */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 text-slate-500 p-4">
                    <User className="w-16 h-16 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700">Foto Siswa</span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Link foto belum tersedia
                    </span>
                    <button
                      onClick={() => {
                        setPhotoUrlInput(currentStudent.URL_foto || '');
                        setIsPhotoEditOpen(true);
                      }}
                      className="mt-3 text-[11px] text-blue-600 hover:underline font-semibold bg-white px-2.5 py-1 rounded-md shadow-2xs border border-slate-200"
                    >
                      + Masukkan Link Foto
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">
                    {currentStudent.nama_lengkap}
                  </h4>
                  <p className="font-mono text-xs text-blue-700 font-bold">
                    NISN: {currentStudent.nisn}
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                      Kelas {currentStudent.kelas}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                      {currentStudent.agama || 'Islam'}
                    </span>
                  </div>
                </div>

                {/* Direct Link Foto Info */}
                <div className="mt-4 pt-3 border-t border-slate-200 w-full text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Sumber Link Foto (Sheet):
                  </span>
                  {currentStudent.URL_foto ? (
                    <a
                      href={currentStudent.URL_foto}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 hover:underline truncate flex items-center gap-1 font-mono"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{currentStudent.URL_foto}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Belum diisi di sheet data siswa
                    </span>
                  )}
                </div>

                {/* AKUN LOGIN PORTAL SISWA & RESET PASSWORD (Permintaan 6) */}
                <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl w-full text-left space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                      <span>Akun Portal Siswa</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900 font-mono text-[10px]">
                      NISN: {currentStudent.nisn}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-900 flex items-center justify-between">
                    <span>Password Default:</span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                      {currentStudent.password || '12345'}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleResetPassword(currentStudent.nisn, currentStudent.nama_lengkap)
                    }
                    className="w-full mt-1 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    title="Reset password jika siswa lupa password"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-700" />
                    <span>Reset Password ke 12345</span>
                  </button>
                </div>
              </div>

              {/* Quick Communication Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Kontak Langsung Siswa
                </span>

                <div className="flex items-center justify-between text-xs p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-700 font-mono">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>{currentStudent.no_HP || 'Belum diisi'}</span>
                  </div>
                  {currentStudent.no_HP && (
                    <a
                      href={getWhatsAppLink(currentStudent.no_HP)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Hobi & Rencana Masa Depan */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Heart className="w-4 h-4 text-amber-600" />
                  <span>Hobi & Kegemaran</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 bg-white/80 p-2.5 rounded-xl border border-amber-100">
                  {currentStudent.hoby || 'Belum diisi'}
                </p>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs mb-1.5">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>Rencana Setelah Tamat SMA</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                    {currentStudent.rencana_tamat_SMA || 'Belum diisi'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (8 cols): 4 Structured Sections Requested */}
            <div className="lg:col-span-8 space-y-6">
              {/* SECTION 1: DATA SISWA UTAMA */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Data Identitas Siswa</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Kurikulum Merdeka SMA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Nama Siswa:</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {currentStudent.nama_lengkap}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">NISN & Kelas:</span>
                    <span className="font-bold font-mono text-slate-800">
                      {currentStudent.nisn} • Kelas {currentStudent.kelas}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Agama:</span>
                    <span className="font-semibold text-slate-800">
                      {currentStudent.agama || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Nomor Handphone:</span>
                    <span className="font-semibold font-mono text-slate-800">
                      {currentStudent.no_HP || '-'}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block text-[11px]">Hobby:</span>
                    <span className="font-semibold text-slate-800">
                      {currentStudent.hoby || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DATA ORANG TUA (AYAH & IBU) */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="border-b border-slate-200/80 pb-2.5">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Data Orang Tua / Wali & Kontak Darurat</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Data Ayah */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md">
                        Data Ayah
                      </span>
                      {currentStudent.no_HP_ayah && (
                        <a
                          href={getWhatsAppLink(currentStudent.no_HP_ayah)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Chat WA</span>
                        </a>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">Nama Ayah:</span>
                      <p className="font-bold text-slate-800 text-xs">
                        {currentStudent.nama_ayah || '-'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">Pekerjaan Ayah:</span>
                      <p className="font-medium text-slate-700 text-xs flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span>{currentStudent.pekerjaan_ayah || '-'}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">No HP Ayah:</span>
                      <p className="font-mono text-xs font-semibold text-slate-800">
                        {currentStudent.no_HP_ayah || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Data Ibu */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-rose-900 bg-rose-50 px-2.5 py-0.5 rounded-md">
                        Data Ibu
                      </span>
                      {currentStudent.no_HP_ibu && (
                        <a
                          href={getWhatsAppLink(currentStudent.no_HP_ibu)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Chat WA</span>
                        </a>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">Nama Ibu:</span>
                      <p className="font-bold text-slate-800 text-xs">
                        {currentStudent.nama_ibu || '-'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">Pekerjaan Ibu:</span>
                      <p className="font-medium text-slate-700 text-xs flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span>{currentStudent.pekerjaan_ibu || '-'}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">No HP Ibu:</span>
                      <p className="font-mono text-xs font-semibold text-slate-800">
                        {currentStudent.no_HP_ibu || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ALAMAT RUMAH & STATUS TEMPAT TINGGAL */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="border-b border-slate-200/80 pb-2.5">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-600" />
                    <span>Domisili & Status Tempat Tinggal</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <span className="text-slate-400 block text-[11px] mb-1">
                      Alamat Rumah Lengkap:
                    </span>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800 font-medium leading-relaxed flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{currentStudent.alamat_rumah || 'Belum diisi'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] mb-1">
                      Status Tempat Tinggal:
                    </span>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 font-bold text-emerald-800 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{currentStudent.status_tempat_tinggal || 'Bersama Orang Tua'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: PREFERENSI BELAJAR & HARAPAN KHUSUS GURU MATEMATIKA */}
              <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white rounded-2xl border border-blue-200/80 p-5 space-y-4">
                <div className="border-b border-blue-200/60 pb-2.5 flex items-center justify-between">
                  <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Preferensi Belajar & Harapan terhadap Guru Matematika</span>
                  </h4>
                </div>

                {/* Pembelajaran yang membuat nyaman */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-blue-600" />
                    <span>Pembelajaran yang Membuat Nyaman:</span>
                  </span>
                  <div className="p-3.5 bg-white rounded-xl border border-blue-100 text-xs text-slate-700 font-medium leading-relaxed shadow-2xs">
                    {currentStudent.pembelajaran_nyaman ||
                      'Penjelasan materi runtut, diselingi diskusi kelompok, dan pemberian latihan terbimbing.'}
                  </div>
                </div>

                {/* Apa harapan terhadap Guru Matematika */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Apa Harapan terhadap Guru Matematika (Bpk. Bayu Gunarto, M.Pd):</span>
                  </span>
                  <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70 text-xs text-slate-800 font-semibold leading-relaxed shadow-2xs">
                    "{currentStudent.harapan_guru_matematika ||
                      'Bapak guru selalu sabar menjelaskan saat kami belum mengerti rumus dan memberikan banyak tips praktis.'}"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT DATA LENGKAP SISWA (MANUAL SHEET INPUT) */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  Edit Profil Siswa: {editFormData.nama_lengkap}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Identitas Web Input */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                <span className="text-xs font-bold text-blue-900 block">
                  Identitas Utama (Web & Sheet)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      NISN Siswa *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.nisn}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, nisn: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Nama Siswa *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.nama_lengkap}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, nama_lengkap: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Kelas *
                    </label>
                    <select
                      value={editFormData.kelas}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, kelas: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Agama
                    </label>
                    <select
                      value={editFormData.agama || 'Islam'}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, agama: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      No. HP Siswa
                    </label>
                    <input
                      type="text"
                      value={editFormData.no_HP || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, no_HP: e.target.value })
                      }
                      placeholder="0812..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Link Foto Siswa (URL dari Google Drive / Hosting / Unsplash)
                  </label>
                  <input
                    type="text"
                    value={editFormData.URL_foto || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, URL_foto: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Hobby, Masa Depan & Alamat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Hobby
                  </label>
                  <input
                    type="text"
                    value={editFormData.hoby || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, hoby: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Status Tempat Tinggal
                  </label>
                  <select
                    value={editFormData.status_tempat_tinggal || 'Bersama Orang Tua'}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status_tempat_tinggal: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="Bersama Orang Tua">Bersama Orang Tua</option>
                    <option value="Kost">Kost</option>
                    <option value="Asrama">Asrama</option>
                    <option value="Ikut Saudara / Wali">Ikut Saudara / Wali</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Alamat Rumah
                  </label>
                  <input
                    type="text"
                    value={editFormData.alamat_rumah || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, alamat_rumah: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Rencana Setelah Tamat SMA
                  </label>
                  <input
                    type="text"
                    value={editFormData.rencana_tamat_SMA || ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        rencana_tamat_SMA: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Data Orang Tua */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  Data Orang Tua (Ayah & Ibu)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Nama Ayah
                    </label>
                    <input
                      type="text"
                      value={editFormData.nama_ayah || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, nama_ayah: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Pekerjaan Ayah
                    </label>
                    <input
                      type="text"
                      value={editFormData.pekerjaan_ayah || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          pekerjaan_ayah: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      No. HP Ayah
                    </label>
                    <input
                      type="text"
                      value={editFormData.no_HP_ayah || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, no_HP_ayah: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Nama Ibu
                    </label>
                    <input
                      type="text"
                      value={editFormData.nama_ibu || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, nama_ibu: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Pekerjaan Ibu
                    </label>
                    <input
                      type="text"
                      value={editFormData.pekerjaan_ibu || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          pekerjaan_ibu: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      No. HP Ibu
                    </label>
                    <input
                      type="text"
                      value={editFormData.no_HP_ibu || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, no_HP_ibu: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Asesmen Preferensi Belajar & Harapan Guru Matematika */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Pembelajaran yang Membuat Nyaman
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.pembelajaran_nyaman || ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        pembelajaran_nyaman: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Apa Harapan terhadap Guru Matematika
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.harapan_guru_matematika || ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        harapan_guru_matematika: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INPUT SISWA BARU DARI WEB (NISN, NAMA, KELAS) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  Input Siswa Baru Melalui Web
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Input data dasar siswa (NISN, Nama Siswa, dan Kelas) langsung melalui aplikasi web.
              Data detail lainnya dapat dilengkapi kapan saja.
            </p>

            <form onSubmit={handleSaveNewStudent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  NISN Siswa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 10482910"
                  value={newStudentData.nisn}
                  onChange={(e) =>
                    setNewStudentData({ ...newStudentData, nisn: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BUDI SETIAWAN"
                  value={newStudentData.nama_lengkap}
                  onChange={(e) =>
                    setNewStudentData({
                      ...newStudentData,
                      nama_lengkap: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 uppercase focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pilih Kelas *
                </label>
                <select
                  value={newStudentData.kelas}
                  onChange={(e) =>
                    setNewStudentData({ ...newStudentData, kelas: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Agama
                  </label>
                  <select
                    value={newStudentData.agama || 'Islam'}
                    onChange={(e) =>
                      setNewStudentData({ ...newStudentData, agama: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    No. Handphone
                  </label>
                  <input
                    type="text"
                    placeholder="08..."
                    value={newStudentData.no_HP}
                    onChange={(e) =>
                      setNewStudentData({ ...newStudentData, no_HP: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Link Foto Siswa (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newStudentData.URL_foto}
                  onChange={(e) =>
                    setNewStudentData({ ...newStudentData, URL_foto: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Tambahkan Siswa ke Web
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: UBAH LINK FOTO CEPAT */}
      {isPhotoEditOpen && currentStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  Ubah Link Foto Siswa
                </h3>
              </div>
              <button
                onClick={() => setIsPhotoEditOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Foto siswa diambil dari data sheet berupa tautan/link URL gambar (Google Drive, hosting sekolah, atau URL gambar publik).
            </p>

            <form onSubmit={handleSavePhotoUrl} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Masukkan Link URL Foto:
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Live Preview */}
              {photoUrlInput && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-14 h-16 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                    <img
                      src={photoUrlInput}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-bold block text-slate-800">Pratinjau Foto</span>
                    <span className="text-[11px] text-slate-400">
                      Jika gambar tampil di kotak kiri, link valid.
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Simpan Link Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
