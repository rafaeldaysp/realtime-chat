'use client'

import { pusherClient } from '@/lib/push'
import { toPusherKey } from '@/lib/utils'
import axios from 'axios'
import { Check, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[]
  sessionId: string
}

export default function FriendRequests({
  incomingFriendRequests,
  sessionId,
}: FriendRequestsProps) {
  const router = useRouter()
  const acceptFriend = async (senderId: string) => {
    await axios
      .post('/api/friends/accept', {
        id: senderId,
      })
      .then(() => {
        setFriendRequests((prev) =>
          prev.filter((request) => request.senderId !== senderId),
        )
        router.refresh()
      })
  }

  const denyFriend = async (senderId: string) => {
    await axios
      .post('/api/friends/deny', {
        id: senderId,
      })
      .then(() => {
        setFriendRequests((prev) =>
          prev.filter((request) => request.senderId !== senderId),
        )
        router.refresh()
      })
  }

  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests,
  )

  useEffect(() => {
    const friendRequestHandler = (sender: IncomingFriendRequest) => {
      setFriendRequests((prev) => [...prev, sender])
    }
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`),
    )

    pusherClient.bind('incoming_friend_requests', friendRequestHandler)

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`),
      )
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
    }
  })

  return (
    <>
      {friendRequests.length > 0 ? (
        friendRequests.map((sender) => (
          <div key={sender.senderId} className="flex justify-between py-2">
            <div className="flex items-center gap-4">
              <Image
                src={sender.senderImage || ''}
                alt={sender.senderId}
                width={32}
                height={1}
                className="rounded-full"
                referrerPolicy="no-referrer"
              />
              <p className=" font-semibold">{sender.senderName}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => acceptFriend(sender.senderId)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-700 hover:bg-purple-500"
              >
                <Check className="h-full w-5 font-semibold" />
              </button>
              <button
                onClick={() => denyFriend(sender.senderId)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-700 hover:bg-red-500"
              >
                <X className="h-full w-5 font-semibold" />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>Nothing to show here...</p>
      )}
    </>
  )
}
