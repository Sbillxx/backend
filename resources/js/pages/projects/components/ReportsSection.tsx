import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Trash2, Upload } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Report {
  id: number;
  file_name: string;
  file_url: string;
  type: string;
  description: string | null;
  user?: { name: string };
  created_at: string;
}

interface ReportsSectionProps {
  projectId: number;
  reports: Report[];
}

export function ReportsSection({ projectId, reports }: ReportsSectionProps) {
  const [showUpload, setShowUpload] = useState(false);
  
  const { data, setData, post, processing, errors, reset } = useForm<{
    file: File | null;
    description: string;
  }>({
    file: null,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('dashboard.projects.reports.store', projectId), {
      onSuccess: () => {
        setShowUpload(false);
        reset();
      },
    });
  };

  const handleDelete = (reportId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      router.delete(route('dashboard.projects.reports.destroy', [projectId, reportId]));
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          Dokumen Laporan
          <Badge variant="secondary">{reports.length}</Badge>
        </CardTitle>
        <Button onClick={() => setShowUpload(true)} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Upload Laporan
        </Button>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-3 opacity-50">📄</div>
            <p className="text-sm">Belum ada laporan yang diunggah.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-start justify-between p-4 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex gap-3">
                  <div className="p-2 bg-slate-200 rounded shrink-0">
                    <FileText className="h-6 w-6 text-slate-700" />
                  </div>
                  <div>
                    <a href={report.file_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline line-clamp-1" title={report.file_name}>
                      {report.file_name}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      Diunggah oleh: {report.user?.name || 'Unknown'} <br/>
                      {new Date(report.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    {report.description && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{report.description}</p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8 shrink-0" onClick={() => handleDelete(report.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Dokumen Laporan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">File (PDF, DOC, DOCX, Image, max 10MB)</Label>
              <Input
                id="file"
                type="file"
                onChange={e => setData('file', e.target.files?.[0] || null)}
                className={errors.file ? 'border-red-500' : ''}
              />
              {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Singkat</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={e => setData('description', e.target.value)}
                placeholder="Deskripsi mengenai laporan ini (opsional)"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>Batal</Button>
              <Button type="submit" disabled={processing} className="gap-2">
                <Upload className="h-4 w-4" /> {processing ? 'Mengunggah...' : 'Unggah Laporan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
