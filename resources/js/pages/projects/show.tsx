import React, { useState } from 'react';
import { AuthenticatedLayout } from '@/layouts';
import { Main } from '@/components/layout/main';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  Info,
  Pencil,
  User as UserIcon,
  Share2,
  BarChart3,
  Zap,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { TaskForm } from './components/TaskForm';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ReportsSection } from './components/ReportsSection';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string | null;
  due_date: string | null;
  user: User;
  assigned_users?: User[];
  opd_owner?: string;
  tasks: Task[];
  reports?: any[];
  progress: number;
  created_at: string;
}

interface Props {
  project: Project;
  users: User[];
}

export default function ProjectShow({ project, users }: Props) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = (task: Task) => {
    setDeletingTask(task);
  };

  const confirmDeleteTask = () => {
    if (deletingTask) {
      router.delete(route('dashboard.projects.tasks.destroy', [project.id, deletingTask.id]), {
        onSuccess: () => setDeletingTask(null),
        preserveScroll: true,
      });
    }
  };

  return (
    <AuthenticatedLayout title={`Project: ${project.name}`}>
      <Main>
        <div className='space-y-6'>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.visit(route('dashboard.projects.index'))}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
            </div>
            <Button onClick={() => setShowTaskForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Progress Log
            </Button>
          </div>

          {/* Enhanced Project Overview */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Project Details Card */}
            <Card className="bg-white shadow-sm border rounded-xl hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-800">Project Details</CardTitle>
                    <p className="text-xs text-slate-500">Essential information</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <Pencil className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                {/* Project Manager */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Project Manager</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-100/80 rounded-xl border border-slate-100">
                    <Avatar className="h-10 w-10 bg-blue-600 text-white">
                      <AvatarFallback className="bg-blue-600 text-white font-semibold">
                        {project.user?.name ? project.user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'PM'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-slate-800 truncate">{project.user?.name || 'Unassigned'}</span>
                      <span className="text-xs text-slate-500 truncate">{project.user?.email || ''}</span>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Team Members ({project.assigned_users?.length || 0})</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {project.assigned_users && project.assigned_users.length > 0 ? project.assigned_users.map(user => (
                      <div key={user.id} className="flex items-center gap-2 p-2 pr-4 bg-orange-50 rounded-full border border-orange-100">
                        <Avatar className="h-8 w-8 bg-orange-600 text-white">
                          <AvatarFallback className="bg-orange-600 text-white text-xs font-medium">
                            {user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{user.name}</span>
                      </div>
                    )) : (
                      <span className="text-sm text-slate-500">No team members assigned</span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      Created on {new Date(project.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Overview Card */}
            <Card className="bg-white shadow-sm border rounded-xl hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-800">Progress Overview</CardTitle>
                    <p className="text-xs text-slate-500">Manual project progress</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 text-sm font-semibold flex items-center gap-1 rounded-md">
                  <Zap className="w-3 h-3 fill-current" />
                  {project.progress || 0}% Overall
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="flex flex-col gap-4 p-6 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-800">Project Completion</h4>
                    <span className="text-sm font-bold text-emerald-600">{project.progress || 0}%</span>
                  </div>
                  <Progress value={project.progress || 0} className="h-4 bg-slate-200 [&>div]:bg-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Logs */}
          <div className='space-y-6'>
            <div className="flex flex-col md:flex-row md:items-center justify-between mt-8 mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
                <h2 className="text-xl font-semibold text-slate-800">Progress Logs</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full whitespace-nowrap">
                <div className="h-5 w-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-semibold text-slate-600">
                  {project.tasks?.length || 0}
                </div>
                Total Logs
              </div>
            </div>

            <div className="grid gap-4">
              {!project.tasks || project.tasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                  <p className="text-sm">No progress logs yet.</p>
                </div>
              ) : (
                [...project.tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(task => (
                  <Card key={task.id} className="group bg-white hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <h4 className="font-semibold text-slate-800 text-lg">{task.title}</h4>
                          <p className="text-slate-600 text-sm whitespace-pre-wrap">{task.description}</p>
                          {task.image_url && (
                            <div className="mt-3">
                              <img src={task.image_url} alt="Progress Proof" className="rounded-lg border border-slate-200 max-h-48 object-cover" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                            <Clock className="w-3 h-3" />
                            <span>Logged on {new Date(task.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task)} className="h-8 w-8 text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Reports Section */}
          <ReportsSection projectId={project.id} reports={project.reports || []} />
        </div>

        {/* Task Form (Progress Log Form) */}
        <TaskForm
          open={showTaskForm}
          onOpenChange={setShowTaskForm}
          task={editingTask}
          projectId={project.id}
          currentProgress={project.progress || 0}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />

        {/* Delete Task Confirmation */}
        <DeleteConfirmDialog
          open={!!deletingTask}
          onOpenChange={() => setDeletingTask(null)}
          onConfirm={confirmDeleteTask}
          title="Delete Progress Log"
          description={`Are you sure you want to delete this log? This action cannot be undone.`}
        />
      </Main>
    </AuthenticatedLayout>
  );
}
