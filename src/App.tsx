import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { ManajemenNilai } from './components/ManajemenNilai';
import { DataSiswa } from './components/DataSiswa';
import { Presensi } from './components/Presensi';
import { DataKelas } from './components/DataKelas';
import { JadwalMengajar } from './components/JadwalMengajar';
import { JurnalMengajar } from './components/JurnalMengajar';
import { Dashboard } from './components/Dashboard';
import { ProfilSiswa } from './components/ProfilSiswa';
import { SiswaPortal } from './components/SiswaPortal';
import { LoginModal } from './components/LoginModal';
import { ModalUbahFotoGuru } from './components/ModalUbahFotoGuru';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { AcademicBackupPayload } from './services/googleDriveService';
import {
  Student,
  GradeItem,
  AttendanceItem,
  TeachingJournalItem,
  CurrentUser,
  ClassItem,
  ScheduleItem,
  TeacherProfile
} from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_CLASSES,
  INITIAL_SCHEDULES,
  INITIAL_JOURNALS,
  INITIAL_TEACHER_PROFILE,
  generateInitialGrades,
  generateInitialAttendance,
} from './data/initialData';
import { User, LogOut, RotateCcw, X, ShieldCheck, GraduationCap, Camera, Cloud } from 'lucide-react';

export default function App() {
  // Current user authentication state (Guru vs Siswa)
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    const saved = localStorage.getItem('sistem_akademik_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      role: 'guru',
      nama: 'Bayu Gunarto, M.Pd',
      nip: '19821215',
    };
  });

  // Navigation active tab for Teacher view
  const [activeTab, setActiveTab] = useState<ActiveTab>('nilai');

  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Login Modal state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Persistence for Students
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('sistem_akademik_students');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_STUDENTS;
  });

  // Persistence for Grades
  const [grades, setGrades] = useState<GradeItem[]>(() => {
    const saved = localStorage.getItem('sistem_akademik_grades');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return generateInitialGrades();
  });

  // Persistence for Attendance
  const [attendance, setAttendance] = useState<AttendanceItem[]>(() => {
    const saved = localStorage.getItem('sistem_akademik_attendance');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return generateInitialAttendance();
  });

  // Persistence for Teaching Journals (User Request 7)
  const [journals, setJournals] = useState<TeachingJournalItem[]>(() => {
    const saved = localStorage.getItem('sistem_akademik_journals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_JOURNALS;
  });

  // Persistence for Classes
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    const saved = localStorage.getItem('sistem_akademik_classes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CLASSES;
  });

  // Persistence for Schedules
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('sistem_akademik_schedules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SCHEDULES;
  });

  // Persistence for Teacher Profile & Avatar Photo (User Request: Bayu Gunarto, M.Pd)
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(() => {
    const saved = localStorage.getItem('sistem_akademik_teacher_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TEACHER_PROFILE;
  });

  // Profile / Settings Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  // Modal for changing Teacher Photo & Profile
  const [isTeacherPhotoModalOpen, setIsTeacherPhotoModalOpen] = useState(false);
  // Modal for Google Drive Sync & Backup
  const [isDriveSyncModalOpen, setIsDriveSyncModalOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('sistem_akademik_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sistem_akademik_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('sistem_akademik_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('sistem_akademik_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('sistem_akademik_journals', JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    localStorage.setItem('sistem_akademik_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('sistem_akademik_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('sistem_akademik_teacher_profile', JSON.stringify(teacherProfile));
  }, [teacherProfile]);

  const availableClasses = (classes || []).map((c) => c.nama);

  const handleResetData = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mengatur ulang data kembali ke data awal bawaan (25 siswa kelas XI-1, template nilai, jadwal, dan jurnal mengajar)?'
      )
    ) {
      setStudents(INITIAL_STUDENTS);
      setGrades(generateInitialGrades());
      setAttendance(generateInitialAttendance());
      setJournals(INITIAL_JOURNALS);
      setClasses(INITIAL_CLASSES);
      setSchedules(INITIAL_SCHEDULES);
      setTeacherProfile(INITIAL_TEACHER_PROFILE);
      localStorage.removeItem('sistem_akademik_students');
      localStorage.removeItem('sistem_akademik_grades');
      localStorage.removeItem('sistem_akademik_attendance');
      localStorage.removeItem('sistem_akademik_journals');
      localStorage.removeItem('sistem_akademik_classes');
      localStorage.removeItem('sistem_akademik_schedules');
      localStorage.removeItem('sistem_akademik_teacher_profile');
      setIsProfileModalOpen(false);
    }
  };

  const handleRestoreFromBackup = (payload: AcademicBackupPayload) => {
    if (payload.teacherProfile) setTeacherProfile(payload.teacherProfile);
    if (payload.students && Array.isArray(payload.students)) setStudents(payload.students);
    if (payload.grades && Array.isArray(payload.grades)) setGrades(payload.grades);
    if (payload.attendance && Array.isArray(payload.attendance)) setAttendance(payload.attendance);
    if (payload.classes && Array.isArray(payload.classes)) setClasses(payload.classes);
    if (payload.schedules && Array.isArray(payload.schedules)) setSchedules(payload.schedules);
    if (payload.journals && Array.isArray(payload.journals)) setJournals(payload.journals);
  };

  // If active user is Student, render the dedicated Student Portal View
  if (currentUser.role === 'siswa') {
    const student =
      students.find((s) => s.nisn === currentUser.nisn) ||
      students[0] || {
        nisn: currentUser.nisn || '0071234501',
        nama_lengkap: currentUser.nama,
        kelas: currentUser.kelas || 'XI-1',
        agama: 'Islam',
      };

    return (
      <div className="min-h-screen bg-slate-100 font-sans antialiased text-slate-900">
        <SiswaPortal
          currentStudent={student}
          allStudents={students}
          setStudents={setStudents}
          grades={grades}
          attendance={attendance}
          schedules={schedules}
          journals={journals}
          onLogout={() => {
            setCurrentUser({
              role: 'guru',
              nama: 'Bayu Gunarto, M.Pd',
              nip: '19821215',
            });
          }}
        />
      </div>
    );
  }

  // Teacher Dashboard & Academic Workspace
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogoutClick={() => setIsProfileModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSwitchToStudentPortal={() => setIsLoginModalOpen(true)}
        teacherProfile={teacherProfile}
        onEditTeacherProfile={() => setIsTeacherPhotoModalOpen(true)}
        onOpenDriveSync={() => setIsDriveSyncModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header with live clock */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSwitchToStudentPortal={() => setIsLoginModalOpen(true)}
          onOpenDriveSync={() => setIsDriveSyncModalOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard
                students={students}
                grades={grades}
                schedules={schedules}
                classes={classes}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'kelas' && (
              <DataKelas
                classes={classes}
                setClasses={setClasses}
                students={students}
                onSelectClass={(cls) => {
                  setActiveTab('nilai');
                }}
              />
            )}

            {activeTab === 'siswa' && (
              <DataSiswa
                students={students}
                setStudents={setStudents}
                availableClasses={availableClasses}
              />
            )}

            {activeTab === 'profil' && (
              <ProfilSiswa
                students={students}
                setStudents={setStudents}
                availableClasses={availableClasses}
              />
            )}

            {activeTab === 'jadwal' && (
              <JadwalMengajar
                schedules={schedules}
                setSchedules={setSchedules}
                availableClasses={availableClasses}
              />
            )}

            {activeTab === 'jurnal' && (
              <JurnalMengajar
                journals={journals}
                setJournals={setJournals}
                students={students}
                availableClasses={availableClasses}
              />
            )}

            {activeTab === 'presensi' && (
              <Presensi
                students={students}
                attendance={attendance}
                setAttendance={setAttendance}
                availableClasses={availableClasses}
              />
            )}

            {activeTab === 'nilai' && (
              <ManajemenNilai
                students={students}
                grades={grades}
                setGrades={setGrades}
                availableClasses={availableClasses}
                onOpenDriveSync={() => setIsDriveSyncModalOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modal Switch Login (Guru / Siswa) */}
      {isLoginModalOpen && (
        <LoginModal
          students={students}
          onLogin={(user) => {
            setCurrentUser(user);
            setIsLoginModalOpen(false);
          }}
          onCancel={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* User Profile & Data Dialog */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-800 text-base">
                  Profil Guru & Pengaturan Data
                </h4>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="relative shrink-0">
                  {teacherProfile?.fotoUrl ? (
                    <img
                      src={teacherProfile.fotoUrl}
                      alt={teacherProfile.nama}
                      className="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-blue-200 border border-slate-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">
                    {teacherProfile?.nama || 'Bayu Gunarto, M.Pd'}
                  </p>
                  <p className="font-mono text-slate-500 text-xs">
                    NIP: {teacherProfile?.nip || '19821215'}
                  </p>
                  <p className="text-blue-700 font-medium text-xs truncate mt-0.5">
                    {teacherProfile?.mataPelajaran || 'Guru Matematika SMA • Kurikulum Merdeka'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsTeacherPhotoModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Ubah / Pasang Foto Profil Guru</span>
              </button>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <p>
                  Aplikasi berbasis spreadsheet ini menyimpan data input nilai, presensi,
                  biodata siswa, jadwal, jurnal mengajar, dan foto profil secara lokal di browser Anda dengan aman.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsDriveSyncModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Cloud className="w-4 h-4" />
                <span>Pencadangan & Sinkronisasi Google Drive</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors border border-blue-200 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Beralih / Login Sebagai Siswa (NISN)</span>
              </button>

              <button
                onClick={handleResetData}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors border border-rose-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Data Awal Bawaan</span>
              </button>

              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ubah Foto Profil Guru (Bayu Gunarto, M.Pd) */}
      <ModalUbahFotoGuru
        isOpen={isTeacherPhotoModalOpen}
        onClose={() => setIsTeacherPhotoModalOpen(false)}
        profile={teacherProfile}
        onSave={(updated) => setTeacherProfile(updated)}
      />

      {/* Modal Google Drive Sync & Backup */}
      <GoogleDriveSyncModal
        isOpen={isDriveSyncModalOpen}
        onClose={() => setIsDriveSyncModalOpen(false)}
        teacherProfile={teacherProfile}
        students={students}
        grades={grades}
        attendance={attendance}
        classes={classes}
        schedules={schedules}
        journals={journals}
        onRestoreData={handleRestoreFromBackup}
      />
    </div>
  );
}

