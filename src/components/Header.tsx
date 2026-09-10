import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, ShieldCheck, Sparkles, Menu, GraduationCap, Cloud } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileSidebar?: () => void;
  onSwitchToStudentPortal?: () => void;
  onOpenDriveSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onSwitchToStudentPortal,
  onOpenDriveSync,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format 07.28.16 like in the screenshot
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}.${minutes}.${seconds}`);

      // Indonesian date formatting
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      setCurrentDate(now.toLocaleDateString('id-ID', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Akademik Guru';
      case 'kelas':
        return 'Data & Rombongan Belajar SMA';
      case 'siswa':
        return 'Buku Induk Data Siswa (Spreadsheet)';
      case 'profil':
        return 'Profil Lengkap Siswa SMA';
      case 'jadwal':
        return 'Jadwal Mengajar Tatap Muka';
      case 'jurnal':
        return 'Jurnal Mengajar & Refleksi Guru';
      case 'presensi':
        return 'Presensi & Rekapitulasi Kehadiran Siswa';
      case 'nilai':
        return 'Manajemen Nilai Siswa';
      default:
        return 'Sistem Akademik';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'nilai':
        return 'Input & Rekapitulasi Nilai Matematika dengan Kolom Materi dan Tujuan Pembelajaran (Kurikulum Merdeka)';
      case 'siswa':
        return 'Daftar 25 Siswa Kelas XI-1 lengkap dengan NISN, profil, dan kontak';
      case 'profil':
        return 'Informasi lengkap biodata siswa, foto sheet, kontak orang tua, domisili, dan preferensi belajar matematika';
      case 'jurnal':
        return 'Catatan kegiatan belajar mengajar, refleksi ketercapaian materi, dan tag catatan khusus ke siswa';
      case 'presensi':
        return 'Pencatatan kehadiran harian siswa berbasis spreadsheet harian & bulanan';
      default:
        return 'Kurikulum Merdeka SMA - Mata Pelajaran Matematika (Fase E & F)';
    }
  };

  return (
    <header
      id="app-top-header"
      className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs"
    >
      <div className="flex items-start gap-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0 mt-0.5"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-blue-600 font-semibold uppercase tracking-wider mb-0.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Sistem Akademik Matematika SMA</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">Fase F / Kelas XI</span>
          </div>
          <h1
            id="page-title-heading"
            className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight"
          >
            {getTitle()}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 max-w-2xl line-clamp-1 sm:line-clamp-none">
            {getSubtitle()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto">
        {onOpenDriveSync && (
          <button
            type="button"
            onClick={onOpenDriveSync}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            title="Pencadangan & Sinkronisasi Google Drive"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Google Drive</span>
          </button>
        )}

        {onSwitchToStudentPortal && (
          <button
            onClick={onSwitchToStudentPortal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors shadow-2xs cursor-pointer"
            title="Beralih ke Portal Siswa untuk melihat tampilan siswa"
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Lihat Portal Siswa</span>
            <span className="sm:hidden">Siswa</span>
          </button>
        )}

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Spreadsheet Sync Aktif</span>
        </div>

        {/* Digital Clock Display matching screenshot */}
        <div
          id="header-digital-clock"
          className="flex items-center gap-2 bg-slate-50 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl border border-slate-200 text-slate-700"
        >
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 animate-pulse" />
          <div className="flex flex-col text-right">
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-800 tracking-wider">
              {currentTime || '07.28.16'}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 leading-none hidden sm:inline">
              {currentDate || 'Kamis, 10 September 2026'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

