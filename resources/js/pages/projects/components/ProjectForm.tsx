import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';

interface User {
  id: number;
  name: string;
  email: string;
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
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  project?: Project | null;
  onClose: () => void;
}

export function ProjectForm({ open, onOpenChange, users, project, onClose }: Props) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    description: '',
    status: 'planning' as 'planning' | 'in_progress' | 'completed' | 'on_hold',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    start_date: '',
    due_date: '',
    user_id: '',
    opd_owner: '',
    assigned_users: [] as number[],
  });

  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setData({
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        start_date: project.start_date || '',
        due_date: project.due_date || '',
        user_id: project.user.id.toString(),
        opd_owner: project.opd_owner || '',
        assigned_users: project.assigned_users?.map(user => user.id) || [],
      });
    } else {
      setData({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        start_date: '',
        due_date: '',
        user_id: '',
        opd_owner: '',
        assigned_users: [],
      });
    }
  }, [project, setData]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const onSuccess = () => {
      reset();
      onClose();
    };

    if (project) {
      put(route('dashboard.projects.update', project.id), { onSuccess });
    } else {
      post(route('dashboard.projects.store'), { onSuccess });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      onClose();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {project
              ? 'Update the project details below.'
              : 'Fill in the details to create a new project.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Enter project name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Enter project description"
                rows={2}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Status, Priority, and OPD Owner in one row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={data.status}
                  onValueChange={(value: 'planning' | 'in_progress' | 'completed' | 'on_hold') => setData('status', value)}
                >
                  <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={data.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setData('priority', value)}
                >
                  <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-sm text-red-500">{errors.priority}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="opd_owner">OPD Owner</Label>
                <Input
                  id="opd_owner"
                  value={data.opd_owner}
                  onChange={(e) => setData('opd_owner', e.target.value)}
                  placeholder="OPD name"
                  className={errors.opd_owner ? 'border-red-500' : ''}
                />
                {errors.opd_owner && (
                  <p className="text-sm text-red-500">{errors.opd_owner}</p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={data.start_date}
                  onChange={(e) => setData('start_date', e.target.value)}
                  className={errors.start_date ? 'border-red-500' : ''}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500">{errors.start_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={data.due_date}
                  onChange={(e) => setData('due_date', e.target.value)}
                  className={errors.due_date ? 'border-red-500' : ''}
                />
                {errors.due_date && (
                  <p className="text-sm text-red-500">{errors.due_date}</p>
                )}
              </div>
            </div>

            {/* Project Manager */}
            <div className="space-y-2">
              <Label htmlFor="user_id">Project Manager *</Label>
              <Select
                value={data.user_id.toString()}
                onValueChange={(value) => setData('user_id', value)}
              >
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
                <p className="text-sm text-red-500">{errors.user_id}</p>
              )}
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <Label htmlFor="assigned_users">Team Members</Label>
              <MultiSelect
                users={users}
                selectedUsers={data.assigned_users}
                onSelectionChange={(selectedIds) => setData('assigned_users', selectedIds)}
                placeholder="Select team members..."
                className={errors.assigned_users ? 'border-red-500' : ''}
              />
              {errors.assigned_users && (
                <p className="text-sm text-red-500">{errors.assigned_users}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {processing
                ? (project ? 'Updating...' : 'Creating...')
                : (project ? 'Update Project' : 'Create Project')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
