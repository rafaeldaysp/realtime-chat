import FriendRequests from '@/app/components/FriendRequests'
import { fetchRedis } from '@/app/helpers/redis'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'

export default async function requestsPage() {
  const session = await getServerSession(authOptions)
  if (!session) notFound()
  const userFriendRequestsIds = (await fetchRedis(
    'smembers',
    `user:${session.user.id}:incoming_friend_requests`,
  )) as string[]

  const userFriendRequestsSenders = await Promise.all(
    userFriendRequestsIds.map(async (id) => {
      const sender = (await fetchRedis('get', `user:${id}`)) as string
      const senderParsed = JSON.parse(sender) as User
      return {
        senderId: id,
        senderEmail: senderParsed.email,
        senderImage: senderParsed.image,
        senderName: senderParsed.name,
      }
    }),
  )

  return (
    <main className="px-5 pt-8">
      <h1 className="mb-8 text-5xl font-bold">Friend requests</h1>
      <FriendRequests
        incomingFriendRequests={userFriendRequestsSenders}
        sessionId={session.user.id}
      />
    </main>
  )
}
