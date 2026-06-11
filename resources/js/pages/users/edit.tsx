import { useState } from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import { AuthenticatedLayout } from '@/layouts/authenticated-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  IconUser,
  IconMail,
  IconShield,
  IconUsers,
  IconEye,
  IconKey,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconCrown,
  IconUserCheck,
  IconCalendar,
  IconSend
} from '@tabler/icons-react'

interface Team {
  id: number
  name: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
  team_id: number | null
  is_active: boolean
  created_at: string
  teams?: Array<{
    id: number
    name: string
    pivot?: {
      role: string
      is_primary: boolean
    }
  }>
}

interface EditUserProps {
  user: User
  teams: Team[]
}

export default function EditUser({ user, teams }: EditUserProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: user.name,
    email: user.email,
    role: user.role,
    team_id: user.team_id?.toString() || '',
    is_active: user.is_active,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Convert empty string back to null for backend
    const submitData = {
      ...data,
      team_id: data.team_id === '' ? null : data.team_id,
    }

    put(route('dashboard.users.update', user.id), {
      ...submitData,
      onSuccess: () => {
        // Handle success
      }
    })
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'user': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return <IconCrown className="h-4 w-4" />
      case 'user': return <IconUserCheck className="h-4 w-4" />
      default: return <IconUser className="h-4 w-4" />
    }
  }

  return (
    <AuthenticatedLayout title="Edit User">
      <Head title={`Edit Pengguna - ${user.name}`} />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={route('dashboard.users.index')}>
              <Button variant="ghost" size="sm">
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Pengguna
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Ubah Pengguna</h1>
              <p className="text-muted-foreground">
                Perbarui informasi dan pengaturan pengguna
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={route('dashboard.users.show', user.id)}>
              <Button variant="outline" size="sm">
                <IconEye className="h-4 w-4 mr-2" />
                Lihat Profil
              </Button>
            </Link>
          </div>
        </div>

        {/* Current User Status */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{user.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <IconMail className="h-4 w-4 mr-1" />
                    {user.email}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getRoleColor(user.role)} variant="outline">
                  {getRoleIcon(user.role)}
                  <span className="ml-1">{user.role}</span>
                </Badge>
                <Badge variant={user.is_active ? "default" : "secondary"}>
                  {user.is_active ? (
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IconUser className="h-5 w-5" />
                    <span>Informasi Pribadi</span>
                  </CardTitle>
                  <CardDescription>
                    Perbarui data pribadi dasar pengguna
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      className={errors.name ? 'border-red-500' : ''}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 flex items-center">
                        <IconAlertTriangle className="h-4 w-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Alamat Email *</Label>
                    <div className="relative">
                      <IconMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="Masukkan alamat email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 flex items-center">
                        <IconAlertTriangle className="h-4 w-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Role & Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IconShield className="h-5 w-5" />
                    <span>Peran & Hak Akses</span>
                  </CardTitle>
                  <CardDescription>
                    Atur peran pengguna dan penugasan tim
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="role">Peran Pengguna</Label>
                    <Select
                      value={data.role}
                      onValueChange={(value) => setData('role', value)}
                    >
                      <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Pilih peran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center space-x-2">
                            <IconCrown className="h-4 w-4 text-purple-600" />
                            <span>Administrator</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="user">
                          <div className="flex items-center space-x-2">
                            <IconUserCheck className="h-4 w-4 text-blue-600" />
                            <span>Pengguna Biasa</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-red-500 flex items-center">
                        <IconAlertTriangle className="h-4 w-4 mr-1" />
                        {errors.role}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team_id">Tim Utama</Label>
                    <Select
                      value={data.team_id}
                      onValueChange={(value) => setData('team_id', value)}
                    >
                      <SelectTrigger className={errors.team_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Pilih tim" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <div className="flex items-center space-x-2">
                            <IconX className="h-4 w-4 text-gray-500" />
                            <span>Tidak Ada Tim</span>
                          </div>
                        </SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <IconUsers className="h-4 w-4 text-blue-600" />
                              <span>{team.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.team_id && (
                      <p className="text-sm text-red-500 flex items-center">
                        <IconAlertTriangle className="h-4 w-4 mr-1" />
                        {errors.team_id}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_active" className="text-base font-medium">
                        Status Akun
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {data.is_active ? 'Akun aktif dan dapat mengakses sistem' : 'Akun dinonaktifkan'}
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={data.is_active}
                      onCheckedChange={(checked) => setData('is_active', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </form>

            {/* Password Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconKey className="h-5 w-5" />
                  <span>Manajemen Kata Sandi</span>
                </CardTitle>
                <CardDescription>
                  Reset kata sandi atau kirim instruksi pengaturan ulang
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Untuk mengubah kata sandi, Anda dapat mengirim email reset atau membuat kata sandi sementara.
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <IconSend className="h-4 w-4 mr-2" />
                      Kirim Email Reset
                    </Button>
                    <Button variant="outline" size="sm">
                      <IconKey className="h-4 w-4 mr-2" />
                      Buat Sandi Sementara
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Pratinjau Perubahan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {data.name.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{data.name || 'Nama Pengguna'}</p>
                    <p className="text-sm text-muted-foreground">{data.email || 'pengguna@example.com'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Badge className={getRoleColor(data.role)} variant="outline">
                    {getRoleIcon(data.role)}
                    <span className="ml-1">{data.role}</span>
                  </Badge>

                  <Badge variant={data.is_active ? "default" : "secondary"}>
                    {data.is_active ? (
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

                {data.team_id && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Tim Utama:</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <IconUsers className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">
                        {teams.find(t => t.id.toString() === data.team_id)?.name || 'Unknown Team'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pengguna</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <IconCalendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Bergabung:</span>
                  <span className="ml-1">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {user.teams && user.teams.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tim Tambahan:</p>
                    <div className="space-y-1">
                      {user.teams.map((team) => (
                        <div key={team.id} className="flex items-center text-sm">
                          <IconUsers className="h-3 w-3 mr-2 text-blue-600" />
                          <span>{team.name}</span>
                          {team.pivot?.is_primary && (
                            <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={processing}
                    className="w-full"
                  >
                    <IconDeviceFloppy className="h-4 w-4 mr-2" />
                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="w-full"
                  >
                    Batal
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center space-x-2">
                  <IconAlertTriangle className="h-5 w-5" />
                  <span>Zona Berbahaya</span>
                </CardTitle>
                <CardDescription>
                  Tindakan permanen dan tidak dapat dibatalkan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <IconAlertTriangle className="h-4 w-4 mr-2" />
                      Hapus Pengguna
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Pengguna "{user.name}" dan seluruh data terkait akan dihapus permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
