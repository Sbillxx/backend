import {AppSidebar} from "@/components/layout/app-sidebar"
import {Header} from '@/components/layout/header'
import {TopNav} from '@/components/layout/top-nav'
import {ProfileDropdown} from '@/components/profile-dropdown'
import {Search} from '@/components/search'
import { getSidebarData } from '@/components/layout/data/sidebar-data'
import { IconLayoutDashboard } from '@tabler/icons-react'
import { Target } from 'lucide-react'

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {ThemeSwitch} from "@/components/theme-switch"
import {Head, usePage} from "@inertiajs/react";


const topNav = [
  {
    title: 'Ringkasan',
    href: '/dashboard',
    isActive: true,
    disabled: false,
  }
]

export function AuthenticatedLayout({
    children,
    title,
    showHeader = true,
    withTopNav = true,
  }: any) {
  const page = usePage();
  const { auth } = page.props as any;
  const user = auth.user;

  // Safely get data from page props with fallbacks
  const userTeam = (page.props as any).user_team || null;
  const availableTeams = (page.props as any).available_teams || [];
  const activeTeam = (page.props as any).active_team || null;
  const userRole = (page.props as any).user_role || user.role || 'user';

  // Debug: Lihat data yang diterima dari backend
  console.log('🔍 AuthenticatedLayout Debug:');
  console.log('👤 user:', user);
  console.log('🏢 userTeam:', userTeam);
  console.log('🎯 activeTeam:', activeTeam);
  console.log('📊 availableTeams:', availableTeams);
  console.log('🔑 userRole:', userRole);

  // Prepare sidebar data with user info and teams
  let sidebarData;

  try {
    sidebarData = getSidebarData(
      {
        ...user,
        role: userRole,
        team: userTeam,
      },
      availableTeams,
      activeTeam // Pass active team to sidebar
    );


    console.log('✅ getSidebarData berhasil:', sidebarData);
  } catch (error) {
    console.error('❌ Error in getSidebarData:', error);
    sidebarData = null;
  }

  // Jika getSidebarData gagal, gunakan minimal fallback
  if (!sidebarData) {
    console.warn('⚠️ Using minimal fallback data');
    sidebarData = {
      user: {
        name: user.name || 'User',
        email: user.email || '',
        avatar: '/avatars/shadcn.jpg',
        role: userRole,
        team: userTeam?.name || 'No Team',
      },
      teams: [],
      navGroups: [
        {
          title: 'General',
          items: [
            {
              title: 'Dashboard',
              url: '/dashboard',
              icon: IconLayoutDashboard,
            },
            {
              title: 'projects',
              url: '/dashboard/projects',
              icon: Target,
            },
          ],
        },
      ],
    };
  }

  console.log('📋 Final sidebarData yang akan dikirim:', sidebarData);

  return (
    <>
      <Head title={title ?? 'Dashboard'}/>
      <SidebarProvider>
        <AppSidebar data={sidebarData}/>
        <SidebarInset>
          {showHeader && <Header>
            {withTopNav && <TopNav links={topNav}/>}
            {!withTopNav && <Search/>}
            <div className='ml-auto flex items-center space-x-4'>
              {withTopNav && <Search/>}
              <ThemeSwitch/>
              <ProfileDropdown/>
            </div>
          </Header>}
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
