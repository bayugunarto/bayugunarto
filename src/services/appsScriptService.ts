/**
 * Layanan Sinkronisasi Google Spreadsheet via Google Apps Script Web App
 * Keuntungan:
 * 1. 100% Gratis & Langsung ke Google Drive bayugunarto@gmail.com
 * 2. Tanpa Google Cloud Console, tanpa Client ID, tanpa error origin_mismatch
 * 3. Data tersimpan rapi dalam lembar-lembar Google Spreadsheet
 */

import {
  Student,
  GradeItem,
  AttendanceItem,
  TeachingJournalItem,
  ClassItem,
  ScheduleItem,
  TeacherProfile,
} from '../types';

export interface AcademicSyncPayload {
  teacherProfile?: TeacherProfile;
  students?: Student[];
  grades?: GradeItem[];
  attendance?: AttendanceItem[];
  classes?: ClassItem[];
  schedules?: ScheduleItem[];
  journals?: TeachingJournalItem[];
  lastSync?: string;
}

const STORAGE_KEY_APPSCRIPT_URL = 'sistem_akademik_appscript_url';
const STORAGE_KEY_LAST_SHEETS_SYNC = 'sistem_akademik_last_sheets_sync';

export const getStoredAppsScriptUrl = (): string => {
  return localStorage.getItem(STORAGE_KEY_APPSCRIPT_URL) || '';
};

export const saveStoredAppsScriptUrl = (url: string) => {
  localStorage.setItem(STORAGE_KEY_APPSCRIPT_URL, url.trim());
};

export const getStoredLastSheetsSync = (): string | null => {
  return localStorage.getItem(STORAGE_KEY_LAST_SHEETS_SYNC);
};

export const setStoredLastSheetsSync = (isoString: string) => {
  localStorage.setItem(STORAGE_KEY_LAST_SHEETS_SYNC, isoString);
};

/**
 * Kirim data ke Google Apps Script (Simpan ke Spreadsheet)
 */
export const pushDataToGoogleSheets = async (
  url: string,
  payload: AcademicSyncPayload
): Promise<{ success: boolean; message: string }> => {
  if (!url) {
    throw new Error('URL Web App Google Apps Script belum diisi.');
  }

  const cleanUrl = url.trim();

  // Kirim dengan POST JSON
  const response = await fetch(cleanUrl, {
    method: 'POST',
    mode: 'no-cors', // Apps Script web apps return redirect 302 that no-cors absorbs safely
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'syncAll',
      data: payload,
      timestamp: new Date().toISOString(),
    }),
  });

  // Karena no-cors mengembalikan opaque response, jika tidak throw error berarti network berhasil
  setStoredLastSheetsSync(new Date().toISOString());
  return {
    success: true,
    message: 'Data berhasil dikirim ke Google Spreadsheet Anda!',
  };
};

/**
 * Muat data dari Google Spreadsheet (Ambil dari Google Sheets)
 */
export const pullDataFromGoogleSheets = async (
  url: string
): Promise<AcademicSyncPayload | null> => {
  if (!url) {
    throw new Error('URL Web App Google Apps Script belum diisi.');
  }

  const cleanUrl = url.trim();
  const fetchUrl = cleanUrl.includes('?') ? `${cleanUrl}&action=getAll` : `${cleanUrl}?action=getAll`;

  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error(`Gagal mengambil data dari Google Spreadsheet (${response.status})`);
  }

  const result = await response.json();
  if (result.status === 'success' && result.data) {
    setStoredLastSheetsSync(new Date().toISOString());
    return result.data as AcademicSyncPayload;
  } else {
    throw new Error(result.message || 'Format data Google Spreadsheet tidak sesuai.');
  }
};

