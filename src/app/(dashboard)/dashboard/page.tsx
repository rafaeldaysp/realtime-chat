import { getServerSession } from 'next-auth'
import Button from '../../components/ui/Button'
import { authOptions } from '@/lib/auth'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  return (
    <>
      <Button>Dashboard</Button>
    </>
  )
}
