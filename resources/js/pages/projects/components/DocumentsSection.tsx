import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Trash2, Upload, Info, Download } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Document {
  id: number;
  name: string;
  url: string;
  type?: string | null;
  user?: { name: string };
  created_at?: string;
}

interface DocumentsSectionProps {
  projectId: number;
  documents: Document[];
  canEdit?: boolean;
}

export function DocumentsSection({ projectId, documents = [], canEdit = true }: DocumentsSectionProps) {
  const [showUpload, setShowUpload] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm<{
    document_files: File[];
  }>({
    document_files: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('dashboard.projects.documents.store', projectId), {
      onSuccess: () => {
        setShowUpload(false);
        reset();
      },
    });
  };

  const handleDelete = (documentId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      router.delete(route('dashboard.projects.documents.destroy', [projectId, documentId]));
    }
  };

  return (
    <Card className="bg-white shadow-sm border rounded-xl hover:shadow-md transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              Dokumen Pekerjaan (Project Charter)
              <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                {documents ? documents.length : 0} Dokumen
              </Badge>
            </CardTitle>
            <p className="text-xs text-slate-500">Dokumen resmi pendelegasian dan lampiran proyek</p>
          </div>
        </div>
        {canEdit && (
          <Button onClick={() => setShowUpload(true)} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" /> Upload Dokumen
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {(!documents || documents.length === 0) ? (
          <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">Belum ada dokumen proyek yang diunggah</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/80 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 text-sm truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    <span className="text-xs text-slate-500">Dokumen resmi proyek</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <a href={doc.url} target="_blank" rel="noreferrer" download>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                      <Download className="w-3.5 h-3.5" /> Unduh
                    </Button>
                  </a>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Dokumen Pekerjaan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">File (PDF, DOC, DOCX, XLS, XLSX, Gambar, max 10MB)</Label>
              <Input
                id="file"
                type="file"
                multiple
                onChange={e => setData('document_files', Array.from(e.target.files || []))}
                className={errors.document_files ? 'border-red-500' : ''}
              />
              {errors.document_files && <p className="text-sm text-red-500">{errors.document_files}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>Batal</Button>
              <Button type="submit" disabled={processing} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Upload className="h-4 w-4" /> {processing ? 'Mengunggah...' : 'Unggah Dokumen'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
