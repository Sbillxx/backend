import {GoBack} from "./components/go-back"
import { Head } from '@inertiajs/react'

export default function NotFoundError() {
  return (
    <>
      <Head title='Ups! Halaman Tidak Ditemukan'/>
      <div className='h-svh'>
        <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
          <h1 className='text-[7rem] font-bold leading-tight'>404</h1>
          <span className='font-medium'>Ups! Halaman Tidak Ditemukan!</span>
          <p className='text-center text-muted-foreground'>
            Sepertinya halaman yang Anda cari <br/>
            tidak ada atau mungkin telah dihapus.
          </p>
          <GoBack/>
        </div>
      </div>
    </>
  )
}
