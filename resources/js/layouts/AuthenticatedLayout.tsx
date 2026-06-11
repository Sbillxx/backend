import ApplicationLogo from '@/components/ApplicationLogo';
import Dropdown from '@/components/Dropdown';
import NavLink from '@/components/NavLink';
import ResponsiveNavLink from '@/components/ResponsiveNavLink';
import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { getSidebarData } from '@/components/layout/data/sidebar-data';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { Target } from 'lucide-react';

interface AuthenticatedLayoutProps {
    title?: string;
    header?: ReactNode;
}

export default function Authenticated({
    title,
    header,
    children,
}: PropsWithChildren<AuthenticatedLayoutProps>) {
    const page = usePage();
    const { auth } = page.props as any;
    const user = auth.user;

    // Safely get data from page props with fallbacks
    const userTeam = (page.props as any).user_team || null;
    const availableTeams = (page.props as any).available_teams || [];
    const userRole = (page.props as any).user_role || user.role || 'user';
    const canManageProjects = (page.props as any).can_manage_projects || false;

    // Debug: Lihat data yang diterima dari backend
    console.log('🔍 AuthenticatedLayout Debug:');
    console.log('👤 user:', user);
    console.log('🏢 userTeam:', userTeam);
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
            availableTeams
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

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <>
            <Head title={title} />
            <SidebarProvider>
                <AppSidebar data={sidebarData} />
                <SidebarInset>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {header && (
                            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                                <div className="p-4">
                                    {header}
                                </div>
                            </div>
                        )}
                        <main className="flex-1">
                            {children}
                        </main>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
