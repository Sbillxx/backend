import { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { AuthenticatedLayout } from '@/layouts/authenticated-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

export default function CreateTeam() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    plan: 'internal',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('dashboard.teams.store'))
  }

  return (
    <AuthenticatedLayout title="Buat Tim">
      <Head title="Buat Tim" />

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Tim Baru</h1>
          <p className="text-muted-foreground">
            Buat tim baru untuk mengorganisir proyek dan anggota Anda
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Tim</CardTitle>
            <CardDescription>
              Berikan informasi dasar tentang tim Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Tim</Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Masukkan nama tim..."
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Jelaskan tujuan dan peran tim ini..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Paket Tim</Label>
                <Select value={data.plan} onValueChange={(value) => setData('plan', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih paket tim..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                {errors.plan && (
                  <p className="text-sm text-red-600">{errors.plan}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Membuat...' : 'Buat Tim'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
