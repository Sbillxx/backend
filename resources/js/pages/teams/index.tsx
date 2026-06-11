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
  IconFolder,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconCalendar,
  IconActivity,
  IconTrendingUp,
  IconSettings,
  IconSearch,
} from '@tabler/icons-react'

interface Team {
  id: number
  name: string
  description: string
  plan: string
  users_count: number
  projects_count: number
  created_at: string
}

interface TeamsIndexProps {
  teams: Team[]
  can: {
    create_team: boolean
    manage_teams: boolean
  }
}

export default function TeamsIndex({ teams, can }: TeamsIndexProps) {
  const [search, setSearch] = useState('')

  const filteredTeams = teams.filter(
    team =>
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      team.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleDeleteTeam = (teamId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus tim ini?')) {
      router.delete(route('dashboard.teams.destroy', teamId))
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'pro':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'basic':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <AuthenticatedLayout title="Manajemen Tim">
      <Head title="Tim" />

      <div className="space-y-6 p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tim</h1>
            <p className="text-muted-foreground">
              Kelola tim dan anggotanya di seluruh organisasi Anda
            </p>
          </div>
          {can.create_team && (
            <Button asChild size="lg" className="shadow-md">
              <Link href={route('dashboard.teams.create')}>
                <IconPlus className="mr-2 h-4 w-4" />
                Buat Tim
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Tim
                  </p>
                  <p className="text-2xl font-bold">{teams.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <IconUsers className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Anggota
                  </p>
                  <p className="text-2xl font-bold">
                    {teams.reduce((sum, team) => sum + team.users_count, 0)}
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Proyek
                  </p>
                  <p className="text-2xl font-bold">
                    {teams.reduce((sum, team) => sum + team.projects_count, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <IconFolder className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Rata-rata Anggota
                  </p>
                  <p className="text-2xl font-bold">
                    {teams.length
                      ? Math.round(
                          teams.reduce((sum, team) => sum + team.users_count, 0) /
                            teams.length
                        )
                      : 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <IconTrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <IconSearch className="h-5 w-5" />
              <span>Cari Tim</span>
            </CardTitle>
            <CardDescription>
              Cari tim berdasarkan nama atau deskripsi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari tim..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Teams Grid */}
        {filteredTeams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <IconUsers className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {search ? 'Tidak ada tim ditemukan' : 'Belum ada tim'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {search
                  ? 'Coba ubah kata kunci pencarian Anda'
                  : 'Mulai dengan membuat tim pertama Anda'}
              </p>
              {can.create_team && !search && (
                <Button asChild>
                  <Link href={route('dashboard.teams.create')}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Buat Tim
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <Card
                key={team.id}
                className="hover:shadow-lg transition-shadow duration-200 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                          {team.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg leading-tight truncate">
                          <Link
                            href={route('dashboard.teams.show', team.id)}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {team.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="truncate">
                          {team.description}
                        </CardDescription>
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
                          <Link href={route('dashboard.teams.show', team.id)}>
                            <IconEye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </Link>
                        </DropdownMenuItem>
                        {can.manage_teams && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={route('dashboard.teams.edit', team.id)}>
                                <IconEdit className="mr-2 h-4 w-4" />
                                Edit Tim
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={route('dashboard.teams.members', team.id)}>
                                <IconUsers className="mr-2 h-4 w-4" />
                                Kelola Anggota
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteTeam(team.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              Hapus Tim
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Plan Badge */}
                    <div className="flex items-center justify-between">
                      <Badge className={getPlanColor(team.plan)} variant="outline">
                        {team.plan}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {new Date(team.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                        <span>{team.users_count} anggota</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <IconFolder className="h-4 w-4 text-muted-foreground" />
                        <span>{team.projects_count} proyek</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={route('dashboard.teams.show', team.id)}>
                          <IconEye className="mr-1 h-3 w-3" />
                          Lihat
                        </Link>
                      </Button>
                      {can.manage_teams && (
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link href={route('dashboard.teams.edit', team.id)}>
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
      </div>
    </AuthenticatedLayout>
  )
}
