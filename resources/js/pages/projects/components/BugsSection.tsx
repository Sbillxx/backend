import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { router } from '@inertiajs/react'
import { Bug, Plus, RotateCcw, Trash2 } from 'lucide-react'

export interface BugItem {
  id: number
  title: string
  description: string | null
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'converted' | 'closed'
  created_at: string
}

interface Props {
  projectId: number
  initialBugs: BugItem[]
}

const severityColor: Record<BugItem['severity'], string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

const statusColor: Record<BugItem['status'], string> = {
  open: 'bg-yellow-100 text-yellow-800',
  converted: 'bg-purple-100 text-purple-800',
  closed: 'bg-green-100 text-green-800',
}

export function BugsSection({ projectId, initialBugs }: Props) {
  const [bugs, setBugs] = useState<BugItem[]>(initialBugs)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<BugItem['severity']>('medium')
  const [submitting, setSubmitting] = useState(false)

  // Sync local state when initialBugs changes
  React.useEffect(() => {
    setBugs(initialBugs);
  }, [initialBugs]);

  const addBug = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)

    // Optimistic update - add new bug to local state immediately
    const newBug: BugItem = {
      id: Date.now(), // temporary ID
      title,
      description,
      severity,
      status: 'open',
      created_at: new Date().toISOString()
    };
    setBugs(prev => [newBug, ...prev]);

    // Clear form immediately for better UX
    setTitle('');
    setDescription('');
    setSeverity('medium');

    router.post(route('dashboard.projects.bugs.store', projectId), {
      title,
      description,
      severity,
    }, {
      onFinish: () => setSubmitting(false),
      preserveScroll: true,
      preserveState: true,
      // Remove onSuccess and onError to prevent scroll jump
    })
  }

  const convertToTask = (bug: BugItem) => {
    // Optimistic update - update bug status immediately
    setBugs(prev => prev.map(b =>
      b.id === bug.id ? { ...b, status: 'converted' as const } : b
    ));

    router.post(route('dashboard.projects.bugs.convert', [projectId, bug.id]), {}, {
      preserveScroll: true,
      preserveState: true,
      // Remove callbacks to prevent scroll jump
    })
  }

  const deleteBug = (bug: BugItem) => {
    // Optimistic update - remove bug from local state immediately
    setBugs(prev => prev.filter(b => b.id !== bug.id));

    router.delete(route('dashboard.projects.bugs.destroy', [projectId, bug.id]), {
      preserveScroll: true,
      preserveState: true,
      // Remove callbacks to prevent scroll jump
    })
  }

  return (
    <Card className="bg-gradient-to-br from-red-50/50 to-orange-50/30 backdrop-blur-sm border-l-4 border-l-red-400">
      <CardHeader className="pb-4">
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className="relative">
              <Bug className='h-6 w-6 text-red-600' />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-red-700 font-bold">Bug Tracker</span>
            <Badge variant='secondary' className="bg-white/80 backdrop-blur-sm font-semibold text-red-600">
              {bugs.length} {bugs.length === 1 ? 'Bug' : 'Bugs'}
            </Badge>
          </div>
          <div className="text-xs text-red-600/70 bg-white/70 px-2 py-1 rounded-md">
            {bugs.filter(b => b.status === 'open').length} Open • {bugs.filter(b => b.status === 'converted').length} Converted
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Enhanced Add bug form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-red-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-red-700">Report New Bug</span>
          </div>
          <form onSubmit={addBug} className='space-y-4'>
            {/* Title Row */}
            <div className='space-y-1.5'>
              <Label htmlFor='bugTitle' className="text-xs font-medium text-slate-600">Bug Title *</Label>
              <Input
                id='bugTitle'
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='🐛 Describe the issue briefly...'
                className="border-red-200 focus:border-red-400 focus:ring-red-200 h-10"
                required
              />
            </div>

            {/* Description Row */}
            <div className='space-y-1.5'>
              <Label htmlFor='bugDesc' className="text-xs font-medium text-slate-600">Description</Label>
              <Textarea
                id='bugDesc'
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='📝 Provide detailed information about the bug, steps to reproduce, expected vs actual behavior...'
                className="border-red-200 focus:border-red-400 focus:ring-red-200 resize-none"
              />
            </div>

            {/* Severity and Submit Row */}
            <div className='flex flex-col sm:flex-row gap-3 sm:items-end'>
              <div className='flex-1 space-y-1.5'>
                <Label className="text-xs font-medium text-slate-600">Severity Level *</Label>
                <Select value={severity} onValueChange={(v: BugItem['severity']) => setSeverity(v)}>
                  <SelectTrigger className="border-red-200 focus:border-red-400 focus:ring-red-200 h-10">
                    <SelectValue placeholder='Select severity level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='low'>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        <span>🟢 Low - Minor issue, doesn't block functionality</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='medium'>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                        <span>🟡 Medium - Moderate impact on functionality</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='high'>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-orange-400 rounded-full"></div>
                        <span>🟠 High - Significant impact, needs attention</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='critical'>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        <span>🔴 Critical - Blocks core functionality</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type='submit'
                disabled={submitting || !title.trim()}
                className='sm:w-auto w-full h-10 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed px-8'
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Reporting...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>🐛</span>
                    <span>Report Bug</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Enhanced Bugs list */}
        <div className='space-y-4'>
          {bugs.length === 0 && (
            <div className='text-center py-12 text-muted-foreground'>
              <div className="text-5xl mb-4 opacity-50">🎉</div>
              <h3 className="text-lg font-medium mb-2">No bugs reported!</h3>
              <p className="text-sm text-muted-foreground/70">Your project is running smoothly</p>
            </div>
          )}

          {/* Group bugs by status */}
          {['open', 'converted', 'closed'].map(status => {
            const statusBugs = bugs.filter(bug => bug.status === status);
            if (statusBugs.length === 0) return null;

            const statusConfig = {
              open: {
                title: 'Open Bugs',
                emoji: '🔴',
                bgClass: 'bg-red-50/50 border-red-200',
                count: statusBugs.length,
                headerClass: 'text-red-700'
              },
              converted: {
                title: 'Converted to Tasks',
                emoji: '🔄',
                bgClass: 'bg-purple-50/50 border-purple-200',
                count: statusBugs.length,
                headerClass: 'text-purple-700'
              },
              closed: {
                title: 'Resolved',
                emoji: '✅',
                bgClass: 'bg-green-50/50 border-green-200',
                count: statusBugs.length,
                headerClass: 'text-green-700'
              }
            };

            const config = statusConfig[status as keyof typeof statusConfig];

            return (
              <div key={status} className={`rounded-lg border-2 ${config.bgClass} p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{config.emoji}</span>
                  <h4 className={`font-semibold ${config.headerClass}`}>{config.title}</h4>
                  <Badge variant="outline" className="bg-white/70 text-xs">
                    {config.count}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {statusBugs.map(bug => (
                    <div key={bug.id} className='group flex items-start justify-between gap-3 rounded-lg border bg-white/80 backdrop-blur-sm p-4 hover:bg-white hover:shadow-md transition-all duration-200'>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold truncate text-slate-800 ${status === 'closed' ? 'line-through text-muted-foreground' : ''}`}>
                              {bug.title}
                            </h4>
                            <Badge className={`${severityColor[bug.severity]} border-none font-medium text-xs`}>
                              {bug.severity === 'critical' && '🔥'} {bug.severity}
                            </Badge>
                            <Badge className={`${statusColor[bug.status]} border-none font-medium text-xs`}>
                              {status === 'open' && '🔴'}
                              {status === 'converted' && '🔄'}
                              {status === 'closed' && '✅'}
                              {bug.status}
                            </Badge>
                          </div>
                        </div>
                        {bug.description && (
                          <p className={`text-sm text-muted-foreground mt-1 line-clamp-2 ${status === 'closed' ? 'line-through' : ''}`}>
                            {bug.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                            📅 {new Date(bug.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 shrink-0'>
                        {bug.status === 'open' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => convertToTask(bug)}
                            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition-all"
                          >
                            <RotateCcw className='h-3 w-3 mr-1' /> Convert to Task
                          </Button>
                        )}
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => deleteBug(bug)}
                          className='text-red-600 hover:bg-red-50 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
}
