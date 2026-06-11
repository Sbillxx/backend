import * as React from 'react'
import { ChevronsUpDown, Plus, Building2 } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function TeamSwitcher({
  teams,
  currentTeam,
  canCreateTeam = false,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
    id?: number
  }[]
  currentTeam?: {
    name: string
    logo?: React.ElementType
    plan: string
    id?: number
  }
  canCreateTeam?: boolean
}) {
  const { isMobile } = useSidebar()

  // Add "No Team" option to teams list
  const allTeams = [
    {
      name: 'No Team',
      logo: Building2,
      plan: 'Personal',
      id: 0,
    },
    ...teams,
  ]

  // Determine active team based on currentTeam prop
  const activeTeam =
    currentTeam && currentTeam.id !== 0 ? currentTeam : allTeams[0]

  console.log('🔍 TeamSwitcher Debug:', { currentTeam, activeTeam, teams })

  const handleTeamSwitch = async (team: any) => {
    try {
      if (team.id && team.id !== 0) {
        // Switch to selected team
        await router.post(route('dashboard.switch-team'), {
          team_id: team.id,
        })
      } else {
        // Switch to "No Team" mode
        await router.post(route('dashboard.switch-team'), {
          team_id: null,
        })
      }
    } catch (error) {
      console.error('Error switching team:', error)
    }
  }

  const handleAddTeam = () => {
    if (canCreateTeam) {
      router.get(route('dashboard.teams.create'))
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                {activeTeam?.logo ? (
                  <activeTeam.logo className='size-4' />
                ) : (
                  <Building2 className='size-4' />
                )}
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {activeTeam?.name || 'No Team'}
                </span>
                <span className='truncate text-xs'>
                  {activeTeam?.plan || 'Default'}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Teams
            </DropdownMenuLabel>
            {allTeams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => handleTeamSwitch(team)}
                className='gap-2 p-2 cursor-pointer'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  {team.logo ? (
                    <team.logo className='size-4 shrink-0' />
                  ) : (
                    <Building2 className='size-4 shrink-0' />
                  )}
                </div>
                <div className='flex-1'>
                  <div className='font-medium'>{team.name}</div>
                  <div className='text-xs text-muted-foreground'>{team.plan}</div>
                </div>
                {activeTeam?.id === team.id && (
                  <DropdownMenuShortcut>✓</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}

            {canCreateTeam && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='gap-2 p-2 cursor-pointer'
                  onClick={handleAddTeam}
                >
                  <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                    <Plus className='size-4' />
                  </div>
                  <div className='font-medium text-muted-foreground'>Add team</div>
                </DropdownMenuItem>
              </>
            )}

            {allTeams.length > 1 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={route('dashboard.teams.index')}
                    className='gap-2 p-2 cursor-pointer'
                  >
                    <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                      <Building2 className='size-4' />
                    </div>
                    <div className='font-medium text-muted-foreground'>
                      Manage teams
                    </div>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
