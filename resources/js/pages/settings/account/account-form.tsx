import { useForm, usePage } from '@inertiajs/react'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

export function AccountForm() {
  const { auth } = usePage<any>().props
  const user = auth?.user

  const { data, setData, patch, processing, errors, reset } = useForm({
    username: user?.username || '',
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  const [showPassword, setShowPassword] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    patch(route('dashboard.settings.account.update'), {
      preserveScroll: true,
      onSuccess: () => {
        toast({
          title: 'Account updated successfully!',
          description: 'Your account settings have been saved.',
        })
        reset('current_password', 'password', 'password_confirmation')
      },
      onError: (err) => {
        toast({
          title: 'Error updating account',
          description: Object.values(err).join(', '),
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className='space-y-8 max-w-xl'>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Account Settings</h3>
        <p className="text-sm text-muted-foreground">
          Update your username or change your password.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username"
            value={data.username} 
            onChange={e => setData('username', e.target.value)} 
            placeholder="johndoe" 
          />
          {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
          <p className="text-sm text-muted-foreground">
            This is your unique username.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t">
        <h4 className="text-md font-medium">Change Password</h4>
        
        <div className="space-y-2">
          <Label htmlFor="current_password">Current Password</Label>
          <div className="relative">
            <Input 
              id="current_password"
              type={showPassword ? 'text' : 'password'}
              value={data.current_password} 
              onChange={e => setData('current_password', e.target.value)} 
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {errors.current_password && <p className="text-sm text-destructive">{errors.current_password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input 
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={data.password} 
              onChange={e => setData('password', e.target.value)} 
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirm New Password</Label>
          <div className="relative">
            <Input 
              id="password_confirmation"
              type={showPassword ? 'text' : 'password'}
              value={data.password_confirmation} 
              onChange={e => setData('password_confirmation', e.target.value)} 
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation}</p>}
        </div>
      </div>

      <Button type='submit' disabled={processing}>
        {processing ? 'Saving...' : 'Update account'}
      </Button>
    </form>
  )
}
