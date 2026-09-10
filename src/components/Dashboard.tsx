import React from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  Target,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  FileSpreadsheet,
  UserCheck
} from 'lucide-react';
import { Student, GradeItem, ScheduleItem, ClassItem } from '../types';
import { ActiveTab } from './Sidebar';

interface DashboardProps {
  students?: Student[];
  grades?: GradeItem[];
  schedules?: ScheduleItem[];
  classes?: ClassItem[];
  setActiveTab: (tab: ActiveTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students = [],
  grades = [],
  schedules = [],
  classes = [],
  setActiveTab,
}) => {
  // Key stats
  const totalStudents = (students || []).length;
  const xi1Grades = (grades || []).filter((g) => g.kelas === 'XI-1');
  const avgScore = xi1Grades.length
    ? Math.round((xi1Grades.reduce((a, b) => a + b.nilai, 0) / xi1Grades.length) * 10) / 10
    : 85.8;
  const tuntasCount = xi1Grades.filter((g) => g.nilai >= 75).length;
  const tuntasPercent = xi1Grades.length
    ? Math.round((tuntasCount / xi1Grades.length) * 100)
    : 92;

  // Active TP
  const activeMateri = 'Fungsi Komposisi dan Fungsi Invers';
  const activeTP = 'TP 11.2 Menentukan rumus aljabar fungsi komposisi (f o g)(x)';

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tahun Pelajaran 2026/2027 • Kurikulum Merdeka SMA</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Selamat Datang, Pak Bayu Gunarto, M.Pd
          </h2>
          <p className="text-blue-100 text-xs md:text-sm mt-2 leading-relaxed">
            Aplikasi spreadsheet akademik terintegrasi untuk pengelolaan 25 siswa kelas XI-1,
            presensi harian, dan manajemen penilaian matematika lengkap dengan kolom{' '}
            <strong className="text-white underline decoration-amber-300 underline-offset-2">
              Materi Pokok
            </strong>{' '}
            dan{' '}
            <strong className="text-white underline decoration-amber-300 underline-offset-2">
              Tujuan Pembelajaran (TP)
            </strong>
            .
          </p>

          <div className="flex items-center flex-wrap gap-3 mt-5">
            <button
              id="btn-dash-input-nilai"
              onClick={() => setActiveTab('nilai')}
              className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all"
            >
              <Award className="w-4 h-4 text-blue-600" />
              <span>Buka Manajemen Nilai (Materi & TP)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-dash-presensi"
              onClick={() => setActiveTab('presensi')}
              className="inline-flex items-center gap-2 bg-blue-600/60 hover:bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl text-xs backdrop-blur-md border border-white/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Isi Presensi Harian</span>
            </button>

            <button
              id="btn-dash-profil-siswa"
              onClick={() => setActiveTab('profil')}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-4 py-2.5 rounded-xl text-xs backdrop-blur-md border border-white/20 transition-all"
            >
              <UserCheck className="w-4 h-4 text-emerald-300" />
              <span>Profil Siswa</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div
          onClick={() => setActiveTab('siswa')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Siswa Terdata
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 font-mono">
              {totalStudents}
            </span>
            <span className="text-xs text-slate-500">Siswa (Kelas XI-1)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium">
            <span>Buka buku induk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Rata-rata Nilai */}
        <div
          onClick={() => setActiveTab('nilai')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Rata-rata Nilai Matematika
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono">
              {avgScore}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Diatas KKTP
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-medium">
            <span>{tuntasPercent}% Tuntas Kriteria</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Tingkat Kehadiran */}
        <div
          onClick={() => setActiveTab('presensi')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Kehadiran Siswa
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-700 font-mono">
              96%
            </span>
            <span className="text-xs text-slate-500">Bulan Berjalan</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-medium">
            <span>Presensi Harian</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Materi & TP Status */}
        <div
          onClick={() => setActiveTab('nilai')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Capaian TP Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 font-mono">
              TP 11.2
            </span>
            <span className="text-xs text-slate-500">Fungsi Komposisi</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-medium">
            <span>Lihat spreadsheet nilai</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main 2-column layout: Active Kurikulum Merdeka TP Card & Teaching Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Highlight on Kurikulum Merdeka TP Assessment */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Penilaian Terkini dengan Kolom Materi & TP
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kelas XI-1 • Matematika Tingkat Lanjut
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('nilai')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>Buka Tabel Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/70 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Materi: {activeMateri}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-medium pl-6">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>{activeTP}</span>
            </div>
          </div>

          {/* Quick preview of top 5 students from the 25 provided */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">NISN</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">Materi</th>
                  <th className="py-2.5 px-3 text-center">Nilai</th>
                  <th className="py-2.5 px-3 text-center">Capaian TP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.slice(0, 5).map((s) => {
                  const g = xi1Grades.find((item) => item.nisn === s.nisn);
                  const score = g ? g.nilai : 85;
                  return (
                    <tr key={s.nisn} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {s.nisn}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {s.nama_lengkap}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[150px]">
                        {activeMateri}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-800">
                        {score}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            score >= 90
                              ? 'bg-blue-100 text-blue-800'
                              : score >= 75
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {score >= 90 ? 'Sangat Baik' : 'Tercapai'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Today's agenda & classes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Jadwal Mengajar Terdekat
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('jadwal')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Semua
            </button>
          </div>

          <div className="space-y-3">
            {schedules.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-700 font-mono">
                    {item.hari} • {item.kelas}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {item.jamMulai} - {item.jamSelesai}
                  </span>
                </div>
                <p className="font-medium text-slate-800">{item.mataPelajaran}</p>
                <p className="text-[11px] text-slate-500">Ruang {item.ruang}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <span className="font-bold text-slate-700 block">Profil Guru</span>
            <div className="text-slate-600 leading-relaxed">
              <p>
                <strong>Bayu Gunarto, M.Pd</strong>
              </p>
              <p className="font-mono text-slate-500 text-[11px]">
                NIP. 19821215 200501 1 003
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                MGMP Matematika SMA • Pembina OSN Matematika
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
