import { fetchRedis } from '@/app/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/push'
import { toPusherKey } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id: idToAccept } = z
      .object({
        id: z.string(),
      })
      .parse(body)

    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const isAlreadyFriends = (await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAccept,
    )) as 0 | 1

    if (isAlreadyFriends) {
      return new Response('This user is already your friend', { status: 400 })
    }

    const hasFriendRequest = (await fetchRedis(
      'sismember',
      `user:${session.user.id}:incoming_friend_requests`,
      idToAccept,
    )) as 0 | 1

    if (!hasFriendRequest) {
      return new Response('You have not a friend request from this user', {
        status: 401,
      })
    }

    const isMutualFriendRequest = (await fetchRedis(
      'sismember',
      `user:${idToAccept}:incoming_friend_requests`,
      session.user.id,
    )) as 0 | 1

    if (isMutualFriendRequest)
      await db.srem(
        `user:${idToAccept}:incoming_friend_requests`,
        session.user.id,
      )

    await db.srem(
      `user:${session.user.id}:incoming_friend_requests`,
      idToAccept,
    )
    const userToAcceptStr = (await fetchRedis(
      'get',
      `user:${idToAccept}`,
    )) as string
    const userToAccept = JSON.parse(userToAcceptStr) as User
    pusherServer.trigger(
      toPusherKey(`user:${idToAccept}:friends`),
      'friends',
      userToAccept,
    )

    await db.sadd(`user:${session.user.id}:friends`, idToAccept)
    await db.sadd(`user:${idToAccept}:friends`, session.user.id)

    return new Response('Success')
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 })
    }
    return new Response('Invalid request', { status: 400 })
  }
}
