import { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { AuthenticatedLayout } from '@/layouts/authenticated-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import {
  IconPlus,
  IconUserMinus,
  IconUsers,
  IconShield,
  IconArrowLeft,
  IconSettings,
  IconEye,
  IconDots,
  IconMail,
  IconBriefcase,
  IconSearch,
  IconUserPlus,
  IconCrown,
  IconStar,
  IconAlertCircle
} from '@tabler/icons-react'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  projects?: Array<{
    id: number
    name: string
  }>
}

interface Team {
  id: number
  name: string
  description?: string
  plan: string
  created_at: string
}

interface AllUser {
  id: number
  name: string
  email: string
  team_id?: number
}

interface TeamMembersProps {
  team: Team
  members: User[]
  availableUsers: AllUser[]
  can: {
    manage_members: boolean
    add_members: boolean
    remove_members: boolean
  }
}

export default function TeamMembers({ team, members, availableUsers, can }: TeamMembersProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleAddMember = async () => {
    if (!selectedUserId) return

    setIsProcessing(true)
    try {
      router.post(route('dashboard.teams.add-member', team.id), {
        user_id: selectedUserId
      }, {
        onSuccess: () => {
          setIsAddDialogOpen(false)
          setSelectedUserId('')
        },
        onFinish: () => setIsProcessing(false)
      })
    } catch (error) {
      setIsProcessing(false)
    }
  }

  const handleRemoveMember = (userId: number, userName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${userName} dari tim ini?`)) {
      router.delete(route('dashboard.teams.remove-member', [team.id, userId]))
    }
  }

  // Filter users yang belum menjadi anggota tim
  const usersNotInTeam = availableUsers.filter(user =>
    !members.some(member => member.id === user.id) && !user.team_id
  )

  // Filter members berdasarkan search
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'pro': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'basic': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise': return <IconCrown className="h-4 w-4" />
      case 'pro': return <IconStar className="h-4 w-4" />
      default: return <IconShield className="h-4 w-4" />
    }
  }

  return (
    <AuthenticatedLayout title={`Anggota Tim: ${team.name}`}>
      <Head title={`Anggota - ${team.name}`} />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={route('dashboard.teams.show', team.id)}>
              <Button variant="ghost" size="sm">
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Tim
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Anggota Tim</h1>
              <p className="text-muted-foreground">Kelola anggota untuk tim {team.name}</p>
            </div>
          </div>

          {can.add_members && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <IconUserPlus className="h-4 w-4 mr-2" />
                  Tambah Anggota
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Anggota Baru</DialogTitle>
                  <DialogDescription>
                    Pilih pengguna untuk ditambahkan ke tim {team.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="user-select">Pilih Pengguna</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pengguna..." />
                      </SelectTrigger>
                      <SelectContent>
                        {usersNotInTeam.length === 0 ? (
                          <SelectItem value="" disabled>
                            Tidak ada pengguna yang tersedia
                          </SelectItem>
                        ) : (
                          usersNotInTeam.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isProcessing}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleAddMember}
                    disabled={!selectedUserId || isProcessing}
                  >
                    {isProcessing ? 'Menambahkan...' : 'Tambah ke Tim'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Team Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                    {team.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{team.name}</CardTitle>
                  <CardDescription>{team.description || 'Tim pengembangan'}</CardDescription>
                </div>
              </div>
              <Badge className={getPlanColor(team.plan)} variant="outline">
                {getPlanIcon(team.plan)}
                <span className="ml-1">{team.plan}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{members.length}</div>
                <div className="text-sm text-muted-foreground">Total Anggota</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {members.filter(m => m.role === 'admin').length}
                </div>
                <div className="text-sm text-muted-foreground">Admin</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Date(team.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'short'
                  })}
                </div>
                <div className="text-sm text-muted-foreground">Dibuat</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <IconSearch className="h-5 w-5" />
              <span>Cari Anggota</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Anggota</CardTitle>
                <CardDescription>
                  {filteredMembers.length} dari {members.length} anggota
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <IconUsers className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Tidak ada anggota ditemukan' : 'Belum ada anggota'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? 'Coba ubah kata kunci pencarian Anda'
                    : 'Tambahkan anggota pertama untuk tim ini'
                  }
                </p>
                {can.add_members && !searchTerm && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <IconUserPlus className="mr-2 h-4 w-4" />
                    Tambah Anggota Pertama
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                        {member.projects && member.projects.length > 0 && (
                          <div className="flex items-center mt-1">
                            <IconBriefcase className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {member.projects.length} proyek
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role === 'admin' ? (
                          <>
                            <IconCrown className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <IconUsers className="h-3 w-3 mr-1" />
                            Anggota
                          </>
                        )}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <IconDots className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={route('dashboard.users.show', member.id)}>
                              <IconEye className="mr-2 h-4 w-4" />
                              Lihat Profil
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <IconMail className="mr-2 h-4 w-4" />
                            Kirim Email
                          </DropdownMenuItem>
                          {can.remove_members && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleRemoveMember(member.id, member.name)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <IconUserMinus className="mr-2 h-4 w-4" />
                                Hapus dari Tim
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
