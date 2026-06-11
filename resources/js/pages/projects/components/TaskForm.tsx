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

interface Task {
  id: number;
  title: string;
  description: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  projectId: number;
  currentProgress: number;
  onClose: () => void;
}

export function TaskForm({ open, onOpenChange, task, projectId, currentProgress, onClose }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    title: task?.title || '',
    description: task?.description || '',
    progress: currentProgress || 0,
    image: null as File | null,
    _method: task ? 'put' : 'post',
  });

  // Update form data when task changes or modal opens
  useEffect(() => {
    if (open) {
      if (task) {
        setData({
          title: task.title,
          description: task.description,
          progress: currentProgress, // keep current project progress even when editing an old log
          image: null,
          _method: 'put',
        });
      } else {
        setData({
          title: '',
          description: '',
          progress: currentProgress || 0,
          image: null,
          _method: 'post',
        });
      }
    }
  }, [task, open, currentProgress]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const onSuccess = () => {
      reset();
      onClose();
    };

    if (task) {
      // Use POST with spoofed _method for file uploads on update
      post(route('dashboard.projects.tasks.update', [projectId, task.id]), {
        onSuccess,
        preserveScroll: true,
        preserveState: true,
        forceFormData: true,
      });
    } else {
      post(route('dashboard.projects.tasks.store', projectId), {
        onSuccess,
        preserveScroll: true,
        preserveState: true,
        forceFormData: true,
      });
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Progress Log' : 'Add Progress Log'}
          </DialogTitle>
          <DialogDescription>
            {task
              ? 'Update your progress log details below.'
              : 'Log your work and update the project progress percentage.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
          <div className="grid gap-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Pekerjaan yang dilakukan (Singkat) *</Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Contoh: Membuat desain database"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Detail Pekerjaan</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Jelaskan lebih detail apa saja yang sudah dikerjakan..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Upload Bukti Foto (Opsional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                className={errors.image ? 'border-red-500' : ''}
              />
              <p className="text-xs text-slate-500">Maksimal ukuran foto 5MB.</p>
              {errors.image && (
                <p className="text-sm text-red-500">{errors.image}</p>
              )}
            </div>

            {/* Progress Percentage */}
            <div className="space-y-2">
              <Label htmlFor="progress">Project Progress (%) *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={data.progress}
                  onChange={(e) => setData('progress', parseInt(e.target.value) || 0)}
                  className={errors.progress ? 'border-red-500' : ''}
                />
              </div>
              <p className="text-xs text-slate-500">Update persentase penyelesaian proyek ini secara keseluruhan (0-100%).</p>
              {errors.progress && (
                <p className="text-sm text-red-500">{errors.progress}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {processing
                ? (task ? 'Updating...' : 'Saving...')
                : (task ? 'Update Log' : 'Save Log')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
