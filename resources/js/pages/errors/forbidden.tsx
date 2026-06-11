import {GoBack} from "./components/go-back"
import { Head } from '@inertiajs/react'

export default function ForbiddenError() {
  return (
    <>
      <Head title='Akses Dilarang'/>
      <div className='h-svh'>
        <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
          <h1 className='text-[7rem] font-bold leading-tight'>403</h1>
          <span className='font-medium'>Akses Dilarang</span>
          <p className='text-center text-muted-foreground'>
            Anda tidak memiliki izin yang diperlukan <br/>
            untuk melihat sumber daya ini.
          </p>
          <GoBack/>
        </div>
      </div>
    </>
  )
}
