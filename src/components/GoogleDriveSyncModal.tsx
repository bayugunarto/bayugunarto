import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  FolderSync,
  ExternalLink,
  Download,
  AlertCircle,
  Database,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Clock
} from 'lucide-react';
import {
  Student,
  GradeItem,
  AttendanceItem,
  TeachingJournalItem,
  ClassItem,
  ScheduleItem,
  TeacherProfile,
  DriveBackupFile,
} from '../types';
import {
  getStoredToken,
  saveToken,
  clearToken,
  getStoredUserInfo,
  getStoredFolderInfo,
  getStoredLastSync,
  requestGoogleDriveAccess,
  backupDatabaseToDrive,
  exportToGoogleSheets,
  listDriveBackups,
  downloadBackupFromDrive,
  DRIVE_FOLDER_NAME,
  GoogleDriveUser,
  AcademicBackupPayload,
} from '../services/googleDriveService';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherProfile: TeacherProfile;
  students: Student[];
  grades: GradeItem[];
  attendance: AttendanceItem[];
  classes: ClassItem[];
  schedules: ScheduleItem[];
  journals: TeachingJournalItem[];
  onRestoreData: (payload: AcademicBackupPayload) => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
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
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [userInfo, setUserInfo] = useState<GoogleDriveUser | null>(getStoredUserInfo());
  const [folderInfo, setFolderInfo] = useState(getStoredFolderInfo());
  const [lastSync, setLastSync] = useState<string | null>(getStoredLastSync());

  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);

  const [backups, setBackups] = useState<DriveBackupFile[]>([]);
  const [successMessage, setSuccessMessage] = useState<{ title: string; link?: string; linkText?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentToken = getStoredToken();
      setToken(currentToken);
      setUserInfo(getStoredUserInfo());
      setFolderInfo(getStoredFolderInfo());
      setLastSync(getStoredLastSync());
      setSuccessMessage(null);
      setErrorMessage(null);

      if (currentToken) {
        fetchBackupsList(currentToken);
      }
    }
  }, [isOpen]);

  const fetchBackupsList = async (activeToken: string) => {
    setIsLoadingBackups(true);
    try {
      const list = await listDriveBackups(activeToken);
      setBackups(list);
      setFolderInfo(getStoredFolderInfo());
    } catch (err: any) {
      console.warn('Gagal memuat daftar cadangan:', err);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  if (!isOpen) return null;

  // 1. Connect Account
  const handleConnectGoogle = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoadingAuth(true);

    try {
      const { token: newToken, user } = await requestGoogleDriveAccess();
      setToken(newToken);
      setUserInfo(user || { email: 'bayugunarto@gmail.com', name: 'Bayu Gunarto' });
      setSuccessMessage({
        title: 'Akun Google Drive berhasil dihubungkan!',
      });
      fetchBackupsList(newToken);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghubungkan Google Drive.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // 2. Disconnect Account
  const handleDisconnect = () => {
    clearToken();
    setToken(null);
    setUserInfo(null);
    setBackups([]);
    setSuccessMessage({
      title: 'Koneksi Google Drive telah diputuskan.',
    });
  };

  // 3. Backup Full Database
  const handleBackupNow = async () => {
    if (!token) return;
    setIsBackingUp(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: AcademicBackupPayload = {
        app: 'Sistem Akademik Guru Matematika SMA',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        teacherProfile,
        students,
        grades,
        attendance,
        classes,
        schedules,
        journals,
      };

      const res = await backupDatabaseToDrive(token, payload);
      setLastSync(getStoredLastSync());
      setFolderInfo(getStoredFolderInfo());

      setSuccessMessage({
        title: 'Cadangan data berhasil disimpan ke Google Drive!',
        link: res.webViewLink,
        linkText: 'Buka File Cadangan di Google Drive',
      });

      // Refresh backup list
      fetchBackupsList(token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mencadangkan data ke Google Drive.');
    } finally {
      setIsBackingUp(false);
    }
  };

  // 4. Export to Google Sheets
  const handleExportToSheets = async () => {
    if (!token) return;
    setIsExportingSheets(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await exportToGoogleSheets(token, {
        grades,
        attendance,
        students,
        journals,
      });

      setLastSync(getStoredLastSync());
      setFolderInfo(getStoredFolderInfo());

      setSuccessMessage({
        title: 'Data berhasil disinkronkan ke Google Sheets!',
        link: res.spreadsheetUrl,
        linkText: 'Buka Spreadsheet di Google Sheets',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengekspor data ke Google Sheets.');
    } finally {
      setIsExportingSheets(false);
    }
  };

  // 5. Restore from Drive Backup
  const handleRestore = async (fileId: string, fileName: string) => {
    if (!token) return;
    const confirm = window.confirm(
      `Apakah Anda yakin ingin memulihkan data dari cadangan "${fileName}"? Data yang saat ini tersimpan di browser akan digantikan dengan data cadangan tersebut.`
    );
    if (!confirm) return;

    setIsRestoringId(fileId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const data = await downloadBackupFromDrive(token, fileId);
      onRestoreData(data);
      setSuccessMessage({
        title: `Data berhasil dipulihkan dari cadangan (${fileName})!`,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memulihkan data dari cadangan.');
    } finally {
      setIsRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs border border-white/20">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-white flex items-center gap-2">
                Pencadangan & Sinkronisasi Google Drive
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Simpan data nilai, presensi, dan jurnal mengajar langsung di Google Drive Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Notification Messages */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Terjadi Kendala</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-emerald-800 text-sm">{successMessage.title}</p>
                {successMessage.link && (
                  <a
                    href={successMessage.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-blue-700 hover:text-blue-900 hover:underline mt-2 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-2xs"
                  >
                    <span>{successMessage.linkText || 'Buka di Google Drive'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Connection Status Box */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs shrink-0">
                {userInfo?.picture ? (
                  <img
                    src={userInfo.picture}
                    alt={userInfo.name || 'User'}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <Cloud className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">
                    {token ? 'Google Drive Terhubung' : 'Google Drive Belum Terhubung'}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      token
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {token ? 'Aktif' : 'Perlu Izin'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {token
                    ? `Akun: ${userInfo?.email || 'bayugunarto@gmail.com'}`
                    : 'Hubungkan akun Google Anda untuk mengaktifkan pencadangan otomatis.'}
                </p>
                {lastSync && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Sinkronisasi Terakhir: {lastSync}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              {token ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3.5 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                >
                  Putuskan Sambungan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  disabled={isLoadingAuth}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoadingAuth ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Cloud className="w-4 h-4" />
                  )}
                  <span>Hubungkan Akun Google Drive</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Cards (When Connected) */}
          {token ? (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Menu Aksi Penyimpanan Drive
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Action 1: Backup Database File */}
                <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50/70 transition-all flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-blue-700">
                      <FolderSync className="w-5 h-5" />
                      <h5 className="font-bold text-slate-900 text-sm">
                        Cadangkan Database Lengkap
                      </h5>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Menyimpan seluruh data (nilai, presensi, jurnal, siswa, dan profil guru) sebagai file cadangan di Google Drive Anda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBackupNow}
                    disabled={isBackingUp}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isBackingUp ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Database className="w-4 h-4" />
                    )}
                    <span>{isBackingUp ? 'Menyimpan...' : 'Cadangkan ke Google Drive'}</span>
                  </button>
                </div>

                {/* Action 2: Export to Google Sheets */}
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 transition-all flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <FileSpreadsheet className="w-5 h-5" />
                      <h5 className="font-bold text-slate-900 text-sm">
                        Sinkronkan ke Google Sheets
                      </h5>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Membuat spreadsheet Google Sheets resmi di Google Drive dengan 4 lembar kerja (Rekap Nilai, Presensi, Jurnal, dan Biodata).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportToSheets}
                    disabled={isExportingSheets}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isExportingSheets ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4" />
                    )}
                    <span>{isExportingSheets ? 'Memproses...' : 'Ekspor ke Google Sheets'}</span>
                  </button>
                </div>
              </div>

              {/* Dedicated Folder Link */}
              {folderInfo.folderLink && (
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700 truncate">
                    <FolderSync className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">
                      Folder Penyimpanan: <strong>{DRIVE_FOLDER_NAME}</strong>
                    </span>
                  </div>
                  <a
                    href={folderInfo.folderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 hover:underline shrink-0 ml-2"
                  >
                    <span>Buka Folder Drive</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* List of Backups / Restore Section */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-600" />
                    <span>Daftar Cadangan Tersimpan di Google Drive</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => token && fetchBackupsList(token)}
                    disabled={isLoadingBackups}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                    <span>Segarkan</span>
                  </button>
                </div>

                {isLoadingBackups ? (
                  <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Memuat daftar cadangan dari Google Drive...</span>
                  </div>
                ) : backups.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-500">
                    Belum ada riwayat cadangan di Google Drive. Klik tombol <strong>"Cadangkan ke Google Drive"</strong> di atas untuk membuat cadangan pertama Anda.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {backups.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 truncate">{b.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {new Date(b.createdTime).toLocaleString('id-ID')} • Ukuran: {b.size}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {b.webViewLink && (
                            <a
                              href={b.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Buka file di Google Drive"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRestore(b.id, b.name)}
                            disabled={isRestoringId === b.id}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Pulihkan data dari cadangan ini"
                          >
                            {isRestoringId === b.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span>Pulihkan</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h5 className="font-bold text-slate-800 text-sm">
                  Penyimpanan Cloud Aman & Otomatis
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dengan menghubungkan Google Drive, Anda dapat menyimpan cadangan lengkap dan menyinkronkan data langsung menjadi Google Sheets dengan satu sentuhan.
                </p>
              </div>
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={isLoadingAuth}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                {isLoadingAuth ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Cloud className="w-4 h-4" />
                )}
                <span>Mulai Hubungkan Google Drive Sekarang</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
