import { db } from "@/lib/db"
import Button from "./components/ui/Button"

export default async function Home() {
  
  await db.set('hello', 'hello')

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        <aside className="w-72 border-r border-zinc-300">
          aside
        </aside>
        
        <main className="p-4">
          <Button>Login</Button>
        </main>
      </div>
      

    </div>
  )
}
