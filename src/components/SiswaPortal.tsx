import React, { useState, useMemo } from 'react';
import {
  Student,
  GradeItem,
  AttendanceItem,
  ScheduleItem,
  TeachingJournalItem,
  StudentUnifiedNote
} from '../types';
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  MessageSquare,
  KeyRound,
  LogOut,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  User,
  Calendar,
  BookOpen,
  Target,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  School,
  Lock
} from 'lucide-react';

interface SiswaPortalProps {
  currentStudent: Student;
  allStudents?: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  grades?: GradeItem[];
  attendance?: AttendanceItem[];
  schedules?: ScheduleItem[];
  journals?: TeachingJournalItem[];
  onLogout: () => void;
}

type SiswaTab = 'dashboard' | 'kehadiran' | 'nilai' | 'catatan' | 'password';

export const SiswaPortal: React.FC<SiswaPortalProps> = ({
  currentStudent,
  allStudents = [],
  setStudents,
  grades = [],
  attendance = [],
  schedules = [],
  journals = [],
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<SiswaTab>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-tabs for Kehadiran
  const [kehadiranSubTab, setKehadiranSubTab] = useState<'harian' | 'bulanan' | 'semester'>('harian');

  // Password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Student specific data
  const studentGrades = useMemo(() => {
    return (grades || []).filter((g) => g && g.nisn === currentStudent.nisn);
  }, [grades, currentStudent?.nisn]);

  const studentAttendance = useMemo(() => {
    return (attendance || []).filter((a) => a && a.nisn === currentStudent.nisn);
  }, [attendance, currentStudent?.nisn]);

  // Calculate Attendance Percentage
  const attendanceStats = useMemo(() => {
    const total = studentAttendance.length;
    if (total === 0) return { percent: 100, hadir: 0, sakit: 0, izin: 0, alpa: 0, total: 0 };

    const hadir = studentAttendance.filter((a) => a.status === 'Hadir').length;
    const sakit = studentAttendance.filter((a) => a.status === 'Sakit').length;
    const izin = studentAttendance.filter((a) => a.status === 'Izin').length;
    const alpa = studentAttendance.filter((a) => a.status === 'Alpa').length;

    // Hadir percentage (Hadir / total * 100)
    const percent = Math.round((hadir / total) * 100);
    return { percent, hadir, sakit, izin, alpa, total };
  }, [studentAttendance]);

  // Calculate Grade Average
  const gradeStats = useMemo(() => {
    if (studentGrades.length === 0) return { avg: 0, totalCount: 0, highest: 0, lowest: 0 };
    const sum = studentGrades.reduce((acc, g) => acc + g.nilai, 0);
    const avg = Math.round(sum / studentGrades.length);
    const scores = studentGrades.map((g) => g.nilai);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    return { avg, totalCount: studentGrades.length, highest, lowest };
  }, [studentGrades]);

  // Get Today's Day in Indonesian
  const todayDayName = useMemo(() => {
    const days: ('Minggu' | 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[] = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
    ];
    const todayIndex = new Date().getDay();
    return days[todayIndex];
  }, []);

  // Today's Schedules for this student's class
  const todaySchedules = useMemo(() => {
    const classSchedules = (schedules || []).filter((s) => s && s.kelas === currentStudent.kelas);
    // If today is weekend or no class today, fallback to show Monday's schedule or all class schedules
    const dayFiltered = classSchedules.filter((s) => s.hari === todayDayName);
    return dayFiltered.length > 0 ? dayFiltered : classSchedules.slice(0, 3);
  }, [schedules, currentStudent?.kelas, todayDayName]);

  // Aggregate ALL notes given by teacher (User Request 6 & 7):
  // 1. Tagged notes from Teaching Journal (KBM)
  // 2. Attendance notes (Presensi)
  // 3. Evaluation notes from Grades (Nilai)
  const unifiedNotes: StudentUnifiedNote[] = useMemo(() => {
    const list: StudentUnifiedNote[] = [];

    // From Teaching Journals
    (journals || []).forEach((j) => {
      if (j.catatanSiswaKhusus) {
        const foundTag = j.catatanSiswaKhusus.find((t) => t.nisn === currentStudent.nisn);
        if (foundTag) {
          list.push({
            id: `note-jurnal-${j.id}`,
            sumber: 'Jurnal KBM',
            tanggal: j.tanggal,
            materiAtauKonteks: `KBM Matematika: ${j.materi}`,
            catatan: foundTag.catatan,
            guru: 'Bayu Gunarto, M.Pd',
          });
        }
      }
    });

    // From Attendance
    studentAttendance.forEach((a) => {
      if (a.keterangan && a.keterangan.trim()) {
        list.push({
          id: `note-att-${a.id}`,
          sumber: 'Presensi',
          tanggal: a.tanggal,
          materiAtauKonteks: `Status Presensi: ${a.status}`,
          catatan: a.keterangan,
          guru: 'Bayu Gunarto, M.Pd',
        });
      }
    });

    // From Grades
    studentGrades.forEach((g) => {
      if (g.catatan && g.catatan.trim()) {
        list.push({
          id: `note-grade-${g.id}`,
          sumber: 'Penilaian',
          tanggal: g.tanggal,
          materiAtauKonteks: `${g.jenisPenilaian} - ${g.materi}`,
          catatan: g.catatan,
          guru: 'Bayu Gunarto, M.Pd',
        });
      }
    });

    // Sort descending by date
    return list.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [journals, studentAttendance, studentGrades, currentStudent.nisn]);

  // Handle change password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = currentStudent.password || '12345';

    if (oldPassword !== currentPass) {
      alert('Password saat ini salah! Jika Anda belum pernah mengganti password, gunakan "12345".');
      return;
    }

    if (newPassword.length < 5) {
      alert('Password baru minimal 5 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Konfirmasi password baru tidak cocok!');
      return;
    }

    // Update student's password
    setStudents((prev) =>
      prev.map((s) => (s.nisn === currentStudent.nisn ? { ...s, password: newPassword } : s))
    );

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password Anda berhasil diperbarui!');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 sm:px-6 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                  Portal Siswa SMA
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  Siswa Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Mata Pelajaran Matematika - Guru: Bayu Gunarto, M.Pd
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                {currentStudent.nama_lengkap.charAt(0)}
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-800 block truncate max-w-[120px]">
                  {currentStudent.nama_lengkap.split(' ')[0]}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {currentStudent.kelas}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors border border-slate-200"
              title="Keluar dari akun siswa"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Desktop Tab Bar */}
        <div className="hidden md:flex max-w-6xl mx-auto gap-2 mt-3 pt-2 border-t border-slate-100 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('kehadiran')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'kehadiran'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Kehadiran ({attendanceStats.percent}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('nilai')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'nilai'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Nilai Matematika ({gradeStats.avg})</span>
          </button>

          <button
            onClick={() => setActiveTab('catatan')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'catatan'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Catatan Guru</span>
            {unifiedNotes.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 font-bold text-[10px]">
                {unifiedNotes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'password'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Ganti Password</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 pb-24 md:pb-12 flex-1">
        {/* TAB 1: DASHBOARD SISWA */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Student Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/40 shadow-inner shrink-0">
                    {currentStudent.URL_foto ? (
                      <img
                        src={currentStudent.URL_foto}
                        alt={currentStudent.nama_lengkap}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                        {currentStudent.nama_lengkap.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-blue-200 tracking-wider">
                      Selamat Datang, Siswa Hebat!
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {currentStudent.nama_lengkap}
                    </h2>
                    <p className="text-xs text-blue-100 mt-1 font-mono">
                      NISN: {currentStudent.nisn} | Kelas: {currentStudent.kelas}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 self-stretch sm:self-auto justify-between">
                  <span className="text-[11px] text-blue-200 font-medium">
                    Guru Mata Pelajaran
                  </span>
                  <span className="text-xs font-bold text-white">
                    Bayu Gunarto, M.Pd
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Metric Cards required by prompt: Persentase Kehadiran, Rata-Rata Nilai, Jadwal Hari Ini */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Persentase Kehadiran */}
              <div
                onClick={() => setActiveTab('kehadiran')}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {attendanceStats.hadir} dari {attendanceStats.total} Pertemuan
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium block">
                  Persentase Kehadiran
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    {attendanceStats.percent}%
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold">
                    {attendanceStats.percent >= 85 ? 'Sangat Rajin' : 'Cukup'}
                  </span>
                </div>
                <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${attendanceStats.percent}%` }}
                  />
                </div>
                <div className="mt-3 text-[11px] text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                  <span>Lihat Riwayat Kehadiran</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>

              {/* Card 2: Rata-Rata Nilai */}
              <div
                onClick={() => setActiveTab('nilai')}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    {gradeStats.totalCount} Asesmen
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium block">
                  Rata-Rata Nilai Matematika
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    {gradeStats.avg}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {gradeStats.avg >= 90 ? 'Predikat A' : gradeStats.avg >= 75 ? 'Predikat B (Tuntas)' : 'Perlu Bimbingan'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Tertinggi: {gradeStats.highest} | Terendah: {gradeStats.lowest}
                </p>
                <div className="mt-3 text-[11px] text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                  <span>Lihat Rekap Nilai Lengkap</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>

              {/* Card 3: Jadwal Mata Pelajaran Hari Ini */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                      Hari {todayDayName}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium block">
                    Jadwal Belajar Kelas {currentStudent.kelas}
                  </span>

                  <div className="mt-3 space-y-2">
                    {todaySchedules.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        Tidak ada sesi belajar terjadwal hari ini.
                      </p>
                    ) : (
                      todaySchedules.map((sch) => (
                        <div
                          key={sch.id}
                          className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>{sch.mataPelajaran}</span>
                            <span className="text-[10px] font-mono text-blue-700">
                              {sch.jamMulai} - {sch.jamSelesai}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>Ruang {sch.ruang}</span>
                          </div>
                          {sch.topik && (
                            <div className="text-[10px] text-indigo-700 font-medium">
                              Topik: {sch.topik}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Preview: Catatan Guru Terbaru */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>Catatan & Umpan Balik Guru Terbaru Untuk Anda</span>
                </h3>
                <button
                  onClick={() => setActiveTab('catatan')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Lihat Semua ({unifiedNotes.length})
                </button>
              </div>

              {unifiedNotes.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  Belum ada catatan khusus dari guru. Tetap semangat belajarnya!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unifiedNotes.slice(0, 2).map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold">
                          {note.sumber}
                        </span>
                        <span className="text-slate-500 font-mono">{note.tanggal}</span>
                      </div>
                      <p className="font-semibold text-slate-800 text-xs">
                        {note.materiAtauKonteks}
                      </p>
                      <p className="text-slate-700 italic text-[11px] leading-relaxed">
                        "{note.catatan}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: KEHADIRAN SISWA (Harian, Bulanan, Semester) */}
        {activeTab === 'kehadiran' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header & Sub-Tab Navigation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-600" />
                  <span>Riwayat & Rekapitulasi Kehadiran Siswa</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekam jejak kehadiran harian, rekap bulanan, dan total kehadiran semester
                </p>
              </div>

              {/* Sub-Tabs: Harian, Bulanan, Semester */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold self-start sm:self-auto">
                <button
                  onClick={() => setKehadiranSubTab('harian')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    kehadiranSubTab === 'harian'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Harian
                </button>
                <button
                  onClick={() => setKehadiranSubTab('bulanan')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    kehadiranSubTab === 'bulanan'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setKehadiranSubTab('semester')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    kehadiranSubTab === 'semester'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semester
                </button>
              </div>
            </div>

            {/* Summary Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block">Hadir</span>
                <span className="text-2xl font-extrabold text-emerald-600">
                  {attendanceStats.hadir}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">pertemuan</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block">Sakit</span>
                <span className="text-2xl font-extrabold text-blue-600">
                  {attendanceStats.sakit}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">hari izin sakit</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block">Izin</span>
                <span className="text-2xl font-extrabold text-amber-600">
                  {attendanceStats.izin}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">kegiatan / keperluan</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block">Alpa</span>
                <span className="text-2xl font-extrabold text-rose-600">
                  {attendanceStats.alpa}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">tanpa keterangan</span>
              </div>
            </div>

            {/* SUB-VIEW 1: HARIAN */}
            {kehadiranSubTab === 'harian' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs">
                    Log Presensi Harian Tatap Muka
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Total {studentAttendance.length} Catatan
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                        <th className="py-2.5 px-4">No</th>
                        <th className="py-2.5 px-4">Tanggal</th>
                        <th className="py-2.5 px-4">Status Kehadiran</th>
                        <th className="py-2.5 px-4">Keterangan / Catatan Guru</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentAttendance.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            Belum ada rekaman kehadiran
                          </td>
                        </tr>
                      ) : (
                        studentAttendance.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                            <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">
                              {item.tanggal}
                            </td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  item.status === 'Hadir'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.status === 'Sakit'
                                    ? 'bg-blue-100 text-blue-800'
                                    : item.status === 'Izin'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600">
                              {item.keterangan || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: BULANAN */}
            {kehadiranSubTab === 'bulanan' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">
                  Rekapitulasi Kehadiran Bulanan (Tahun Ajaran 2026/2027)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">
                        Bulan September 2026
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {attendanceStats.percent}% Kehadiran
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Jumlah Hari Efektif: {attendanceStats.total} hari
                    </p>
                    <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-200">
                      <div>Hadir: {attendanceStats.hadir} hari</div>
                      <div>Sakit: {attendanceStats.sakit} hari</div>
                      <div>Izin: {attendanceStats.izin} hari</div>
                      <div>Alpa: {attendanceStats.alpa} hari</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">
                        Bulan Agustus 2026
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        100% Kehadiran
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Jumlah Hari Efektif: 12 hari
                    </p>
                    <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-200">
                      <div>Hadir: 12 hari</div>
                      <div>Sakit: 0 hari</div>
                      <div>Izin: 0 hari</div>
                      <div>Alpa: 0 hari</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: SEMESTER */}
            {kehadiranSubTab === 'semester' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">
                      Rekap Kehadiran Semester Ganjil (2026/2027)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Syarat minimal persentase kehadiran untuk mengikuti asesmen sumatif akhir semester (SAS) adalah 85%
                    </p>
                  </div>
                  <span className="text-xl font-extrabold text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-xl border border-emerald-200 font-mono">
                    {attendanceStats.percent}%
                  </span>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Status Kehadiran Memenuhi Syarat</span>
                    <span>
                      Kehadiran Anda ({attendanceStats.percent}%) memenuhi batas ketentuan akademik untuk mengikuti Ujian Akhir Semester.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NILAI SISWA */}
        {activeTab === 'nilai' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span>Rekapan Nilai & Ketercapaian TP Matematika</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rincian nilai tugas harian, sumatif lingkup materi, STS, SAS, serta ketercapaian Tujuan Pembelajaran (TP)
                </p>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-blue-200 self-start sm:self-auto">
                <span>Rata-Rata: {gradeStats.avg}</span>
              </div>
            </div>

            {/* Table of Grades */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Jenis Penilaian</th>
                      <th className="py-3 px-4">Kolom Materi</th>
                      <th className="py-3 px-4">Tujuan Pembelajaran (TP)</th>
                      <th className="py-3 px-4 text-center">Nilai</th>
                      <th className="py-3 px-4">Ketercapaian</th>
                      <th className="py-3 px-4">Catatan Evaluasi Guru</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentGrades.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Belum ada nilai yang diinput oleh guru
                        </td>
                      </tr>
                    ) : (
                      studentGrades.map((g) => (
                        <tr key={g.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                            {g.tanggal}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800">
                              {g.jenisPenilaian}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800 min-w-[140px]">
                            {g.materi}
                          </td>
                          <td className="py-3 px-4 text-slate-600 min-w-[200px] leading-snug">
                            {g.tujuanPembelajaran}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-base text-blue-700">
                            {g.nilai}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                g.ketercapaian === 'Sangat Baik'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : g.ketercapaian === 'Tercapai'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {g.ketercapaian || 'Tercapai'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 italic min-w-[160px]">
                            {g.catatan || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CATATAN SISWA (Dari Guru saat Kehadiran & Proses Belajar Mengajar) */}
        {activeTab === 'catatan' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <span>Catatan Perkembangan Siswa dari Guru Matematika</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kumpulan umpan balik, apresiasi, catatan kehadiran, dan bimbingan yang diberikan oleh Bayu Gunarto, M.Pd selama proses kegiatan belajar mengajar (KBM)
              </p>
            </div>

            <div className="space-y-3">
              {unifiedNotes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-700 text-sm">Belum Ada Catatan Khusus</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Catatan yang diberikan oleh guru saat presensi harian atau dari jurnal mengajar akan muncul di sini.
                  </p>
                </div>
              ) : (
                unifiedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            note.sumber === 'Jurnal KBM'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : note.sumber === 'Presensi'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Sumber: {note.sumber}
                        </span>
                        <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{note.tanggal}</span>
                        </span>
                      </div>

                      <span className="text-xs text-slate-600 font-semibold">
                        Guru: {note.guru}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Konteks / Topik:
                      </span>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">
                        {note.materiAtauKonteks}
                      </p>
                    </div>

                    <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80">
                      <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                        Pesan / Catatan Guru:
                      </span>
                      <p className="text-slate-800 text-xs italic leading-relaxed font-medium">
                        "{note.catatan}"
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: GANTI PASSWORD */}
        {activeTab === 'password' && (
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                  Ganti Password Akun Siswa
                </h3>
                <p className="text-xs text-slate-500">
                  Password default awal adalah <strong>12345</strong>. Ganti dengan password yang mudah Anda ingat.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Password Saat Ini (Lama / Default) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password saat ini (cth: 12345)"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Password Baru *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 5 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Konfirmasi Password Baru *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Ketik ulang password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors text-sm"
                  >
                    Simpan Password Baru
                  </button>
                </div>
              </form>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                <strong>Catatan:</strong> Jika Anda lupa password di kemudian hari, Anda dapat menghubungi guru matematika (Pak Bayu Gunarto, M.Pd) untuk mereset password Anda kembali ke <strong>12345</strong>.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Optimasi Tampilan HP - Permintaan 5 & 6) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 z-50 shadow-lg flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('kehadiran')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'kehadiran' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Kehadiran</span>
        </button>

        <button
          onClick={() => setActiveTab('nilai')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'nilai' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Nilai</span>
        </button>

        <button
          onClick={() => setActiveTab('catatan')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg transition-colors relative ${
            activeTab === 'catatan' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Catatan</span>
          {unifiedNotes.length > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('password')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'password' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Password</span>
        </button>
      </nav>
    </div>
  );
};
