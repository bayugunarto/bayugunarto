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

export const GOOGLE_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  '484203652729-sgo47m5111t2591t4v1662uiqush68mo.apps.googleusercontent.com';

export const GOOGLE_SCOPES =
  'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';

export const DRIVE_FOLDER_NAME = 'Sistem Akademik Matematika - Bayu Gunarto, M.Pd';

declare global {
  interface Window {
    google?: any;
  }
}

// Token & Auth storage keys
const TOKEN_KEY = 'sistem_akademik_google_drive_token';
const EXPIRES_AT_KEY = 'sistem_akademik_google_drive_token_expires';
const USER_INFO_KEY = 'sistem_akademik_google_drive_user';
const FOLDER_ID_KEY = 'sistem_akademik_google_drive_folder_id';
const FOLDER_LINK_KEY = 'sistem_akademik_google_drive_folder_link';
const LAST_SYNC_KEY = 'sistem_akademik_google_drive_last_sync';

export interface GoogleDriveUser {
  email?: string;
  name?: string;
  picture?: string;
}

export interface AcademicBackupPayload {
  app: string;
  version: string;
  exportedAt: string;
  teacherProfile: TeacherProfile;
  students: Student[];
  grades: GradeItem[];
  attendance: AttendanceItem[];
  classes: ClassItem[];
  schedules: ScheduleItem[];
  journals: TeachingJournalItem[];
}

/**
 * Get stored valid OAuth token or null if expired
 */
export function getStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
  if (!token || !expiresAt) return null;

  if (Date.now() > Number(expiresAt)) {
    // Token expired
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    return null;
  }
  return token;
}

/**
 * Save token with expiration buffer (default 50 minutes)
 */
export function saveToken(token: string, expiresInSeconds: number = 3500) {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
  localStorage.removeItem(USER_INFO_KEY);
  localStorage.removeItem(FOLDER_ID_KEY);
  localStorage.removeItem(FOLDER_LINK_KEY);
}

export function getStoredUserInfo(): GoogleDriveUser | null {
  const data = localStorage.getItem(USER_INFO_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function getStoredFolderInfo(): { folderId: string | null; folderLink: string | null } {
  return {
    folderId: localStorage.getItem(FOLDER_ID_KEY),
    folderLink: localStorage.getItem(FOLDER_LINK_KEY),
  };
}

export function getStoredLastSync(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

export function setStoredLastSync(timeStr: string) {
  localStorage.setItem(LAST_SYNC_KEY, timeStr);
}

/**
 * Request OAuth access token using Google Identity Services (GSI) Token Model
 */
export function requestGoogleDriveAccess(): Promise<{ token: string; user?: GoogleDriveUser }> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(
        new Error(
          'Google Identity Services belum dimuat. Mohon pastikan koneksi internet aktif dan coba muat ulang halaman.'
        )
      );
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: async (response: any) => {
          if (response.error) {
            console.error('OAuth error:', response);
            reject(new Error(response.error_description || response.error || 'Gagal masuk ke Google.'));
            return;
          }

          const token = response.access_token;
          const expiresIn = response.expires_in ? Number(response.expires_in) : 3500;
          saveToken(token, expiresIn);

          // Try to fetch user info
          let user: GoogleDriveUser | undefined;
          try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              user = {
                email: userData.email || 'bayugunarto@gmail.com',
                name: userData.name || 'Bayu Gunarto',
                picture: userData.picture,
              };
              localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
            }
          } catch {
            // Default user fallback
            user = { email: 'bayugunarto@gmail.com', name: 'Bayu Gunarto' };
          }

          resolve({ token, user });
        },
      });

      client.requestAccessToken({ prompt: '' });
    } catch (err: any) {
      reject(new Error(err?.message || 'Gagal memulai koneksi Google Drive'));
    }
  });
}

/**
 * Ensure dedicated Google Drive folder exists for this app
 */
