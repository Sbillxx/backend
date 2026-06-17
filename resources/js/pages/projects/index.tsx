import { useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { AuthenticatedLayout } from '@/layouts/authenticated-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  IconPlus,
  IconUsers,
  IconCalendar,
  IconTarget,
  IconClock,
  IconAlertTriangle,
  IconCircleCheck,
  IconEdit,
  IconTrash,
  IconEye,
  IconFilter,
  IconSearch,
  IconLayoutGrid,
  IconList
} from '@tabler/icons-react'

interface User {
  id: number
  name: string
  email: string
}

interface Team {
  id: number
  name: string
}

interface Project {
  id: number
  name: string
  description: string
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  start_date?: string
  due_date?: string
  user: User
  team: Team
  assigned_users: User[]
  opd_owner?: string
  tasks_count: number
  completed_tasks_count: number
  progress_percentage: number
  created_at: string
  can_edit: boolean
  can_delete: boolean
}

interface ProjectsIndexProps {
  projects: Project[]
  users: User[]
  teams: Team[]
  filters: {
    status?: string
    team?: string
    search?: string
  }
  user_role: string
  user_team: Team | null
  available_teams: Team[]
  can_create: boolean
  can_manage_projects: boolean
}

export default function ProjectsIndex({
  projects,
  users,
  teams,
  filters,
  user_role,
  user_team,
  available_teams,
  can_create,
  can_manage_projects
}: ProjectsIndexProps) {
  const [search, setSearch] = useState(filters.search || '')
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const page = usePage()

  const handleFilter = (customSearch?: string, customStatus?: string) => {
    const activeSearch = customSearch !== undefined ? customSearch : search;
    const activeStatus = customStatus !== undefined ? customStatus : selectedStatus;

    router.get(route('dashboard.projects.index'), {
      search: activeSearch || undefined,
      status: activeStatus && activeStatus !== 'all' ? activeStatus : undefined,
    }, {
      preserveState: true,
      replace: true,
    })
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedStatus('all')
    router.get(route('dashboard.projects.index'))
  }

  const handleDeleteProject = (projectId: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      router.delete(route('dashboard.projects.destroy', projectId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'planning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'on_hold': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100 border-red-300'
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300'
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'low': return 'text-green-700 bg-green-100 border-green-300'
      default: return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <IconCircleCheck className="h-4 w-4" />
      case 'in_progress': return <IconClock className="h-4 w-4" />
      case 'planning': return <IconTarget className="h-4 w-4" />
      case 'on_hold': return <IconAlertTriangle className="h-4 w-4" />
      default: return <IconTarget className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  // Get active team from page props
  const activeTeam = (page.props as any).active_team

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1 group-hover:text-blue-600 transition-colors">
              <Link href={route('dashboard.projects.show', project.id)} className="hover:underline">
                {project.name}
              </Link>
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {project.description || 'No description provided'}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-1 ml-4">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
              {getStatusIcon(project.status)}
              <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Priority and Team */}
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
              <IconAlertTriangle className="h-3 w-3 mr-1" />
              {project.priority.toUpperCase()}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <IconUsers className="h-4 w-4 mr-1" />
              {project.team?.name || 'No Team'}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{project.progress_percentage}%</span>
            </div>
            <Progress value={project.progress_percentage} className="h-2" />
          </div>

          {/* Due Date */}
          {project.due_date && (
            <div className={`flex items-center text-sm ${isOverdue(project.due_date) ? 'text-red-600' : 'text-gray-600'}`}>
              <IconCalendar className="h-4 w-4 mr-2" />
              <span>Due {formatDate(project.due_date)}</span>
              {isOverdue(project.due_date) && (
                <IconAlertTriangle className="h-4 w-4 ml-1 text-red-500" />
              )}
            </div>
          )}

          {/* Assigned Users */}
          {project.assigned_users.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Team:</span>
              <div className="flex -space-x-2">
                {project.assigned_users.slice(0, 3).map((user, index) => (
                  <TooltipProvider key={user.id}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Avatar className="h-6 w-6 border-2 border-white">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{user.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {project.assigned_users.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">+{project.assigned_users.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2 border-t">
            <Button variant="ghost" size="sm" asChild>
              <Link href={route('dashboard.projects.show', project.id)}>
                <IconEye className="h-4 w-4" />
              </Link>
            </Button>
            {project.can_edit && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={route('dashboard.projects.edit', project.id)}>
                  <IconEdit className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {project.can_delete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteProject(project.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <AuthenticatedLayout title="Projects">
      <Head title="Projects" />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Projects
              {activeTeam && (
                <span className="ml-2 text-lg font-medium text-muted-foreground">
                  - {activeTeam.name}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">
              {activeTeam
                ? `Menampilkan ${projects.length} proyek untuk team ${activeTeam.name}`
                : user_role === 'admin'
                  ? `Menampilkan ${projects.length} proyek`
                  : `Menampilkan ${projects.length} proyek dari teams Anda`
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <IconLayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <IconList className="h-4 w-4" />
            </Button>
            {can_create && (
              <Button asChild>
                <Link href={route('dashboard.projects.create')}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Create Project
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleFilter();
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <IconFilter className="h-4 w-4 text-gray-500" />
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => {
                    setSelectedStatus(value);
                    handleFilter(search, value);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => handleFilter()} variant="outline">
                  Apply
                </Button>
                {(search || selectedStatus !== 'all') && (
                  <Button onClick={clearFilters} variant="ghost" size="sm">
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid/List */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <IconTarget className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                {activeTeam
                  ? `No projects found in ${activeTeam.name} team.`
                  : 'Get started by creating your first project.'
                }
              </p>
              {can_create && (
                <Button asChild>
                  <Link href={route('dashboard.projects.create')}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create Project
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid'
            ? "grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-6"
          }>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
