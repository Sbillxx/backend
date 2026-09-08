import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flag, Calendar, CheckCircle2, Clock, CircleDot, Smartphone } from 'lucide-react';

export interface Milestone {
  id: number;
  title: string;
  description?: string | null;
  due_date?: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  progress_percentage: number;
  completed_tasks_count?: number;
  total_tasks_count?: number;
}

interface MilestonesSectionProps {
  projectId: number;
  milestones: Milestone[];
}

export function MilestonesSection({ projectId, milestones = [] }: MilestonesSectionProps) {
  // Calculate overall milestone progress
  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const overallMilestoneProgress = milestones.length > 0 
    ? Math.round((completedCount / milestones.length) * 100)
    : 0;

  return (
    <Card className="bg-white shadow-sm border rounded-xl hover:shadow-md transition-all duration-300">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              Tahapan Proyek (Milestones)
              <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                {completedCount}/{milestones.length} Selesai
              </Badge>
            </CardTitle>
            <p className="text-xs text-slate-500">Target berkala dan indikator pencapaian progres proyek</p>
          </div>
        </div>

        <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-auto text-xs font-normal">
          <Smartphone className="w-3.5 h-3.5" />
          Dikelola oleh Eksekutif di Mobile App
        </Badge>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Overall progress indicator if milestones exist */}
        {milestones.length > 0 && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>Kemajuan Tahapan Proyek</span>
              <span className="text-indigo-600 font-semibold">{overallMilestoneProgress}% Selesai</span>
            </div>
            <Progress value={overallMilestoneProgress} className="h-2 bg-slate-200" />
          </div>
        )}

        {/* Milestones List */}
        {!milestones || milestones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Flag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">Belum ada Milestone yang dibuat</p>
            <p className="text-xs text-slate-400 mt-1">Eksekutif akan menambahkan tahapan proyek dari aplikasi mobile</p>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((m, index) => {
              const isCompleted = m.status === 'completed';
              const isInProgress = m.status === 'in_progress';

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isInProgress
                      ? 'bg-indigo-50/40 border-indigo-200'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : isInProgress ? (
                          <Clock className="w-5 h-5 text-indigo-600 animate-pulse" />
                        ) : (
                          <CircleDot className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">#Fase {index + 1}</span>
                          <h4 className="font-semibold text-slate-800 text-sm sm:text-base">{m.title}</h4>
                        </div>
                        {m.description && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{m.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                          {m.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Target: {m.due_date}
                            </span>
                          )}
                          {m.total_tasks_count !== undefined && m.total_tasks_count > 0 && (
                            <span className="text-slate-600 font-medium">
                              • {m.completed_tasks_count}/{m.total_tasks_count} Task Selesai
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {isCompleted && (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 px-2.5 py-1 text-xs">
                          🟢 Selesai
                        </Badge>
                      )}
                      {isInProgress && (
                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200 px-2.5 py-1 text-xs">
                          🔵 Dalam Proses
                        </Badge>
                      )}
                      {!isCompleted && !isInProgress && (
                        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 px-2.5 py-1 text-xs">
                          ⚪ Belum Dimulai
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Individual Milestone Task Progress Bar */}
                  {m.total_tasks_count !== undefined && m.total_tasks_count > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60">
                      <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
                        <span>Progress Task Tahapan Ini</span>
                        <span className="font-semibold text-slate-700">{m.progress_percentage}%</span>
                      </div>
                      <Progress value={m.progress_percentage} className="h-1.5 bg-slate-200" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
