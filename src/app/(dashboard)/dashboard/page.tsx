import { getServerSession } from "next-auth"
import Button from "../../components/ui/Button"
import { authOptions } from "@/lib/auth"

interface Props {
    oi: string
}

export default async function Dashboard({}: Props) {

    const session = await getServerSession(authOptions)

    return (
        <>
            <Button>Hello World</Button>
            <pre>{JSON.stringify(session)}</pre>
        </>
        
    )
}