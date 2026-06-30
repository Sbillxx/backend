import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent select-none">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-slate-800 dark:text-slate-100">Dasbor Eksekutif</span>
                <span className="truncate text-xs text-muted-foreground">Kominfo</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
