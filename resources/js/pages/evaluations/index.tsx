import { AuthenticatedLayout } from '@/layouts/authenticated-layout'
import { Main } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { IconStarFilled, IconStar } from '@tabler/icons-react'
import { format } from 'date-fns'

interface Evaluation {
  id: number
  anggota: {
    id: number
    nama: string
    jabatan: string
    foto: string
    divisi: string
  }
  rating: number
  note: string
  date: string
  created_at: string
}

interface Props {
  evaluations: Evaluation[]
}

export default function EvaluationsPage({ evaluations }: Props) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => {
      if (index < rating) {
        return <IconStarFilled key={index} className="w-5 h-5 text-amber-400" />
      }
      return <IconStar key={index} className="w-5 h-5 text-slate-200" />
    })
  }

  return (
    <AuthenticatedLayout title="Evaluasi Kinerja">
      <Main>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Evaluasi Kinerja</h1>
            <p className="text-muted-foreground mt-1">
              Rekapitulasi penilaian dan catatan feedback untuk staf dan anggota tim.
            </p>
          </div>
        </div>

        {evaluations.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
              <IconStar className="h-10 w-10 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Belum Ada Evaluasi</h2>
            <p className="mb-6 text-muted-foreground max-w-[400px]">
              Saat ini belum ada feedback atau evaluasi kinerja yang diberikan kepada staf.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {evaluations.map((evalData) => (
              <Card key={evalData.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="bg-slate-50/50 pb-4 border-b">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={evalData.anggota.foto} alt={evalData.anggota.nama} />
                      <AvatarFallback>{evalData.anggota.nama.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-base">{evalData.anggota.nama}</span>
                      <span className="text-xs text-muted-foreground">{evalData.anggota.jabatan} &bull; {evalData.anggota.divisi}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 flex-grow flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="flex mr-3">{renderStars(evalData.rating)}</div>
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {evalData.rating}/5
                    </span>
                  </div>
                  
                  <div className="flex-grow">
                    <p className="text-sm text-slate-700 leading-relaxed italic">
                      "{evalData.note}"
                    </p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span>Evaluasi untuk: <strong>{evalData.date}</strong></span>
                    <span>{evalData.created_at}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>
    </AuthenticatedLayout>
  )
}
