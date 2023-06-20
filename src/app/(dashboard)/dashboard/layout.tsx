import ChatList from '@/app/components/ChatList'
import SignOutButton from '@/app/components/SignOutButton'
import UnseenFriendRequestCount from '@/app/components/UnseenFriendRequestCount'
import { getFriendsByUserId } from '@/app/helpers/get-friends-by-user-id'
import { fetchRedis } from '@/app/helpers/redis'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

interface SideBarOption {
  id: number
  name: string
  href: string
  iconUrl: string
}

export default async function Layout({ children }: LayoutProps) {
  const session = await getServerSession(authOptions)
  if (!session) notFound()

  const userFriends = await getFriendsByUserId(session.user.id)

  const userFriendRequestCount = (
    (await fetchRedis(
      'smembers',
      `user:${session.user.id}:incoming_friend_requests`,
    )) as User[]
  ).length
  const sidebarOptions: SideBarOption[] = [
    {
      id: 1,
      name: 'Add friend',
      href: '/dashboard/add',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/8105/8105557.png',
    },
    {
      id: 2,
      name: 'Friend requests',
      href: '/dashboard/requests',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/8105/8105567.png',
    },
  ]

  if (!session) notFound()
  return (
    <div className="flex h-screen w-full bg-zinc-900">
      <div className="flex h-full w-full max-w-xs grow flex-col gap-y-8 overflow-y-auto border-r border-zinc-800 pt-2">
        <Link
          href="/dashboard"
          className="flex h-16 shrink-0 items-center px-4"
        >
          <Image
            alt="Logo"
            width={44}
            height={1}
            src="https://cdn-icons-png.flaticon.com/512/7589/7589271.png"
          />
        </Link>

        <nav className="flex flex-1 flex-col">
          <div className="px-4 text-xs font-semibold leading-6 text-purple-300">
            Your chats
          </div>

          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ChatList friends={userFriends} userId={session.user.id} />
            </li>

            <li>
              <div className="px-4 text-xs font-semibold leading-6 text-purple-300">
                Overview
              </div>

              <ul role="list" className="max-2 mt-2 space-y-1">
                {sidebarOptions.map((option) => {
                  return (
                    <li key={option.id}>
                      <Link
                        href={option.href}
                        className="group flex items-center gap-3 rounded-md p-4 text-sm font-semibold leading-6 text-gray-400 transition-colors hover:bg-purple-600/25 hover:text-white"
                      >
                        <Image
                          src={option.iconUrl}
                          alt="addIcon"
                          width={30}
                          height={1}
                          className="rounded-full transition-colors group-hover:border"
                        />
                        {option.name}
                        {option.name === 'Friend requests' && (
                          <UnseenFriendRequestCount
                            prevUnseen={userFriendRequestCount}
                            userId={session.user.id}
                          />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>

            <li className="mt-auto flex items-center bg-zinc-900/50">
              <div className="flex flex-1 items-center gap-x-4 px-4 py-4 text-sm font-semibold leading-6 text-purple-300">
                <div className="relative h-8 w-8">
                  <Image
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    src={session.user.image || ''}
                    alt="Profile image"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true" className="font-bold">
                    {session.user.name}
                  </span>
                  <span className="text-xs text-gray-400" aria-hidden="true">
                    {session.user.email}
                  </span>
                </div>
              </div>
              <SignOutButton className="aspect-square h-full text-gray-400 hover:bg-zinc-950 hover:text-white" />
            </li>
          </ul>
        </nav>
      </div>
      <aside className="max-w-screen mx-auto w-full">{children}</aside>
    </div>
  )
}
