import { chatHrefConstructor, cn } from '@/lib/utils'
import Image from 'next/image'
import { Toast, toast } from 'react-hot-toast'

interface ToastProps {
  t: Toast
  userId: string
  senderId: string
  senderImage: string
  senderName: string
  senderMessage: string
}

export default function NewMessageToast({
  t,
  userId,
  senderId,
  senderImage,
  senderName,
  senderMessage,
}: ToastProps) {
  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-md rounded-lg bg-zinc-700 ring-1 ring-purple-600 ring-opacity-5',
        {
          'animate-enter': t.visible,
          'animate-leave': !t.visible,
        },
      )}
    >
      <a
        onClick={() => toast.dismiss(t.id)}
        href={`/dashboard/chat/${chatHrefConstructor(userId, senderId)}`}
        className="w-0 flex-1 p-4"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="relative h-10 w-10">
              <Image
                fill
                referrerPolicy="no-referrer"
                className="rounded-full"
                src={senderImage}
                alt={`${senderName} profile picture`}
              />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-zinc-200">{senderName}</p>
            <p className="mt-1 text-sm text-zinc-400">{senderMessage}</p>
          </div>
        </div>
      </a>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="rouded-r-lg flex items-center justify-center rounded-none border border-transparent p-4 text-sm font-medium text-purple-300 hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        ></button>
      </div>
    </div>
  )
}
