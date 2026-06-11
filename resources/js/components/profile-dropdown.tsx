import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {Link, usePage} from "@inertiajs/react"

interface User {
  name: string
  email: string
  profile_image?: string
}

interface PageProps extends Record<string, any> {
  auth?: {
    user?: User
  }
}

const getAvatarUrl = (user?: User) => {
  if (!user) return ''
  if (user.profile_image) {
    return user.profile_image.startsWith('http') 
      ? user.profile_image 
      : `/storage/${user.profile_image}`
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
}

export function ProfileDropdown() {
  const {auth} = usePage<PageProps>().props
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={getAvatarUrl(auth?.user)} alt={`@${auth?.user?.name}`} />
            <AvatarFallback>{auth?.user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SN'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{auth?.user?.name}</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {auth?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href='/dashboard/settings'>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>

        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link className="block w-full text-left" href={route('logout')} method="post" as="button">Log out</Link>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
