'use client'

import { pusherClient } from '@/lib/push'
import { chatHrefConstructor, toPusherKey } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import NewMessageToast from './newMessageToast'

interface ChatListProps {
  friends: User[]
  userId: string
}

interface ExtendedMessage extends Message {
  senderImg: string
  senderName: string
}

export default function ChatList({ friends, userId }: ChatListProps) {
  const [currentFriends, setCurrentFriends] = useState<User[]>(friends)
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
  const pathname = usePathname()
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:friends`))
    pusherClient.subscribe(toPusherKey(`user:${userId}:chats`))

    const newFriendHandler = (newFriend: User) => {
      setCurrentFriends((prev) => [...prev, newFriend])
    }

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(userId, message.senderId)}`

      if (!shouldNotify) return

      toast.custom((t) => (
        <NewMessageToast
          senderId={message.senderId}
          senderImage={message.senderImg}
          senderMessage={message.text}
          senderName={message.senderName}
          t={t}
          userId={userId}
        />
      ))
      console.log('Mensagem recebida')
      setUnseenMessages((prev) => [...prev, message])
    }

    pusherClient.bind('friends', newFriendHandler)
    pusherClient.bind('chats', chatHandler)

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:friends`))
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:chats`))
      pusherClient.unbind('friends', newFriendHandler)
      pusherClient.unbind('chats', chatHandler)
    }
  }, [pathname, userId])

  return (
    <ul role="list" className="overflow-y-auto py-1">
      {friends.map((friend) => (
        <li key={friend.id} className="">
          <Link
            className="group flex items-center gap-4 rounded p-4 text-gray-400 transition-colors hover:bg-purple-600/25 hover:text-white"
            href={`/dashboard/chat/${chatHrefConstructor(friend.id, userId)}`}
          >
            <Image
              src={friend.image}
              alt="Friend picture"
              width={30}
              height={1}
              className="rounded-full transition-colors group-hover:border"
            />
            <span>{friend.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
