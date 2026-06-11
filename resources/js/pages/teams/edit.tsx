import { Head, useForm, Link } from '@inertiajs/react'
import { AuthenticatedLayout } from '@/layouts/authenticated-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  IconArrowLeft,
  IconEdit,
  IconDeviceFloppy,
  IconUsers,
  IconSettings,
  IconEye,
  IconTrash,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconShield,
  IconCrown,
  IconStar
} from '@tabler/icons-react'

interface Team {
  id: number
  name: string
  description: string | null
  plan: string
  is_active: boolean
}

interface Props {
  team: Team
}

export default function EditTeam({ team }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: team.name,
    description: team.description || '',
    plan: team.plan,
    is_active: team.is_active,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(route('dashboard.teams.update', team.id))
  }

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise': return <IconCrown className="h-4 w-4" />
      case 'pro': return <IconStar className="h-4 w-4" />
      case 'basic': return <IconShield className="h-4 w-4" />
      default: return <IconShield className="h-4 w-4" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'pro': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'basic': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <AuthenticatedLayout title="Edit Tim">
      <Head title={`Edit Tim - ${team.name}`} />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={route('dashboard.teams.index')}>
              <Button variant="ghost" size="sm">
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Tim
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Tim</h1>
              <p className="text-muted-foreground">
                Perbarui informasi dan pengaturan tim
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={route('dashboard.teams.show', team.id)}>
              <Button variant="outline" size="sm">
                <IconEye className="h-4 w-4 mr-2" />
                Lihat Tim
              </Button>
            </Link>
          </div>
        </div>

        {/* Current Team Status */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                    {team.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{team.name}</CardTitle>
                  <CardDescription>ID Tim: #{team.id}</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getPlanColor(team.plan)} variant="outline">
                  {getPlanIcon(team.plan)}
                  <span className="ml-1">{team.plan}</span>
                </Badge>
                <Badge variant={team.is_active ? "default" : "secondary"}>
                  {team.is_active ? (
                    <>
                      <IconCheck className="h-3 w-3 mr-1" />
                      Aktif
                    </>
                  ) : (
                    <>
                      <IconX className="h-3 w-3 mr-1" />
                      Tidak Aktif
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Edit Form */}
        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconEdit className="h-5 w-5" />
                <span>Informasi Tim</span>
              </CardTitle>
              <CardDescription>
                Perbarui detail dasar tim Anda
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_active">Status Tim</Label>
                      <p className="text-sm text-muted-foreground">
                        Mengaktifkan atau menonaktifkan tim
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={data.is_active}
                      onCheckedChange={(checked) => setData('is_active', checked)}
                    />
                  </div>
                  {errors.is_active && (
                    <p className="text-sm text-red-600">{errors.is_active}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Link href={route('dashboard.teams.show', team.id)}>
                    <Button type="button" variant="outline">
                      Batal
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    <IconDeviceFloppy className="h-4 w-4 mr-2" />
                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
