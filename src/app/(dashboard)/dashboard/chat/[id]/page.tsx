import ChatInput from '@/app/components/ChatInput'
import Messages from '@/app/components/Messages'
import { fetchRedis } from '@/app/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { messageArrayValidator } from '@/lib/validations/message'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
}

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      `zrange`,
      `chat:${chatId}:messages`,
      0,
      -1,
    )

    const dbMessages = results.map((result) => JSON.parse(result) as Message)
    const reversedDbMessages = dbMessages.reverse()
    const messages = messageArrayValidator.parse(reversedDbMessages)

    return messages
  } catch (error) {
    notFound()
  }
}

export default async function Chat({ params }: PageProps) {
  const chatId = params.id
  const session = await getServerSession(authOptions)
  if (!session) notFound()

  const { user } = session

  const [userId1, userId2] = chatId.split('--')

  if (user.id !== userId1 && user.id !== userId2) notFound()

  const chatPartnerId = user.id === userId1 ? userId2 : userId1

  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User
  const initialMessages = await getChatMessages(chatId)

  return (
    <main className="flex h-full max-h-[calc(100vh-6rem)] flex-1 flex-col justify-between space-y-4 bg-zinc-900/75">
      <div className="flex justify-between border-b border-zinc-800 bg-zinc-900 p-8 sm:items-center">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative h-8 w-8 sm:h-12 sm:w-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={chatPartner.name}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="flex items-center text-xl">
              <span className="mr-3 font-semibold text-purple-300">
                {chatPartner.name}
              </span>
            </div>

            <span className="text-sm text-gray-400">{chatPartner.email}</span>
          </div>
        </div>
      </div>
      <Messages
        userId={session.user.id}
        userImage={session.user.image}
        chatPartnerImage={chatPartner.image}
        initialMessages={initialMessages}
        chatId={chatId}
      />
      <ChatInput chatPartner={chatPartner} chatId={chatId} />
    </main>
  )
}
