'use client'

import { pusherClient } from '@/lib/push'
import { cn, toPusherKey } from '@/lib/utils'
import { format } from 'date-fns'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

interface MessageProps {
  initialMessages: Message[]
  userId: string
  userImage: string | null | undefined
  chatPartnerImage: string
  chatId: string
}

export default function Messages({
  initialMessages,
  userId,
  userImage,
  chatPartnerImage,
  chatId,
}: MessageProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const scrollDownRef = useRef<HTMLDivElement | null>(null)

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, 'HH:mm')
  }

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`))
    const newMessageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev])
    }
    pusherClient.bind('incoming_message', newMessageHandler)

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`))
      pusherClient.unbind('incoming_message', newMessageHandler)
    }
  }, [chatId])

  return (
    <div
      id="messages"
      className="scrollbar-thumb-purple scrollbar-thumb-rounded scrollbar-track-purple-lighter scrollbar-w-2 scrolling-touch flex h-full flex-1 flex-col-reverse overflow-y-auto px-72"
      ref={scrollDownRef}
    >
      {messages.map((message, index) => {
        console.log(message)
        const isCurrentUser = message.senderId === userId
        const hasMessageFromSameUser =
          messages[index - 1]?.senderId === message.senderId

        return (
          <div key={`${message.id}-${message.timestamp}`}>
            <div
              className={cn('flex items-end p-1', {
                'justify-end': isCurrentUser,
              })}
            >
              <div
                className={cn(
                  'mx-2 flex max-w-xs flex-col space-y-2 text-base',
                  {
                    'order-1 items-end': isCurrentUser,
                    'order-2 items-start': !isCurrentUser,
                  },
                )}
              >
                <span
                  className={cn(
                    'relative inline-block rounded-lg px-4 py-2 pl-4 pr-12',
                    {
                      'bg-purple-900 text-white': isCurrentUser,
                      'bg-zinc-800 text-zinc-200': !isCurrentUser,
                      'rounded-br-none':
                        !hasMessageFromSameUser && isCurrentUser,
                      'rounded-bl-none':
                        !hasMessageFromSameUser && !isCurrentUser,
                    },
                  )}
                >
                  {message.text}{' '}
                  <span className="absolute bottom-1 right-2 text-xs text-gray-300">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </span>
              </div>
              <div
                className={cn('relative h-6 w-6', {
                  'order-2': isCurrentUser,
                  'order-1': !isCurrentUser,
                  invisible: hasMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  alt="Profile picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                  src={isCurrentUser ? (userImage as string) : chatPartnerImage}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
