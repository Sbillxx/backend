import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { Task } from '../data/schema'

// Define missing options
const statusOptions = [
  { label: 'Backlog', value: 'backlog' },
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in progress' },
  { label: 'Done', value: 'done' },
  { label: 'Canceled', value: 'canceled' },
]

const labelOptions = [
  { label: 'Bug', value: 'bug' },
  { label: 'Feature', value: 'feature' },
  { label: 'Enhancement', value: 'enhancement' },
  { label: 'Documentation', value: 'documentation' },
]

const formSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi.'),
  status: z.string().min(1, 'Silakan pilih status.'),
  label: z.string().min(1, 'Silakan pilih label.'),
  priority: z.string().min(1, 'Silakan pilih prioritas.'),
})
type TasksForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

export function TasksMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow

  const form = useForm<TasksForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      title: '',
      status: '',
      label: '',
      priority: '',
    },
  })

  const onSubmit = (data: TasksForm) => {
    // do something with the form data
    onOpenChange(false)
    form.reset()
    toast({
      title: 'Anda mengirimkan nilai berikut:',
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? 'Perbarui' : 'Buat'} Tugas</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Perbarui tugas dengan memberikan informasi yang diperlukan.'
              : 'Tambahkan tugas baru dengan memberikan informasi yang diperlukan.'}
            Klik simpan setelah Anda selesai.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='tasks-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-5 flex-1'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Masukkan judul' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      placeholder='Pilih status'
                      items={statusOptions}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      disabled={field.disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      placeholder='Pilih label'
                      items={labelOptions}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      disabled={field.disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='priority'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Prioritas</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='flex flex-row space-x-4'
                    >
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='low' id='low' />
                        <label htmlFor='low'>Rendah</label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='medium' id='medium' />
                        <label htmlFor='medium'>Sedang</label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='high' id='high' />
                        <label htmlFor='high'>Tinggi</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2 pt-3 sm:space-x-0'>
          <SheetClose asChild>
            <Button type='button' variant='outline'>
              Batal
            </Button>
          </SheetClose>
          <Button type='submit' form='tasks-form'>
            Simpan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
