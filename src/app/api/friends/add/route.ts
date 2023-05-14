import { fetchRedis } from "@/app/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { addFriendValidator } from "@/lib/validations/add-fiend"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req: Request) {
    try{
        const body = await req.json()
        const { email: emailToAdd } = addFriendValidator.parse(body.email)
        const idToAdd = await fetchRedis("get", `user:email:${emailToAdd}`) as string
        const session = await getServerSession(authOptions)
        
        if (!session){
            return new Response('Unauthorized.', {status: 401})
        }

        if (!idToAdd){
            return new Response('User not found.', {status: 400})
        }

        if (idToAdd === session.user.id){
            return new Response('You cannot add yourself.', {status: 400})
        }

        const isAlreadyAdded = (await fetchRedis(
            "sismember",
            `user:${idToAdd}:incoming_friend_requests`,
            session.user.id
        )) as 0 | 1

        if (isAlreadyAdded){
            return new Response('Request already sent.', {status: 400})
        }

        const isAlreadyFriend = (await fetchRedis(
            "sismember",
            `user:${session.user.id}:friends`,
            idToAdd
        )) as 0 | 1

        if (isAlreadyFriend){
            return new Response('User is already your friend.', {status: 400})
        }

        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        return new Response('OK')

    } catch (err) {
        if(err instanceof z.ZodError){
            return new Response('Invalid user e-mail.', {status: 422})
        }
        return new Response('Invalid request.', {status: 400})
    }
    

}