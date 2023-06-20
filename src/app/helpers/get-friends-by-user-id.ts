import { fetchRedis } from "./redis";

export async function getFriendsByUserId(userId: string) {
  const friendsIds = (await fetchRedis("smembers", `user:${userId}:friends`)) as string[]

  const friends = Promise.all(
    friendsIds.map(async friendId => {
      const friend = await JSON.parse(await fetchRedis("get", `user:${friendId}`) as string) as User
      return friend
    })
  )

  return friends
}