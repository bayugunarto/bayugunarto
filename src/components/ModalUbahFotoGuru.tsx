import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link,
  Camera,
  Trash2,
  Check,
  User,
  Sparkles,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { TeacherProfile } from '../types';

interface ModalUbahFotoGuruProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfile;
  onSave: (updatedProfile: TeacherProfile) => void;
}

// Sample professional teacher avatars for quick selection
const SAMPLE_AVATARS = [
  {
    label: 'Formal Pria 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Formal Pria 2 (Kacamata)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Formal Jas Pria',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Pendidik Kasual',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  },
];

export const ModalUbahFotoGuru: React.FC<ModalUbahFotoGuruProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [nama, setNama] = useState(profile.nama || 'Bayu Gunarto, M.Pd');
  const [nip, setNip] = useState(profile.nip || '19821215');
  const [mataPelajaran, setMataPelajaran] = useState(
    profile.mataPelajaran || 'Guru Matematika SMA • Kurikulum Merdeka'
  );
  const [fotoUrl, setFotoUrl] = useState(profile.fotoUrl || '');
  const [inputUrl, setInputUrl] = useState(profile.fotoUrl || '');
  const [activeInputMethod, setActiveInputMethod] = useState<'upload' | 'url' | 'sample'>('upload');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local file upload (works on Mobile Gallery, Camera, or Desktop Files)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto maksimal 5 MB. Silakan gunakan foto yang lebih kecil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFotoUrl(result);
        setInputUrl('');
        setSuccessMsg('Foto berhasil diunggah! Klik "Simpan Foto" di bawah.');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Gagal membaca file gambar. Silakan coba file lain.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    setErrorMsg(null);
    if (!inputUrl.trim()) {
      setErrorMsg('Silakan masukkan link/URL gambar yang valid.');
      return;
    }
    setFotoUrl(inputUrl.trim());
    setSuccessMsg('URL foto berhasil diterapkan ke pratinjau!');
  };

  const handleSelectSample = (url: string) => {
    setFotoUrl(url);
    setInputUrl(url);
    setSuccessMsg('Foto sampel dipilih!');
  };

  const handleRemovePhoto = () => {
    setFotoUrl('');
    setInputUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSuccessMsg('Foto dihapus. Avatar default akan ditampilkan.');
  };

  const handleSave = () => {
    onSave({
      nama: nama.trim() || 'Bayu Gunarto, M.Pd',
      nip: nip.trim() || '19821215',
      mataPelajaran: mataPelajaran.trim() || 'Guru Matematika SMA • Kurikulum Merdeka',
      fotoUrl: fotoUrl.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">
                Ubah Foto Profil Guru
              </h3>
              <p className="text-xs text-slate-500">
                Pojok Kiri Atas: {profile.nama || 'Bayu Gunarto, M.Pd'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Live Preview Box */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-2xl border border-blue-100">
            <div className="relative shrink-0">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt={nama}
                  className="w-20 h-20 rounded-full object-cover shadow-md ring-4 ring-white border border-blue-200"
                  onError={() => {
                    setErrorMsg('Foto tidak dapat dimuat dari link tersebut. Pastikan link dapat diakses secara publik.');
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md ring-4 ring-white">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full inline-block mb-1">
                Pratinjau Tampilan
              </span>
              <h4 className="font-bold text-slate-900 text-base truncate">
                {nama || 'Bayu Gunarto, M.Pd'}
              </h4>
              <p className="text-xs text-slate-600 font-mono">NIP: {nip || '19821215'}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {fotoUrl ? '✓ Foto telah dipilih' : '• Menggunakan Avatar Ikon Default'}
              </p>
            </div>

            {fotoUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                title="Hapus foto saat ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Foto</span>
              </button>
            )}
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Methods Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Pilih Cara Memasukkan Foto:
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveInputMethod('upload')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                  activeInputMethod === 'upload'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah File / Galeri</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveInputMethod('url')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                  activeInputMethod === 'url'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>Link / URL Foto</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveInputMethod('sample')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                  activeInputMethod === 'sample'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pilihan Contoh</span>
              </button>
            </div>
          </div>

          {/* Method 1: File Upload (Mobile & Desktop) */}
          {activeInputMethod === 'upload' && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    Klik untuk Ambil Foto dari HP atau Pilih Berkas
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mendukung JPG, PNG, WEBP (maksimal 5 MB)
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Pilih Foto Sekarang
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Foto yang diunggah akan otomatis disimpan secara langsung di memori browser HP/laptop Anda tanpa perlu diunggah ke server lain.
              </p>
            </div>
          )}

          {/* Method 2: Image URL */}
          {activeInputMethod === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Alamat Web / URL Foto (Google Drive, Cloud, dsb.)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://example.com/foto-bayu-gunarto.jpg"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs shrink-0 transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs space-y-1">
                <p className="font-semibold text-slate-800">Tips Menggunakan Link Google Drive:</p>
                <p className="text-[11px]">
                  Pastikan izin file di Google Drive diatur ke "Siapa saja yang memiliki link" (Public).
                </p>
              </div>
            </div>
          )}

          {/* Method 3: Sample Avatars */}
          {activeInputMethod === 'sample' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Pilih salah satu contoh foto guru profesional berikut jika ingin langsung mencoba:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SAMPLE_AVATARS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample.url)}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all group ${
                      fotoUrl === sample.url
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={sample.url}
                      alt={sample.label}
                      className="w-14 h-14 rounded-full object-cover shadow-xs group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-medium text-slate-700 mt-2 truncate w-full">
                      {sample.label}
                    </span>
                    {fotoUrl === sample.url && (
                      <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 mt-0.5">
                        <Check className="w-3 h-3" /> Dipilih
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name & NIP Customization */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Informasi Nama & NIP Guru
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="Bayu Gunarto, M.Pd"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nomor Induk Pegawai (NIP)
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="19821215"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