export async function getOrCreateAppFolder(
  token: string
): Promise<{ folderId: string; folderLink: string }> {
  // Check cached folder first
  const cached = getStoredFolderInfo();
  if (cached.folderId && cached.folderLink) {
    // Verify folder still exists
    try {
      const checkRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${cached.folderId}?fields=id,name,trashed,webViewLink`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (!checkData.trashed) {
          return {
            folderId: checkData.id,
            folderLink: checkData.webViewLink || `https://drive.google.com/drive/folders/${checkData.id}`,
          };
        }
      }
    } catch {
      // Ignore and proceed to search/create
    }
  }

  // Search by name
  const query = `name = '${DRIVE_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,webViewLink)&spaces=drive`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    throw new Error(`Gagal mencari folder di Google Drive: ${errorText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    const folder = searchData.files[0];
    const link = folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`;
    localStorage.setItem(FOLDER_ID_KEY, folder.id);
    localStorage.setItem(FOLDER_LINK_KEY, link);
    return { folderId: folder.id, folderLink: link };
  }

  // Create new folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder penyimpanan cadangan data dan rekapitulasi nilai matematika SMA oleh Bayu Gunarto, M.Pd',
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Gagal membuat folder di Google Drive: ${errorText}`);
  }

  const newFolder = await createRes.json();
  const link = newFolder.webViewLink || `https://drive.google.com/drive/folders/${newFolder.id}`;
  localStorage.setItem(FOLDER_ID_KEY, newFolder.id);
  localStorage.setItem(FOLDER_LINK_KEY, link);
  return { folderId: newFolder.id, folderLink: link };
}

/**
 * Backup full database to Google Drive as JSON file
 */
export async function backupDatabaseToDrive(
  token: string,
  payload: AcademicBackupPayload
): Promise<{ fileId: string; fileName: string; webViewLink: string; folderLink: string }> {
  const { folderId, folderLink } = await getOrCreateAppFolder(token);

  const dateStr = new Date().toISOString().slice(0, 10);
  const timeStr = new Date().toTimeString().slice(0, 5).replace(':', '-');
  const fileName = `Cadangan_Akademik_Matematika_${dateStr}_${timeStr}.json`;

  const fileContent = JSON.stringify(payload, null, 2);

  // Upload using multipart
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId],
    description: `Cadangan data sistem akademik matematika per ${new Date().toLocaleString('id-ID')}`,
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Gagal mengunggah file cadangan ke Google Drive: ${errorText}`);
  }

  const uploadData = await uploadRes.json();
  const nowDisplay = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  setStoredLastSync(nowDisplay);

  return {
    fileId: uploadData.id,
    fileName: uploadData.name,
    webViewLink: uploadData.webViewLink || folderLink,
    folderLink,
  };
}

/**
 * List previous backup files stored in the Drive folder
 */
export async function listDriveBackups(token: string): Promise<DriveBackupFile[]> {
  const { folderId } = await getOrCreateAppFolder(token);

  const query = `'${folderId}' in parents and mimeType = 'application/json' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&orderBy=createdTime desc&fields=files(id,name,createdTime,size,webViewLink)&pageSize=20`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gagal memuat daftar cadangan: ${err}`);
  }

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    createdTime: f.createdTime,
    size: f.size ? `${(Number(f.size) / 1024).toFixed(1)} KB` : 'N/A',
    webViewLink: f.webViewLink,
  }));
}

/**
 * Download a backup JSON file from Google Drive and return parsed payload
 */
