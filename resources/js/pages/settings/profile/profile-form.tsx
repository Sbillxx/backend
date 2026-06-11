import { useForm, usePage } from '@inertiajs/react'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export default function ProfileForm() {
  const { auth } = usePage<any>().props
  const user = auth?.user

  const { data, setData, patch, post, processing, errors } = useForm({
    profile_image: null as File | null,
    _method: 'PATCH', // To spoof PATCH for file uploads in Laravel
  })

  const [preview, setPreview] = useState<string | null>(
    user?.profile_image 
      ? (user.profile_image.startsWith('http') ? user.profile_image : `/storage/${user.profile_image}`) 
      : null
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setData('profile_image', file)
      setPreview(URL.createObjectURL(file))
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Laravel requires POST method to upload files when spoofing PATCH
    post(route('dashboard.settings.profile.update'), {
      preserveScroll: true,
      onSuccess: () => {
        toast({
          title: 'Profile updated successfully!',
          description: 'Your new profile picture has been saved.',
        })
      },
      onError: (err) => {
        toast({
          title: 'Error updating profile',
          description: Object.values(err).join(', '),
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className='space-y-8'>
      <div className="space-y-4">
        <Label>Profile Picture</Label>
        
        <div className="flex items-center space-x-6">
          <div className="shrink-0">
            {preview ? (
              <img className="h-24 w-24 object-cover rounded-full shadow-sm" src={preview} alt="Profile preview" />
            ) : (
              <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground shadow-sm">
                No Image
              </div>
            )}
          </div>
          <label className="block">
            <span className="sr-only">Choose profile photo</span>
            <Input 
              type="file" 
              accept="image/*"
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90 cursor-pointer"
              onChange={handleImageChange}
            />
          </label>
        </div>
        {errors.profile_image && (
          <p className="text-sm font-medium text-destructive">{errors.profile_image}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Upload a high-quality picture to be used across the application. Max size 2MB.
        </p>
      </div>

      <Button type='submit' disabled={processing}>
        {processing ? 'Saving...' : 'Update profile picture'}
      </Button>
    </form>
  )
}
