import { Head, Link } from '@inertiajs/react'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  IconArrowLeft,
  IconEdit,
  IconUser,
  IconMail,
  IconShield,
  IconUsers,
  IconCalendar,
  IconBriefcase,
  IconActivity,
  IconCheck,
  IconX,
  IconCrown,
  IconUserCheck,
  IconStar,
  IconFolder,
  IconClock,
  IconTarget,
  IconAlertTriangle,
  IconMapPin
} from '@tabler/icons-react'

interface User {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  teams?: Array<{
    id: number
    name: string
    pivot?: {
      role: string
      is_primary: boolean
    }
  }>
  projects?: Array<{
    id: number
    name: string
    status: string
    priority: string
    tasks_count: number
  }>
}

interface UserShowProps {
  user: User
  can: {
    update_user: boolean
    delete_user: boolean
  }
}

export default function UserShow({ user, can }: UserShowProps) {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'user': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return <IconCrown className="h-4 w-4" />
      case 'user': return <IconUserCheck className="h-4 w-4" />
      default: return <IconUser className="h-4 w-4" />
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
    <AuthenticatedLayout title={`User: ${user.name}`}>
      <Head title={user.name} />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={route('dashboard.users.index')}>
              <Button variant="ghost" size="sm">
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <p className="text-muted-foreground">
                User profile and activity overview
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {can.update_user && (
              <Link href={route('dashboard.users.edit', user.id)}>
                <Button variant="outline" size="sm">
                  <IconEdit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* User Profile Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription className="flex items-center mt-2 text-base">
                    <IconMail className="h-4 w-4 mr-2" />
                    {user.email}
                  </CardDescription>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <IconCalendar className="h-4 w-4 mr-1" />
                      Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getRoleColor(user.role)} variant="outline">
                  {getRoleIcon(user.role)}
                  <span className="ml-1">{user.role}</span>
                </Badge>
                <Badge variant={user.is_active ? "default" : "secondary"}>
                  {user.is_active ? (
                    <>
                      <IconCheck className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <IconX className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teams</p>
                  <p className="text-2xl font-bold">{user.teams?.length || 0}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Projects</p>
                  <p className="text-2xl font-bold">{user.projects?.length || 0}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <IconFolder className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">
                    {user.projects?.reduce((total, project) => total + project.tasks_count, 0) || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <IconBriefcase className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                  <p className="text-lg font-bold text-green-600">
                    {user.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <IconActivity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teams */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <IconUsers className="h-5 w-5" />
                    <span>Team Memberships</span>
                  </CardTitle>
                  <CardDescription>Teams this user belongs to</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {user.teams && user.teams.length > 0 ? (
                <div className="space-y-3">
                  {user.teams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {team.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{team.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {team.pivot?.role && (
                              <Badge variant="outline" className="text-xs">
                                {team.pivot.role}
                              </Badge>
                            )}
                            {team.pivot?.is_primary && (
                              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                <IconStar className="h-3 w-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={route('dashboard.teams.show', team.id)}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <IconArrowLeft className="h-3 w-3 rotate-180" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View team</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <IconUsers className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No team memberships</h3>
                  <p className="text-muted-foreground">
                    This user is not assigned to any teams yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <IconFolder className="h-5 w-5" />
                    <span>Projects</span>
                  </CardTitle>
                  <CardDescription>Projects assigned to this user</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {user.projects && user.projects.length > 0 ? (
                <div className="space-y-3">
                  {user.projects.slice(0, 5).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Link
                            href={route('dashboard.projects.show', project.id)}
                            className="font-medium text-sm hover:text-blue-600 transition-colors"
                          >
                            {project.name}
                          </Link>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={route('dashboard.projects.show', project.id)}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <IconArrowLeft className="h-3 w-3 rotate-180" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View project</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(project.status)} variant="outline">
                            {project.status}
                          </Badge>
                          <Badge className={getPriorityColor(project.priority)} variant="outline">
                            {project.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {project.tasks_count} tasks
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {user.projects.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm">
                        View all {user.projects.length} projects
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <IconFolder className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects assigned</h3>
                  <p className="text-muted-foreground">
                    This user is not assigned to any projects yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <IconUser className="h-5 w-5" />
              <span>User Details</span>
            </CardTitle>
            <CardDescription>
              Additional information about this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-base font-medium">{user.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                  <p className="text-base">{user.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                  <div className="mt-1">
                    <Badge className={getRoleColor(user.role)} variant="outline">
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
                  <div className="mt-1">
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? (
                        <>
                          <IconCheck className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <IconX className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                  <p className="text-base">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Teams Count</Label>
                  <p className="text-base font-medium">{user.teams?.length || 0} teams</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  )
}
