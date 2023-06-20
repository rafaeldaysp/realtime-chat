import AddFriendButton from '@/app/components/AddFriendButton'

export default async function Add() {
  return (
    <main className="px-5 pt-8">
      <h1 className="mb-8 text-5xl font-bold">Add a friend</h1>
      <AddFriendButton />
    </main>
  )
}
