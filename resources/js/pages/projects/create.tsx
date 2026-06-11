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
  IconFlag
} from '@tabler/icons-react'

interface User {
  id: number
  name: string
  email: string
  team_id: number
}

interface Team {
  id: number
  name: string
}

interface CreateProjectProps {
  users: User[]
  teams: Team[]
}

export default function CreateProject({ users, teams }: CreateProjectProps) {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [currentStep, setCurrentStep] = useState(1)

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    due_date: '',
    user_id: '',
    team_id: '',
    opd_owner: '',
    assigned_users: [] as string[],
  })

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    console.log('Data yang dikirim ke backend:', {
      ...data,
      assigned_users: data.assigned_users,
    })

    post(route('dashboard.projects.store'))
  }

  const handleUserToggle = (userId: number) => {
    setSelectedUsers(prev => {
      const updated = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
      setData('assigned_users', updated.map(String))
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const steps = [
    { id: 1, name: 'Project Details', icon: IconTarget },
    { id: 2, name: 'Team Assignment', icon: IconUsers },
    { id: 3, name: 'Timeline & Priority', icon: IconCalendar },
  ]

  return (
    <AuthenticatedLayout title="Create Project">
      <Head title="Create Project" />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={route('dashboard.projects.index')}>
            <Button variant="ghost" size="sm">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
            <p className="text-muted-foreground">
              Set up a new project with team members and timeline
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      Step {step.id}
                    </p>
                    <p className="text-sm text-gray-500">{step.name}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Project Details */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconTarget className="h-5 w-5" />
                      <span>Project Information</span>
                    </CardTitle>
                    <CardDescription>
                      Basic details about your project
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

                      <div>
                        <Label htmlFor="team_id">Team *</Label>
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
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Team Assignment */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconUsers className="h-5 w-5" />
                      <span>Team Assignment</span>
                    </CardTitle>
                    <CardDescription>
                      Select project manager and assign team members
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
                              onCheckedChange={() => handleUserToggle(user.id)}
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
              )}

              {/* Step 3: Timeline & Priority */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconCalendar className="h-5 w-5" />
                      <span>Timeline & Priority</span>
                    </CardTitle>
                    <CardDescription>
                      Set project timeline and priority level
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
              )}
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Project Name</p>
                  <p className="font-medium">{data.name || 'Untitled Project'}</p>
                </div>

                {data.status && (
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(data.status)}
                      <span className="capitalize">{data.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                )}

                {data.priority && (
                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    <Badge className={getPriorityColor(data.priority)}>
                      {data.priority.toUpperCase()}
                    </Badge>
                  </div>
                )}

                {selectedUsers.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Team Members</p>
                    <div className="flex -space-x-2 mt-1">
                      {selectedUsers.slice(0, 3).map((userId) => {
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
                      {selectedUsers.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{selectedUsers.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="w-full"
                    >
                      Previous Step
                    </Button>
                  )}

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="w-full"
                      disabled={
                        (currentStep === 1 && !data.name) ||
                        (currentStep === 2 && !data.user_id)
                      }
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={processing}
                      className="w-full"
                    >
                      {processing ? 'Creating...' : 'Create Project'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
