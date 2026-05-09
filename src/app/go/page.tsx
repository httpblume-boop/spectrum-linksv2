import { Suspense } from 'react'
import GoClient from './GoClient'

export default function GoPage() {
  return (
    <Suspense>
      <GoClient />
    </Suspense>
  )
}
