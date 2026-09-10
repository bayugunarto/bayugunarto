import React, { useState } from 'react';
import { Student, CurrentUser } from '../types';
import {
  School,
  Lock,
  User,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface LoginModalProps {
  students: Student[];
  onLogin: (user: CurrentUser) => void;
  onCancel?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  students,
  onLogin,
  onCancel,
}) => {
  const [role, setRole] = useState<'guru' | 'siswa'>('siswa');
  const [nisn, setNisn] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanNisn = nisn.trim();
    const student = students.find((s) => s.nisn === cleanNisn);

    if (!student) {
      setErrorMessage(`NISN "${cleanNisn}" tidak ditemukan dalam data siswa.`);
      return;
    }

    const expectedPassword = student.password || '12345';
    if (password !== expectedPassword) {
      setErrorMessage(
        'Password salah! Jika belum pernah diganti, gunakan password default "12345" atau hubungi Guru Matematika untuk reset password.'
      );
      return;
    }

    // Success login as student
    onLogin({
      role: 'siswa',
      nisn: student.nisn,
      nama: student.nama_lengkap,
      kelas: student.kelas,
    });
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      role: 'guru',
      nama: 'Bayu Gunarto, M.Pd',
      nip: '19850315 200902 1 003',
    });
  };

  const handleQuickStudentLogin = (st: Student) => {
    onLogin({
      role: 'siswa',
      nisn: st.nisn,
      nama: st.nama_lengkap,
      kelas: st.kelas,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <School className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Sistem Informasi Akademik Matematika
          </h2>
          <p className="text-xs text-slate-500">
            Pilih jenis akun untuk masuk ke portal pembelajaran
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setRole('siswa');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              role === 'siswa'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Portal Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('guru');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              role === 'guru'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Guru Matematika</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* FORM LOGIN SISWA */}
        {role === 'siswa' ? (
          <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Nomor Induk Siswa Nasional (NISN) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: 0071234501"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 block">
                  Password Akun Siswa *
                </label>
                <span className="text-[10px] text-blue-600 font-mono">
                  Default: 12345
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <span>Masuk Sebagai Siswa</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Student Picker */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 block text-center">
                Atau Pilih Cepat Akun Demo Siswa (Password: 12345):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {students.slice(0, 4).map((st) => (
                  <button
                    key={st.nisn}
                    type="button"
                    onClick={() => handleQuickStudentLogin(st)}
                    className="p-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-left text-[11px] transition-all"
                  >
                    <span className="font-bold text-slate-800 block truncate">
                      {st.nama_lengkap.split(' ')[0]}
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      NISN: {st.nisn} ({st.kelas})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          /* FORM LOGIN GURU */
          <form onSubmit={handleTeacherSubmit} className="space-y-4 text-xs">
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  BG
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Bayu Gunarto, M.Pd
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Guru Pengampu Matematika SMA
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Akses penuh ke Manajemen Data Siswa, Rekap Presensi & Kehadiran, Manajemen Nilai & TP, Jadwal Mengajar, Profil Siswa, dan Jurnal Mengajar.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <span>Masuk Sebagai Guru Matematika</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 pt-1"
          >
            Tutup
          </button>
        )}
      </div>
    </div>
  );
};
