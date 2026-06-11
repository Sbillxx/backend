import { useState } from 'react'
import { router } from '@inertiajs/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Check, ChevronDown } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface Team {
  id: number
  name: string
  description?: string
  plan?: string
  is_active: boolean
}

interface TeamSwitcherProps {
  currentTeam: Team | null
  teams: Team[]
  onTeamChange?: (team: Team | null) => void
}

export function TeamSwitcher({ currentTeam, teams, onTeamChange }: TeamSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState(false)

  const handleTeamSwitch = async (teamId: string) => {
    setSwitching(true)
    setOpen(false)

    try {
      // Jika pilih "no-team", kirim null
      if (teamId === 'no-team') {
        await router.post(route('dashboard.switch-team'), {
          team_id: null
        }, {
          preserveState: false,
          preserveScroll: false,
          onSuccess: () => {
            onTeamChange?.(null)
          }
        })
      } else {
        const selectedTeam = teams.find(team => team.id.toString() === teamId)
        if (selectedTeam) {
          await router.post(route('dashboard.switch-team'), {
            team_id: selectedTeam.id
          }, {
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => {
              onTeamChange?.(selectedTeam)
            }
          })
        }
      }
    } catch (error) {
      console.error('Error switching team:', error)
    } finally {
      setSwitching(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={switching}
        >
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {switching ? 'Switching...' : (currentTeam?.name || 'No Team')}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search teams..." />
          <CommandList>
            <CommandEmpty>No teams found.</CommandEmpty>
            <CommandGroup>
              {/* Option for no team */}
              <CommandItem
                value="no-team"
                onSelect={() => handleTeamSwitch('no-team')}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>No Team</span>
                </div>
                {!currentTeam && <Check className="h-4 w-4" />}
              </CommandItem>

              {/* Available teams */}
              {teams.map((team) => (
                <CommandItem
                  key={team.id}
                  value={team.id.toString()}
                  onSelect={(value) => handleTeamSwitch(value)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{team.name}</span>
                      {team.description && (
                        <span className="text-xs text-muted-foreground">
                          {team.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {team.plan && (
                      <Badge variant="secondary" className="text-xs">
                        {team.plan}
                      </Badge>
                    )}
                    {currentTeam?.id === team.id && <Check className="h-4 w-4" />}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
