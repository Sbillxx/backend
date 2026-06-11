import { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { AuthenticatedLayout } from '@/layouts/authenticated-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { IconShield, IconDeviceDesktop, IconTrash } from '@tabler/icons-react'

interface Session {
  id: number
  device: string
  ip_address: string
  last_active: string
  current: boolean
}

interface SecurityIndexProps {
  user: {
    id: number
    name: string
    email: string
    two_factor_enabled?: boolean
  }
  sessions: Session[]
  can: {
    manage_security: boolean
  }
}

export default function SecurityIndex({ user, sessions, can }: SecurityIndexProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user.two_factor_enabled || false)

  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  const twoFactorForm = useForm({
    enabled: twoFactorEnabled,
  })

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    passwordForm.patch(route('dashboard.settings.security.password'), {
      onSuccess: () => {
        passwordForm.reset()
      },
    })
  }

  const handleTwoFactorToggle = (enabled: boolean) => {
    setTwoFactorEnabled(enabled)
    twoFactorForm.patch(route('dashboard.settings.security.two-factor'), {
      onSuccess: () => {
        // Handle success
      }
    })
  }

  const handleRevokeSession = (sessionId: number) => {
    if (confirm('Are you sure you want to revoke this session?')) {
      // Implement session revocation
    }
  }

  return (
    <AuthenticatedLayout title="Security Settings">
      <Head title="Security" />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
          <p className="text-muted-foreground">
            Manage your account security and privacy settings
          </p>
        </div>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IconShield className="mr-2 h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordForm.data.current_password}
                  onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                  className={passwordForm.errors.current_password ? 'border-red-500' : ''}
                />
                {passwordForm.errors.current_password && (
                  <p className="text-sm text-red-500 mt-1">{passwordForm.errors.current_password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordForm.data.password}
                  onChange={(e) => passwordForm.setData('password', e.target.value)}
                  className={passwordForm.errors.password ? 'border-red-500' : ''}
                />
                {passwordForm.errors.password && (
                  <p className="text-sm text-red-500 mt-1">{passwordForm.errors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={passwordForm.data.password_confirmation}
                  onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                />
              </div>

              <Button type="submit" disabled={passwordForm.processing}>
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  {twoFactorEnabled
                    ? 'Two-factor authentication is enabled'
                    : 'Two-factor authentication is disabled'
                  }
                </p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={handleTwoFactorToggle}
                disabled={twoFactorForm.processing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Manage devices that are currently signed in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <IconDeviceDesktop className="mr-2 h-4 w-4" />
                        {session.device}
                      </div>
                    </TableCell>
                    <TableCell>{session.ip_address}</TableCell>
                    <TableCell>
                      {new Date(session.last_active).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {session.current ? (
                        <Badge variant="default">Current</Badge>
                      ) : (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!session.current && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          <IconTrash className="mr-1 h-3 w-3" />
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
