'use client'

import { pusherClient } from '@/lib/push'
import { toPusherKey } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface Props {
  prevUnseen: number
  userId: string
}

export default function UnseenFriendRequestCount({
  prevUnseen,
  userId,
}: Props) {
  const [unseenRequestCount, setUnseenRequestCount] =
    useState<number>(prevUnseen)

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${userId}:incoming_friend_requests`),
    )

    const friendRequestHandler = () => {
      setUnseenRequestCount((prev) => prev + 1)
    }
    console.log(unseenRequestCount)

    pusherClient.bind('incoming_friend_requests', friendRequestHandler)

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${userId}:incoming_friend_requests`),
      )
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
    }
  })
  if (unseenRequestCount > 0)
    return (
      <div className="flex h-full w-6 justify-center rounded-full bg-purple-700 font-semibold text-white group-hover:bg-purple-500">
        {unseenRequestCount}
      </div>
    )
  return <></>
}