/**
 * Kode Google Apps Script siap pakai untuk dicopy oleh Guru
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - DATABASE SISTEM AKADEMIK GURU MATEMATIKA SMA
 * Guru: Bayu Gunarto, M.Pd
 * =========================================================================
 * PETUNJUK PEMASANGAN 1 KALI (MUDAH & CEPAT):
 * 1. Buat Google Spreadsheet baru di Google Drive Anda.
 * 2. Beri nama file, misal: "Database Akademik Matematika SMA".
 * 3. Di menu atas Spreadsheet, klik: Ekstensi > Apps Script.
 * 4. Hapus seluruh isi kode yang ada di editor, lalu TEMPEL (PASTE) semua kode ini.
 * 5. Klik ikon DISKET (Simpan).
 * 6. Di pojok kanan atas, klik tombol biru "Terapkan" (Deploy) > pilih "Penerapan baru" (New deployment).
 * 7. Pada ikon Gerigi (Pilih jenis): pilih "Aplikasi Web" (Web app).
 * 8. Pengaturan:
 *    - Deskripsi: Database Sistem Akademik
 *    - Jalankan sebagai (Execute as): "Saya" (Me / email Anda)
 *    - Siapa yang memiliki akses (Who has access): "Siapa saja" (Anyone)
 * 9. Klik tombol "Terapkan" (Deploy).
 *    (Jika muncul jendela otorisasi, klik 'Tinjau Izin' > pilih akun Google Anda > klik 'Lanjutan / Advanced' > klik 'Buka Database Akademik (tidak aman)' > klik 'Izinkan').
 * 10. Salin "URL Aplikasi Web" (yang berakhiran /exec).
 * 11. Tempelkan URL tersebut ke aplikasi Sistem Akademik Anda di menu Spreadsheet Sync!
 * =========================================================================
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    var data = {
      teacherProfile: getObjectFromSheet(ss, "ProfilGuru"),
      students: getArrayFromSheet(ss, "DataSiswa"),
      classes: getArrayFromSheet(ss, "DataKelas"),
      grades: getArrayFromSheet(ss, "NilaiSiswa"),
      attendance: getArrayFromSheet(ss, "PresensiSiswa"),
      schedules: getArrayFromSheet(ss, "JadwalMengajar"),
      journals: getArrayFromSheet(ss, "JurnalMengajar"),
      lastSync: new Date().toISOString()
    };
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var postContent = e.postData.contents;
    var contents = JSON.parse(postContent);
    var payload = contents.data || contents;
    
    if (payload.teacherProfile) saveObjectToSheet(ss, "ProfilGuru", payload.teacherProfile);
    if (payload.students) saveArrayToSheet(ss, "DataSiswa", payload.students);
    if (payload.classes) saveArrayToSheet(ss, "DataKelas", payload.classes);
    if (payload.grades) saveArrayToSheet(ss, "NilaiSiswa", payload.grades);
    if (payload.attendance) saveArrayToSheet(ss, "PresensiSiswa", payload.attendance);
    if (payload.schedules) saveArrayToSheet(ss, "JadwalMengajar", payload.schedules);
    if (payload.journals) saveArrayToSheet(ss, "JurnalMengajar", payload.journals);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data berhasil disimpan ke Google Spreadsheet!",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper: Simpan Array Objek ke Sheet
function saveArrayToSheet(ss, sheetName, items) {
  if (!items || !items.length) return;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  // Ambil headers dari properti objek pertama
  var headers = Object.keys(items[0]);
  var rows = [headers];
  
  for (var i = 0; i < items.length; i++) {
    var row = [];
    for (var h = 0; h < headers.length; h++) {
      var val = items[i][headers[h]];
      if (typeof val === 'object' && val !== null) {
        row.push(JSON.stringify(val));
      } else {
        row.push(val !== undefined ? val : "");
      }
    }
    rows.push(row);
  }
  
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#E2E8F0");
  sheet.autoResizeColumns(1, headers.length);
}

// Helper: Baca Array Objek dari Sheet
function getArrayFromSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  
  var headers = values[0];
  var result = [];
  
  for (var r = 1; r < values.length; r++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var cellVal = values[r][c];
      // Coba parse JSON jika nilai array/objek
      if (typeof cellVal === 'string' && (cellVal.startsWith('{') || cellVal.startsWith('['))) {
        try {
          cellVal = JSON.parse(cellVal);
        } catch (e) {}
      }
      obj[headers[c]] = cellVal;
    }
    result.push(obj);
  }
  return result;
}

// Helper: Simpan Objek Tunggal
function saveObjectToSheet(ss, sheetName, obj) {
  if (!obj) return;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  var rows = [["Kunci / Properti", "Nilai"]];
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    var val = obj[keys[i]];
    if (typeof val === 'object' && val !== null) {
      val = JSON.stringify(val);
    }
    rows.push([keys[i], val !== undefined ? val : ""]);
  }
  
  sheet.getRange(1, 1, rows.length, 2).setValues(rows);
  sheet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#E2E8F0");
  sheet.autoResizeColumns(1, 2);
}

// Helper: Baca Objek Tunggal
function getObjectFromSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return null;
  
  var obj = {};
  for (var r = 1; r < values.length; r++) {
    var key = values[r][0];
    var val = values[r][1];
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try { val = JSON.parse(val); } catch (e) {}
    }
    obj[key] = val;
  }
  return obj;
}
`;