export async function downloadBackupFromDrive(
  token: string,
  fileId: string
): Promise<AcademicBackupPayload> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gagal mengunduh file cadangan dari Drive: ${err}`);
  }

  const data = await res.json();
  return data;
}

/**
 * Sync / Export academic data into an authentic Google Sheet in Google Drive
 */
export async function exportToGoogleSheets(
  token: string,
  data: {
    grades: GradeItem[];
    attendance: AttendanceItem[];
    students: Student[];
    journals: TeachingJournalItem[];
  }
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; folderLink: string }> {
  const { folderId, folderLink } = await getOrCreateAppFolder(token);

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const title = `Rekapitulasi Nilai & Akademik Matematika - ${todayStr}`;

  // 1. Create Spreadsheet
  const createSpreadsheetRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'Rekap Nilai Siswa' } },
        { properties: { title: 'Rekap Kehadiran' } },
        { properties: { title: 'Jurnal Mengajar' } },
        { properties: { title: 'Biodata Siswa' } },
      ],
    }),
  });

  if (!createSpreadsheetRes.ok) {
    const errorText = await createSpreadsheetRes.text();
    throw new Error(`Gagal membuat Google Spreadsheet: ${errorText}`);
  }

  const spreadsheetData = await createSpreadsheetRes.json();
  const spreadsheetId = spreadsheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // 2. Move spreadsheet into the dedicated folder
  try {
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${folderId}&fields=id,parents`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } catch (e) {
    console.warn('Gagal memindahkan spreadsheet ke folder khusus:', e);
  }

  // 3. Prepare data rows
  // Sheet 1: Rekap Nilai
  const gradesRows: (string | number)[][] = [
    [
      'NO',
      'TANGGAL',
      'KELAS',
      'NISN',
      'NAMA LENGKAP',
      'JENIS PENILAIAN',
      'MATERI',
      'TUJUAN PEMBELAJARAN (TP)',
      'NILAI',
      'STATUS KKTP (>= 75)',
      'CATATAN GURU',
    ],
    ...data.grades.map((g, idx) => [
      idx + 1,
      g.tanggal || '',
      g.kelas || '',
      g.nisn || '',
      g.nama_lengkap || '',
      g.jenisPenilaian || '',
      g.materi || '',
      g.tujuanPembelajaran || '',
      g.nilai ?? '',
      (g.nilai ?? 0) >= 75 ? 'TUNTAS' : 'BELUM TUNTAS',
      g.catatan || '',
    ]),
  ];

  // Sheet 2: Rekap Kehadiran
  const attendanceRows: (string | number)[][] = [
    ['NO', 'TANGGAL', 'KELAS', 'NISN', 'NAMA SISWA', 'STATUS KEHADIRAN', 'CATATAN / KETERANGAN'],
    ...data.attendance.map((a, idx) => [
      idx + 1,
      a.tanggal || '',
      a.kelas || '',
      a.nisn || '',
      a.nama_lengkap || '',
      a.status || '',
      a.keterangan || '',
    ]),
  ];

  // Sheet 3: Jurnal Mengajar
  const journalRows: (string | number)[][] = [
    [
      'NO',
      'TANGGAL',
      'HARI',
      'JAM KE',
      'KELAS',
      'MATERI / BAB',
      'TUJUAN PEMBELAJARAN',
      'AKTIVITAS PEMBELAJARAN',
      'REFLEKSI GURU',
      'SISWA BERPRESTASI / CATATAN KHUSUS',
    ],
    ...data.journals.map((j, idx) => [
      idx + 1,
      j.tanggal || '',
      j.hari || '',
      j.jamKe || '',
      j.kelas || '',
      j.materi || '',
      j.tujuanPembelajaran || '',
      j.aktivitasPembelajaran || '',
      j.refleksiGuru || '',
      (j.catatanSiswaKhusus || [])
        .map((c) => `${c.nama_lengkap}: ${c.catatan}`)
        .join('; '),
    ]),
  ];

  // Sheet 4: Biodata Siswa
  const studentRows: (string | number)[][] = [
    [
      'NO',
      'NISN',
      'NAMA LENGKAP',
      'KELAS',
      'NO HP SISWA',
      'HOBI',
      'RENCANA TAMAT SMA',
      'NAMA AYAH',
      'NO HP AYAH',
      'NAMA IBU',
      'NO HP IBU',
      'ALAMAT RUMAH',
      'HARAPAN UNTUK GURU MATEMATIKA',
    ],
    ...data.students.map((s, idx) => [
      idx + 1,
      s.nisn || '',
      s.nama_lengkap || '',
      s.kelas || '',
      s.no_HP || '',
      s.hoby || '',
      s.rencana_tamat_SMA || '',
      s.nama_ayah || '',
      s.no_HP_ayah || '',
      s.nama_ibu || '',
      s.no_HP_ibu || '',
      s.alamat_rumah || '',
      s.harapan_guru_matematika || '',
    ]),
  ];

  // 4. Batch update values
  const batchData = [
    { range: "'Rekap Nilai Siswa'!A1", values: gradesRows },
    { range: "'Rekap Kehadiran'!A1", values: attendanceRows },
    { range: "'Jurnal Mengajar'!A1", values: journalRows },
    { range: "'Biodata Siswa'!A1", values: studentRows },
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      }),
    }
  );

  if (!updateRes.ok) {
    const errorText = await updateRes.text();
    throw new Error(`Gagal mengisi data ke Google Spreadsheet: ${errorText}`);
  }

  const nowDisplay = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  setStoredLastSync(nowDisplay);

  return {
    spreadsheetId,
    spreadsheetUrl,
    folderLink,
  };
}
