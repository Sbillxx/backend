import {
  IconBarrierBlock,
  IconBrowserCheck,
  IconBug,
  IconChecklist,
  IconError404,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers,
  IconChartBar,
  IconShoppingBag,
  IconShoppingBagDiscount,
  IconShoe,
  IconRobot,
  IconMail,
  IconPlus,
  IconShield,
} from '@tabler/icons-react'
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Target,
  FolderKanban,
  Users as UsersLucide,
  Building2,
} from 'lucide-react'
import { type SidebarData } from '../types'

// Fungsi helper untuk mendapatkan menu berdasarkan role dan team
export const getSidebarData = (user: any, teams: any[], activeTeam?: any): SidebarData => {
  console.log('🚀 getSidebarData called with:', { user, teams, activeTeam });

  const isAdmin = user.role === 'admin';
  const currentTeam = activeTeam || user.team;

  console.log('🔍 getSidebarData processing:', { isAdmin, currentTeam });

  const result = {
    user: {
      name: user.name,
      email: user.email,
      avatar: '/avatars/shadcn.jpg',
      role: user.role,
      team: currentTeam?.name || 'No Team',
    },
    teams: teams && teams.length > 0 ? teams.map(team => ({
      name: team.name,
      logo: team.name === 'Kominfo' ? Command :
            team.name === 'Magang' ? AudioWaveform :
            GalleryVerticalEnd,
      plan: team.plan,
      id: team.id,
    })) : [],
    navGroups: [
      {
        title: 'Umum',
        items: [
          {
            title: 'Dashboard',
            url: '/dashboard',
            icon: IconLayoutDashboard,
            badge: currentTeam ? currentTeam.name : undefined,
          },
          {
            title: 'Proyek',
            url: '/dashboard/projects',
            icon: Target,
            badge: currentTeam ? `Proyek ${currentTeam.name}` : 'Semua Proyek',
          },
          {
            title: 'Evaluasi Kinerja',
            url: '/dashboard/evaluations',
            icon: IconChecklist,
          },
        ],
      },
      // Menu team-specific (jika ada team yang dipilih)
      ...(currentTeam ? [{
        title: `Tim ${currentTeam.name}`,
        items: [
          {
            title: 'Ringkasan Tim',
            url: `/dashboard/teams/${currentTeam.id}`,
            icon: Building2,
          },
          {
            title: 'Proyek Tim',
            url: `/dashboard/projects?team=${currentTeam.id}`,
            icon: FolderKanban,
          },
          {
            title: 'Anggota Tim',
            url: `/dashboard/teams/${currentTeam.id}/members`,
            icon: UsersLucide,
          },
        ],
      }] : []),
      // Menu khusus admin
      ...(isAdmin ? [{
        title: 'Administrasi',
        items: [
          {
            title: 'Manajemen Tim',
            url: '/dashboard/teams',
            icon: Building2,
            adminOnly: true,
          },
          {
            title: 'Manajemen Pengguna',
            url: '/dashboard/users',
            icon: UsersLucide,
            adminOnly: true,
          },
          {
            title: 'Buat Proyek',
            url: '/dashboard/projects/create',
            icon: IconPlus,
            adminOnly: true,
          },
        ],
      }] : []),
      {
        title: 'Pengaturan & Bantuan',
        items: [
          {
            title: 'Pengaturan',
            icon: IconSettings,
            items: [
              {
                title: 'Profil',
                url: '/dashboard/settings',
                icon: IconUserCog,
              },
              {
                title: 'Notifikasi',
                url: '/dashboard/settings/notifications',
                icon: IconNotification,
              },
              // Menu security khusus admin
              ...(isAdmin ? [{
                title: 'Keamanan',
                url: '/dashboard/settings/security',
                icon: IconShield,
                adminOnly: true,
              }] : []),
            ],
          },
        ],
      },
    ],
  };

  console.log('✅ getSidebarData result:', result);
  return result;
}

// Default sidebar data (untuk fallback)
export const sidebarData: SidebarData = {
  user: {
    name: 'Loading...',
    email: 'loading@example.com',
    avatar: '/avatars/shadcn.jpg',
    role: 'user',
    team: 'Loading...',
  },
  teams: [],
  navGroups: [
    {
      title: 'Umum',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Proyek',
          url: '/dashboard/projects',
          icon: Target,
        },
      ],
    },
  ],
}
