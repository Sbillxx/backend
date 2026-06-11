import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { type SidebarData, type NavGroup as NavGroupType } from './types'
import { Building2 } from 'lucide-react'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  data: SidebarData
}

export function AppSidebar({ data, ...props }: AppSidebarProps) {
  // Temporary debug untuk melihat data yang diterima
  console.log('🔍 AppSidebar received data:', data)

  // Safety checks untuk memastikan data tersedia
  if (!data) {
    console.warn('❌ AppSidebar: data prop is undefined')
    return (
      <Sidebar collapsible='icon' variant='floating' {...props}>
        <SidebarHeader>
          <div className='p-4 text-sm text-muted-foreground'>Loading...</div>
        </SidebarHeader>
        <SidebarContent>
          <div className='p-4 text-sm text-muted-foreground'>
            Loading sidebar...
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    )
  }

  console.log('✅ AppSidebar: data received successfully')
  console.log('📊 Teams data:', data.teams)
  console.log('👤 User data:', data.user)

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={data.teams || []}
          currentTeam={
            // Use active_team from page props instead of user.team
            data.active_team
              ? {
                  name: data.active_team.name,
                  logo: Building2,
                  plan: data.active_team.plan || 'Team',
                  id: data.active_team.id,
                }
              : undefined // Change from null to undefined
          }
          canCreateTeam={data.user?.role === 'admin'}
        />
      </SidebarHeader>
      <SidebarContent>
        {(data.navGroups || []).map((groupProps: NavGroupType) => (
          <NavGroup key={groupProps.title} {...groupProps} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
