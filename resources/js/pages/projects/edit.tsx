import { useState } from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import { AuthenticatedLayout } from '@/layouts/authenticated-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  IconCalendar,
  IconTarget,
  IconUsers,
  IconAlertTriangle,
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconFlag,
  IconGavel,
  IconEye
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
  description: string | null
  status: string
  priority: string
  start_date: string | null
  due_date: string | null
  user_id: number
  team_id: number
  opd_owner: string | null
  assigned_users: number[]
}

interface EditProjectProps {
  project: Project
  users: User[]
  teams: Team[]
  can_change_team: boolean
}

export default function EditProject({ project, users, teams, can_change_team }: EditProjectProps) {
  const [selectedUsers, setSelectedUsers] = useState<number[]>(project.assigned_users || [])

  const { data, setData, put, processing, errors } = useForm({
    name: project.name,
    description: project.description || '',
    status: project.status,
    priority: project.priority,
    start_date: project.start_date || '',
    due_date: project.due_date || '',
    user_id: project.user_id.toString(),
    team_id: project.team_id ? project.team_id.toString() : '',
    opd_owner: project.opd_owner || '',
    assigned_users: project.assigned_users || [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Pastikan form data sudah berisi assigned_users terbaru
    put(route('dashboard.projects.update', project.id))
  }

  const handleUserSelection = (userId: number, checked: boolean) => {
    setSelectedUsers(prev => {
      const updated = checked ? [...prev, userId] : prev.filter(id => id !== userId)
      setData('assigned_users', updated) // sinkron langsung ke form
      return updated
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <IconTarget className="h-4 w-4" />
      case 'in_progress': return <IconClock className="h-4 w-4" />
      case 'completed': return <IconCheck className="h-4 w-4" />
      case 'on_hold': return <IconAlertTriangle className="h-4 w-4" />
      default: return <IconTarget className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'planning': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'on_hold': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <AuthenticatedLayout title="Edit Project">
      <Head title={`Edit Project - ${project.name}`} />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={route('dashboard.projects.index')}>
              <Button variant="ghost" size="sm">
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
              <p className="text-muted-foreground">
                Update project information and settings
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={route('dashboard.projects.show', project.id)}>
              <Button variant="outline" size="sm">
                <IconEye className="h-4 w-4 mr-2" />
                View Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Current Project Status */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <CardDescription>
                  Project ID: #{project.id}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(data.status)}>
                  {getStatusIcon(data.status)}
                  <span className="ml-1 capitalize">{data.status.replace('_', ' ')}</span>
                </Badge>
                <Badge className={getPriorityColor(data.priority)}>
                  {data.priority.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IconTarget className="h-5 w-5" />
                    <span>Project Information</span>
                  </CardTitle>
                  <CardDescription>
                    Update basic project details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="name">Project Name *</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className={errors.name ? 'border-red-500' : ''}
                        placeholder="Enter project name"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className={errors.description ? 'border-red-500' : ''}
                        placeholder="Describe the project goals and objectives"
                        rows={4}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="opd_owner">OPD Owner</Label>
                      <Input
                        id="opd_owner"
                        value={data.opd_owner}
                        onChange={(e) => setData('opd_owner', e.target.value)}
                        placeholder="Enter OPD owner"
                      />
                    </div>

                    {can_change_team && (
                      <div>
                        <Label htmlFor="team_id">Team</Label>
                        <Select value={data.team_id} onValueChange={(value) => setData('team_id', value)}>
                          <SelectTrigger className={errors.team_id ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map((team) => (
                              <SelectItem key={team.id} value={team.id.toString()}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.team_id && (
                          <p className="text-sm text-red-500 mt-1">{errors.team_id}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Team Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IconUsers className="h-5 w-5" />
                    <span>Team Assignment</span>
                  </CardTitle>
                  <CardDescription>
                    Update project manager and team members
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="user_id">Project Manager *</Label>
                    <Select value={data.user_id} onValueChange={(value) => setData('user_id', value)}>
                      <SelectTrigger className={errors.user_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select project manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.user_id && (
                      <p className="text-sm text-red-500 mt-1">{errors.user_id}</p>
                    )}
                  </div>

                  <div>
                    <Label>Assigned Team Members</Label>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                            selectedUsers.includes(user.id)
                              ? 'bg-blue-50 border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => handleUserSelection(user.id, !!checked)}
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline & Priority */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IconCalendar className="h-5 w-5" />
                    <span>Timeline & Priority</span>
                  </CardTitle>
                  <CardDescription>
                    Update project timeline and priority level
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">
                            <div className="flex items-center space-x-2">
                              <IconTarget className="h-4 w-4" />
                              <span>Planning</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="in_progress">
                            <div className="flex items-center space-x-2">
                              <IconClock className="h-4 w-4" />
                              <span>In Progress</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center space-x-2">
                              <IconCheck className="h-4 w-4" />
                              <span>Completed</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="on_hold">
                            <div className="flex items-center space-x-2">
                              <IconAlertTriangle className="h-4 w-4" />
                              <span>On Hold</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center space-x-2">
                              <IconFlag className="h-4 w-4 text-green-600" />
                              <span>Low Priority</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center space-x-2">
                              <IconFlag className="h-4 w-4 text-yellow-600" />
                              <span>Medium Priority</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center space-x-2">
                              <IconFlag className="h-4 w-4 text-orange-600" />
                              <span>High Priority</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="urgent">
                            <div className="flex items-center space-x-2">
                              <IconFlag className="h-4 w-4 text-red-600" />
                              <span>Urgent</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={data.start_date}
                        onChange={(e) => setData('start_date', e.target.value)}
                        className={errors.start_date ? 'border-red-500' : ''}
                      />
                      {errors.start_date && (
                        <p className="text-sm text-red-500 mt-1">{errors.start_date}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={data.due_date}
                        onChange={(e) => setData('due_date', e.target.value)}
                        className={errors.due_date ? 'border-red-500' : ''}
                      />
                      {errors.due_date && (
                        <p className="text-sm text-red-500 mt-1">{errors.due_date}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Changes Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Changes Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Project Name</p>
                    <p className="font-medium">{data.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(data.status)}
                      <span className="capitalize">{data.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    <Badge className={getPriorityColor(data.priority)}>
                      {data.priority.toUpperCase()}
                    </Badge>
                  </div>

                  {selectedUsers.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Team Members ({selectedUsers.length})</p>
                      <div className="flex -space-x-2 mt-1">
                        {selectedUsers.slice(0, 5).map((userId) => {
                          const user = users.find(u => u.id === userId)
                          return (
                            <TooltipProvider key={userId}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Avatar className="h-6 w-6 border-2 border-white">
                                    <AvatarFallback className="text-xs">
                                      {user?.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{user?.name}</p>
                                </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                          )
                        })}
                        {selectedUsers.length > 5 && (
                          <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{selectedUsers.length - 5}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {data.due_date && (
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="text-sm">{new Date(data.due_date).toLocaleDateString('id-ID')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      disabled={processing}
                      className="w-full"
                    >
                      <IconGavel className="h-4 w-4 mr-2" />
                      {processing ? 'Saving Changes...' : 'Save Changes'}
                    </Button>

                    <Link href={route('dashboard.projects.show', project.id)}>
                      <Button variant="outline" className="w-full">
                        Cancel & View Project
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
