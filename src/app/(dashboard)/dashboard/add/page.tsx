import AddFriendButton from "@/app/components/AddFriendButton";

interface AddProps {}

export default async function Add({}: AddProps) {
    return(
        <main className="pt-8">
            <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
            <AddFriendButton/>
        </main>
    )
}