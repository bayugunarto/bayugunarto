import React from 'react';
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Calendar,
  CheckSquare,
  Award,
  LogOut,
  Calculator,
  UserCheck,
  BookOpen,
  X,
  Camera,
  Cloud
} from 'lucide-react';
import { TeacherProfile } from '../types';

export type ActiveTab =
  | 'dashboard'
  | 'kelas'
  | 'siswa'
  | 'profil'
  | 'jadwal'
  | 'jurnal'
  | 'presensi'
  | 'nilai';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogoutClick: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onSwitchToStudentPortal?: () => void;
  teacherProfile?: TeacherProfile;
  onEditTeacherProfile?: () => void;
  onOpenDriveSync?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogoutClick,
  isOpenMobile = false,
  onCloseMobile,
  onSwitchToStudentPortal,
  teacherProfile,
  onEditTeacherProfile,
  onOpenDriveSync,
}) => {
  const menuItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kelas' as ActiveTab, label: 'Data Kelas', icon: Building2 },
    { id: 'siswa' as ActiveTab, label: 'Data Siswa', icon: GraduationCap },
    { id: 'profil' as ActiveTab, label: 'Profil Siswa', icon: UserCheck },
    { id: 'jadwal' as ActiveTab, label: 'Jadwal Mengajar', icon: Calendar },
    { id: 'jurnal' as ActiveTab, label: 'Jurnal Mengajar', icon: BookOpen },
    { id: 'presensi' as ActiveTab, label: 'Presensi', icon: CheckSquare },
    { id: 'nilai' as ActiveTab, label: 'Manajemen Nilai', icon: Award },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
        />
      )}

      <aside
        id="sidebar-navigation"
        className={`fixed md:sticky top-0 z-50 md:z-20 w-64 min-w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen select-none shadow-xs transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Profile Section */}
        <div className="p-5 border-b border-slate-100 flex flex-col items-center text-center relative">
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="absolute top-4 right-4 md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="relative mb-3 group">
            <button
              type="button"
              onClick={onEditTeacherProfile}
              className="relative block rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform active:scale-95 cursor-pointer"
              title="Klik untuk mengubah foto profil Guru"
            >
              {teacherProfile?.fotoUrl ? (
                <img
                  src={teacherProfile.fotoUrl}
                  alt={teacherProfile?.nama || 'Bayu Gunarto, M.Pd'}
                  className="w-16 h-16 rounded-full object-cover shadow-md ring-4 ring-blue-50 border border-slate-200 group-hover:brightness-95 transition-all"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md ring-4 ring-blue-50 group-hover:from-blue-700 group-hover:to-indigo-600 transition-all">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              )}
              {/* Online Indicator */}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
            </button>

            {/* Quick Camera Badge Button */}
            {onEditTeacherProfile && (
              <button
                type="button"
                onClick={onEditTeacherProfile}
                className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md border-2 border-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
                title="Ganti Foto Profil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <h2 className="font-bold text-slate-800 text-base tracking-tight leading-snug">
            {teacherProfile?.nama || 'Bayu Gunarto, M.Pd'}
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-0.5">
            NIP: {teacherProfile?.nip || '19821215'}
          </p>

          {onEditTeacherProfile && (
            <button
              type="button"
              onClick={onEditTeacherProfile}
              className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer transition-colors"
            >
              <Camera className="w-3 h-3" />
              <span>Ganti Foto Profil</span>
            </button>
          )}

          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
            <Calculator className="w-3 h-3" />
            <span>Guru Matematika SMA</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu Utama
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-menu-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border border-blue-100/70'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'nilai' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-600 text-white font-mono font-medium">
                    TP
                  </span>
                )}
                {item.id === 'jurnal' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium">
                    Baru
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section with Portal Siswa Switch, Status and Logout */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          {onOpenDriveSync && (
            <button
              type="button"
              onClick={() => {
                onOpenDriveSync();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-800 border border-blue-200/80 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Pencadangan & Sinkronisasi Google Drive"
            >
              <span className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-600" />
                <span>Google Drive Sync</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white">
                Drive
              </span>
            </button>
          )}

          {onSwitchToStudentPortal && (
            <button
              onClick={onSwitchToStudentPortal}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Login Portal Siswa</span>
            </button>
          )}

          <div className="px-3 py-2 rounded-lg bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tahun Ajaran 2026/2027</span>
            </span>
            <span className="font-semibold text-slate-700">Ganjil</span>
          </div>

          <button
            id="btn-sidebar-logout"
            onClick={onLogoutClick}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Logout / Pengaturan</span>
          </button>
        </div>
      </aside>
    </>
  );
};

