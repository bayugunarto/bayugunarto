import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Upload,
  Download,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Globe
} from 'lucide-react';
import {
  getStoredAppsScriptUrl,
  saveStoredAppsScriptUrl,
  getStoredLastSheetsSync,
  pushDataToGoogleSheets,
  pullDataFromGoogleSheets,
  GOOGLE_APPS_SCRIPT_CODE,
  AcademicSyncPayload,
} from '../services/appsScriptService';
import {
  Student,
  GradeItem,
  AttendanceItem,
  TeachingJournalItem,
  ClassItem,
  ScheduleItem,
  TeacherProfile,
} from '../types';

interface AppsScriptSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherProfile: TeacherProfile;
  students: Student[];
  grades: GradeItem[];
  attendance: AttendanceItem[];
  classes: ClassItem[];
  schedules: ScheduleItem[];
  journals: TeachingJournalItem[];
  onRestoreData: (payload: AcademicSyncPayload) => void;
}

export const AppsScriptSyncModal: React.FC<AppsScriptSyncModalProps> = ({
  isOpen,
  onClose,
  teacherProfile,
  students,
  grades,
  attendance,
  classes,
  schedules,
  journals,
  onRestoreData,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'tutorial'>('sync');
  const [appScriptUrl, setAppScriptUrl] = useState<string>(getStoredAppsScriptUrl());
  const [lastSync, setLastSync] = useState<string | null>(getStoredLastSheetsSync());
  const [isCopying, setIsCopying] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  const handleSaveUrl = () => {
    const cleanUrl = appScriptUrl.trim();
    if (!cleanUrl) {
      alert('Masukkan URL Web App Google Apps Script Anda.');
      return;
    }
    if (!cleanUrl.startsWith('https://script.google.com')) {
      alert('Format URL harus diawali dengan https://script.google.com/.../exec');
      return;
    }
    saveStoredAppsScriptUrl(cleanUrl);
    showNotification('success', 'URL Web App Google Spreadsheet berhasil disimpan!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2500);
    showNotification('success', 'Kode Google Apps Script berhasil disalin ke clipboard!');
  };

  // Kirim data ke Google Spreadsheet
  const handlePushData = async () => {
    const cleanUrl = appScriptUrl.trim();
    if (!cleanUrl) {
      showNotification('error', 'Silakan tempel URL Web App Google Apps Script terlebih dahulu.');
      setActiveTab('tutorial');
      return;
    }

    saveStoredAppsScriptUrl(cleanUrl);
    setIsPushing(true);

    try {
      const payload: AcademicSyncPayload = {
        teacherProfile,
        students,
        grades,
        attendance,
        classes,
        schedules,
        journals,
        lastSync: new Date().toISOString(),
      };

      await pushDataToGoogleSheets(cleanUrl, payload);
      setLastSync(new Date().toISOString());
      showNotification(
        'success',
        'Data berhasil dikirim ke Google Spreadsheet Anda! Periksa sheet di Google Drive Anda.'
      );
    } catch (err: any) {
      console.error(err);
      showNotification('error', err.message || 'Gagal menyimpan data ke Google Spreadsheet.');
    } finally {
      setIsPushing(false);
    }
  };

  // Muat data dari Google Spreadsheet
  const handlePullData = async () => {
    const cleanUrl = appScriptUrl.trim();
    if (!cleanUrl) {
      showNotification('error', 'Silakan tempel URL Web App Google Apps Script terlebih dahulu.');
      return;
    }

    if (
      !confirm(
        'Apakah Anda yakin ingin memuat data dari Google Spreadsheet? Data di layar akan diperbarui sesuai data di Google Spreadsheet Anda.'
      )
    ) {
      return;
    }

    setIsPulling(true);
    try {
      const data = await pullDataFromGoogleSheets(cleanUrl);
      if (data) {
        onRestoreData(data);
        setLastSync(new Date().toISOString());
        showNotification('success', 'Data berhasil disinkronkan dari Google Spreadsheet Anda!');
      }
    } catch (err: any) {
      console.error(err);
      showNotification(
        'error',
        err.message || 'Gagal mengambil data dari Google Spreadsheet. Pastikan Web App disetel ke "Siapa saja / Anyone".'
      );
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">
                  Sinkronisasi Database Google Spreadsheet
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  100% Gratis & Otomatis
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Hubungkan langsung ke akun Google Drive Anda tanpa ribet Google Cloud Console atau error otorisasi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-2.5 transition-colors relative ${
              activeTab === 'sync'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Koneksi & Sinkronisasi
          </button>
          <button
            onClick={() => setActiveTab('tutorial')}
            className={`pb-2.5 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'tutorial'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Panduan & Salin Kode Apps Script</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 text-xs text-slate-700">
          {activeTab === 'sync' ? (
            <div className="space-y-4">
              {/* Input URL */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <label className="font-bold text-slate-800 block">
                  URL Web App Google Apps Script Anda:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={appScriptUrl}
                    onChange={(e) => setAppScriptUrl(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSaveUrl}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors shrink-0"
                  >
                    Simpan URL
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Belum punya URL? Buka tab <b>"Panduan & Salin Kode Apps Script"</b> untuk panduan 3 menit.
                </p>
              </div>

              {/* Status & Last Sync */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-800 font-semibold block">
                      Status Koneksi:
                    </span>
                    <span className="font-bold text-slate-800">
                      {appScriptUrl ? 'URL Terhubung' : 'Belum Terhubung'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">
                      Terakhir Disimpan:
                    </span>
                    <span className="font-bold text-slate-800">
                      {lastSync ? new Date(lastSync).toLocaleString('id-ID') : 'Belum pernah'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi Simpan & Muat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePushData}
                  disabled={isPushing}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
                  <span>
                    {isPushing ? 'Menyimpan ke Spreadsheet...' : 'Simpan / Kirim Data ke Spreadsheet'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePullData}
                  disabled={isPulling}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
                >
                  <Download className={`w-4 h-4 ${isPulling ? 'animate-bounce' : ''}`} />
                  <span>
                    {isPulling ? 'Mengambil Data...' : 'Muat Data dari Spreadsheet'}
                  </span>
                </button>
              </div>

              {/* Ringkasan Data yang Disimpan */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-[11px] space-y-1">
                <span className="font-bold text-slate-700 block">
                  Data yang otomatis tersinkronisasi:
                </span>
                <p className="text-slate-600">
                  • <b>DataSiswa:</b> {students.length} siswa (NISN, Nama, Profil, Password)
                </p>
                <p className="text-slate-600">
                  • <b>NilaiSiswa:</b> {grades.length} rekaman nilai (Tugas, TP, Ulangan, KKTP)
                </p>
                <p className="text-slate-600">
                  • <b>PresensiSiswa:</b> {attendance.length} catatan kehadiran siswa
                </p>
                <p className="text-slate-600">
                  • <b>JurnalMengajar & Jadwal:</b> {journals.length} jurnal mengajar guru
                </p>
                <p className="text-slate-600">
                  • <b>ProfilGuru:</b> {teacherProfile.nama} ({teacherProfile.mata_pelajaran})
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Panduan Langkah */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-800 text-sm">
                  Langkah Mudah 3 Menit Menghubungkan Google Spreadsheet:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <li>
                    Buka <b>Google Drive</b> Anda (<span className="text-blue-600">bayugunarto@gmail.com</span>).
                  </li>
                  <li>
                    Buat <b>Google Spreadsheet Baru</b>, beri nama misalnya: <b>"Database Akademik Matematika SMA"</b>.
                  </li>
                  <li>
                    Di menu atas Spreadsheet, klik menu <b>Ekstensi</b> &rarr; pilih <b>Apps Script</b>.
                  </li>
                  <li>
                    Hapus semua tulisan yang ada di layar Apps Script, lalu klik tombol biru di bawah ini untuk <b>Salin Kode</b>, lalu <b>Tempelkan (Paste)</b> ke sana.
                  </li>
                  <li>
                    Klik tombol <b>Simpan</b> (ikon disket kecil di atas).
                  </li>
                  <li>
                    Di pojok kanan atas, klik tombol biru <b>Terapkan (Deploy)</b> &rarr; <b>Penerapan baru (New deployment)</b>.
                  </li>
                  <li>
                    Pilih jenis: <b>Aplikasi Web (Web app)</b>. Pada opsi <i>"Siapa yang memiliki akses (Who has access)"</i>, pilih <b>"Siapa saja (Anyone)"</b>.
                  </li>
                  <li>
                    Klik <b>Terapkan</b> (Izinkan akses akun Anda jika Google memintanya).
                  </li>
                  <li>
                    Salin <b>URL Aplikasi Web</b> yang berakhiran <code className="bg-slate-200 px-1 rounded">/exec</code>, lalu tempelkan ke tab <b>"Koneksi & Sinkronisasi"</b> di aplikasi ini!
                  </li>
                </ol>
              </div>

              {/* Tombol Salin Kode */}
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                <div>
                  <span className="font-bold text-emerald-900 block">
                    Kode Google Apps Script Siap Pakai
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Otomatis membuat sheet DataSiswa, Nilai, Presensi, dan Profil.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  {isCopying ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Seluruh Kode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Kotak Kode */}
              <div className="relative">
                <pre className="bg-slate-900 text-emerald-300 font-mono text-[11px] p-3.5 rounded-2xl overflow-x-auto max-h-56 leading-normal border border-slate-800">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-[11px] text-slate-500">
            Terhubung langsung ke akun <b>bayugunarto@gmail.com</b>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
