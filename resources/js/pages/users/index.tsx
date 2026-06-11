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
import {
  IconPlus,
  IconUsers,
  IconShield,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconCalendar,
  IconMail,
  IconActivity,
  IconTrendingUp,
  IconUserCheck,
  IconSearch,
  IconFilter,
  IconCrown,
  IconStar,
  IconAlertCircle
} from '@tabler/icons-react'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  teams?: Array<{
    id: number
    name: string
    pivot?: {
      role: string
      is_primary: boolean
    }
  }>
  created_at: string
  is_active?: boolean
}

interface Team {
  id: number
  name: string
}

interface UsersIndexProps {
  users: {
    data: User[]
    links: any[]
    meta: any
  }
  teams: Team[]
  filters: {
    search?: string
    team?: string
    role?: string
  }
  can: {
    create_user: boolean
    manage_users: boolean
  }
}

export default function UsersIndex({ users, teams, filters, can }: UsersIndexProps) {
  const [search, setSearch] = useState(filters.search || '')
  const [selectedTeam, setSelectedTeam] = useState(filters.team || '')
  const [selectedRole, setSelectedRole] = useState(filters.role || '')

  const handleFilter = () => {
    router.get(route('dashboard.users.index'), {
      search: search || undefined,
      team: selectedTeam || undefined,
      role: selectedRole || undefined,
    }, {
      preserveState: true,
      replace: true,
    })
  }

  const handleDeleteUser = (userId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      router.delete(route('dashboard.users.destroy', userId))
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'user': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return <IconCrown className="h-3 w-3" />
      case 'user': return <IconUserCheck className="h-3 w-3" />
      default: return <IconUsers className="h-3 w-3" />
    }
  }

  return (
    <AuthenticatedLayout title="Manajemen Pengguna">
      <Head title="Pengguna" />

      <div className="space-y-6 p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pengguna</h1>
            <p className="text-muted-foreground">
              Kelola pengguna dan hak akses di organisasi Anda
            </p>
          </div>
          {can.create_user && (
            <Button asChild size="lg" className="shadow-md">
              <Link href={route('dashboard.users.create')}>
                <IconPlus className="mr-2 h-4 w-4" />
                Tambah Pengguna
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pengguna</p>
                  <p className="text-2xl font-bold">{users.meta?.total || users.data.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <IconUsers className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admin</p>
                  <p className="text-2xl font-bold">
                    {users.data.filter(user => user.role === 'admin').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <IconShield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pengguna Aktif</p>
                  <p className="text-2xl font-bold">
                    {users.data.filter(user => user.is_active !== false).length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <IconActivity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tim</p>
                  <p className="text-2xl font-bold">{teams.length}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <IconTrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <IconFilter className="h-5 w-5" />
              <span>Pencarian & Filter</span>
            </CardTitle>
            <CardDescription>
              Cari pengguna berdasarkan nama, email, tim, atau peran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari pengguna (nama atau email)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedTeam || '__all_teams'} onValueChange={(val) => setSelectedTeam(val === '__all_teams' ? '' : val)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Saring berdasarkan tim" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all_teams">Semua Tim</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRole || '__all_roles'} onValueChange={(val) => setSelectedRole(val === '__all_roles' ? '' : val)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Saring berdasarkan peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all_roles">Semua Peran</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">Pengguna</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleFilter} className="w-full sm:w-auto">
                <IconFilter className="mr-2 h-4 w-4" />
                Terapkan Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        {users.data.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <IconUsers className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pengguna</h3>
              <p className="text-muted-foreground mb-4">
                {search || selectedTeam || selectedRole
                  ? 'Coba ubah kriteria pencarian Anda'
                  : 'Mulai dengan menambahkan pengguna pertama'}
              </p>
              {can.create_user && !(search || selectedTeam || selectedRole) && (
                <Button asChild>
                  <Link href={route('dashboard.users.create')}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Tambah Pengguna
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.data.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg leading-tight truncate">
                          <Link
                            href={route('dashboard.users.show', user.id)}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {user.name}
                          </Link>
                        </CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <IconMail className="h-3 w-3 mr-1" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <IconDots className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={route('dashboard.users.show', user.id)}>
                            <IconEye className="mr-2 h-4 w-4" />
                            Lihat Profil
                          </Link>
                        </DropdownMenuItem>
                        {can.manage_users && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={route('dashboard.users.edit', user.id)}>
                                <IconEdit className="mr-2 h-4 w-4" />
                                Edit Pengguna
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              Hapus Pengguna
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Role Badge */}
                    <div className="flex items-center justify-between">
                      <Badge className={getRoleColor(user.role)} variant="outline">
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </Badge>
                      {user.is_active !== false && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <IconUserCheck className="h-3 w-3 mr-1" />
                          Aktif
                        </Badge>
                      )}
                    </div>

                    {/* Teams */}
                    {user.teams && user.teams.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Tim:</p>
                        <div className="flex flex-wrap gap-1">
                          {user.teams.slice(0, 2).map((team) => (
                            <TooltipProvider key={team.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="text-xs">
                                    <IconUsers className="h-3 w-3 mr-1" />
                                    {team.name}
                                    {team.pivot?.is_primary && (
                                      <IconStar className="h-3 w-3 ml-1 text-yellow-600" />
                                    )}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{team.name} {team.pivot?.is_primary && '(Utama)'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                          {user.teams.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.teams.length - 2} lainnya
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <IconAlertCircle className="h-3 w-3 mr-1" />
                        Belum ada tim
                      </div>
                    )}

                    {/* Joined Date */}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <IconCalendar className="h-3 w-3 mr-1" />
                      <span>Bergabung {new Date(user.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={route('dashboard.users.show', user.id)}>
                          <IconEye className="mr-1 h-3 w-3" />
                          Lihat
                        </Link>
                      </Button>
                      {can.manage_users && (
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link href={route('dashboard.users.edit', user.id)}>
                            <IconEdit className="mr-1 h-3 w-3" />
                            Edit
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination would go here if needed */}
        {users.links && users.links.length > 3 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {users.data.length} dari {users.meta?.total || users.data.length} pengguna
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
