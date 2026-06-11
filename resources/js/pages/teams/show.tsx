import { Head, Link, router } from '@inertiajs/react'
import { AuthenticatedLayout } from '@/layouts/authenticated-layout'
import { Button } from '@/components/ui/button'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
  IconUsers,
  IconFolder,
  IconEdit,
  IconTrash,
  IconArrowLeft,
  IconSettings,
  IconUserPlus,
  IconCalendar,
  IconShield,
  IconCrown,
  IconStar,
  IconBriefcase,
  IconCheck,
  IconX,
  IconDots,
  IconEye,
  IconExternalLink,
  IconMail
} from '@tabler/icons-react'

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface Project {
  id: number
  name: string
  tasks_count: number
  status: string
  priority: string
}

interface Team {
  id: number
  name: string
  description?: string
  plan: string
  is_active: boolean
  created_at: string
}

interface TeamShowProps {
  team: Team
  members: User[]
  projects: Project[]
  can: {
    update_team: boolean
    delete_team: boolean
    manage_members: boolean
  }
}

export default function TeamShow({ team, members, projects, can }: TeamShowProps) {
  const handleDeleteTeam = () => {
    router.delete(route('dashboard.teams.destroy', team.id))
  }

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise': return <IconCrown className="h-4 w-4" />
      case 'pro': return <IconStar className="h-4 w-4" />
      case 'basic': return <IconShield className="h-4 w-4" />
      default: return <IconShield className="h-4 w-4" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'pro': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'basic': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'planning': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'on_hold': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <AuthenticatedLayout title={`Tim: ${team.name}`}>
      <Head title={team.name} />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={route('dashboard.teams.index')}>
              <Button variant="ghost" size="sm">
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Tim
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
              <p className="text-muted-foreground">
                {team.description || 'Ringkasan dan manajemen tim'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {can.manage_members && (
              <Link href={route('dashboard.teams.members', team.id)}>
                <Button variant="outline" size="sm">
                  <IconUsers className="h-4 w-4 mr-2" />
                  Kelola Anggota
                </Button>
              </Link>
            )}
            {can.update_team && (
              <Link href={route('dashboard.teams.edit', team.id)}>
                <Button variant="outline" size="sm">
                  <IconEdit className="h-4 w-4 mr-2" />
                  Edit Tim
                </Button>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <IconDots className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={route('dashboard.teams.edit', team.id)}>
                    <IconSettings className="mr-2 h-4 w-4" />
                    Pengaturan Tim
                  </Link>
                </DropdownMenuItem>
                {can.manage_members && (
                  <DropdownMenuItem asChild>
                    <Link href={route('dashboard.teams.members', team.id)}>
                      <IconUserPlus className="mr-2 h-4 w-4" />
                      Tambah Anggota
                    </Link>
                  </DropdownMenuItem>
                )}
                {can.delete_team && (
                  <>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <IconTrash className="mr-2 h-4 w-4" />
                          Hapus Tim
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Tim akan dihapus secara permanen
                            beserta semua data yang terkait.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteTeam}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Hapus Tim
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Informasi Tim</CardTitle>
              <div className="rounded-full bg-blue-100 p-2">
                <IconUsers className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Paket</span>
                  <Badge className={getPlanColor(team.plan)} variant="outline">
                    {getPlanIcon(team.plan)}
                    <span className="ml-1">{team.plan}</span>
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={team.is_active ? "default" : "destructive"}>
                    {team.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dibuat</span>
                  <span className="text-sm">
                    {new Date(team.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anggota Tim</CardTitle>
              <div className="rounded-full bg-green-100 p-2">
                <IconUsers className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">
                Total anggota aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proyek Aktif</CardTitle>
              <div className="rounded-full bg-orange-100 p-2">
                <IconFolder className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">
                Proyek yang sedang berjalan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Anggota Tim</CardTitle>
                <CardDescription>
                  Daftar semua anggota dalam tim ini
                </CardDescription>
              </div>
              {can.manage_members && (
                <Button asChild size="sm">
                  <Link href={route('dashboard.teams.members', team.id)}>
                    <IconUserPlus className="h-4 w-4 mr-2" />
                    Tambah Anggota
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-8">
                <IconUsers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada anggota</h3>
                <p className="text-muted-foreground mb-4">
                  Tim ini belum memiliki anggota. Tambahkan anggota untuk memulai kolaborasi.
                </p>
                {can.manage_members && (
                  <Button asChild>
                    <Link href={route('dashboard.teams.members', team.id)}>
                      <IconUserPlus className="mr-2 h-4 w-4" />
                      Tambah Anggota Pertama
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {members.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {member.role === 'admin' ? 'Admin' : 'Anggota'}
                      </Badge>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <IconMail className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Kirim email ke {member.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}

                {members.length > 5 && (
                  <div className="text-center pt-4">
                    <Button asChild variant="outline">
                      <Link href={route('dashboard.teams.members', team.id)}>
                        Lihat Semua Anggota ({members.length})
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Proyek Tim</CardTitle>
                <CardDescription>
                  Proyek yang sedang dikerjakan oleh tim ini
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href={route('dashboard.projects.create', { team: team.id })}>
                  <IconBriefcase className="h-4 w-4 mr-2" />
                  Buat Proyek
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <IconFolder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada proyek</h3>
                <p className="text-muted-foreground mb-4">
                  Tim ini belum memiliki proyek. Buat proyek pertama untuk tim ini.
                </p>
                <Button asChild>
                  <Link href={route('dashboard.projects.create', { team: team.id })}>
                    <IconBriefcase className="mr-2 h-4 w-4" />
                    Buat Proyek Pertama
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{project.name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(project.status)} variant="outline">
                          {project.status}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)} variant="outline">
                          {project.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {project.tasks_count} tugas
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={route('dashboard.projects.show', project.id)}>
                        <IconEye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}

                {projects.length > 5 && (
                  <div className="text-center pt-4">
                    <Button asChild variant="outline">
                      <Link href={route('dashboard.projects.index', { team: team.id })}>
                        Lihat Semua Proyek ({projects.length})
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
