export interface Student {
  nisn: string;
  nama_lengkap: string;
  kelas: string;
  no_HP?: string;
  agama?: string;
  hoby?: string;
  rencana_tamat_SMA?: string;
  riwayat_penyakit?: string;
  nama_ayah?: string;
  pekerjaan_ayah?: string;
  no_HP_ayah?: string;
  nama_ibu?: string;
  pekerjaan_ibu?: string;
  no_HP_ibu?: string;
  alamat_rumah?: string;
  status_tempat_tinggal?: string;
  pembelajaran_nyaman?: string;
  harapan_guru_matematika?: string;
  URL_foto?: string;
  password?: string; // Default '12345'
}

export type JenisPenilaian =
  | 'Tugas Harian'
  | 'Ulangan Harian'
  | 'Sumatif Lingkup Materi'
  | 'Sumatif Tengah Semester (STS)'
  | 'Sumatif Akhir Semester (SAS)'
  | 'Proyek / Praktik Matematika';

export interface MathTopicTP {
  materi: string;
  tujuanPembelajaran: string[];
}

export interface GradeItem {
  id: string;
  nisn: string;
  nama_lengkap: string;
  kelas: string;
  tanggal: string;
  jenisPenilaian: JenisPenilaian;
  materi: string; // Kolom Materi yang diminta user
  tujuanPembelajaran: string; // Kolom Tujuan Pembelajaran (TP) yang diminta user
  nilai: number; // 0 - 100
  ketercapaian?: 'Sangat Baik' | 'Tercapai' | 'Perlu Bimbingan' | 'Belum Tercapai';
  catatan?: string;
}

export type StatusKehadiran = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export interface AttendanceItem {
  id: string;
  nisn: string;
  nama_lengkap: string;
  kelas: string;
  tanggal: string;
  status: StatusKehadiran;
  keterangan?: string;
}

export interface ScheduleItem {
  id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  jamMulai: string;
  jamSelesai: string;
  kelas: string;
  mataPelajaran: string;
  ruang: string;
  topik?: string;
}

export interface ClassItem {
  id: string;
  nama: string;
  tingkat: 'X' | 'XI' | 'XII';
  jurusan: string;
  waliKelas: string;
  nipWaliKelas?: string;
  noHpWaliKelas?: string;
  ruang: string;
  totalSiswa: number;
}

export interface TaggedStudentNote {
  nisn: string;
  nama_lengkap: string;
  catatan: string;
}

export interface TeachingJournalItem {
  id: string;
  tanggal: string; // YYYY-MM-DD
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  jamKe: string;
  kelas: string;
  materi: string;
  tujuanPembelajaran?: string;
  aktivitasPembelajaran: string;
  refleksiGuru: string;
  catatanSiswaKhusus: TaggedStudentNote[];
  createdAt: string;
}

export interface TeacherProfile {
  nama: string;
  nip: string;
  mataPelajaran: string;
  fotoUrl: string;
}

export type UserRole = 'guru' | 'siswa';

export interface CurrentUser {
  role: UserRole;
  nisn?: string; // only if role === 'siswa'
  nama: string;
  kelas?: string;
}

export interface StudentUnifiedNote {
  id: string;
  sumber: 'Jurnal KBM' | 'Presensi' | 'Penilaian';
  tanggal: string;
  materiAtauKonteks: string;
  catatan: string;
  guru: string;
}

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
  webViewLink?: string;
}

export interface DriveSyncState {
  isConnected: boolean;
  userEmail?: string;
  userName?: string;
  userPhoto?: string;
  lastSyncTime?: string;
  folderId?: string;
  folderLink?: string;
  latestSheetId?: string;
  latestSheetLink?: string;
}

