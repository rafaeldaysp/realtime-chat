'use client'

import { useState } from "react";
import Button from "../../components/ui/Button";
import { signIn } from "next-auth/react"
import { toast } from "react-hot-toast";

interface pageProps {}

const page: pageProps = ({}) => {

    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function loginWithGoogle() {
        setIsLoading(true)
        try{
             await signIn('google')
        } catch (err) {
            toast.error('Something went wront with your login.')
        } finally {
            setIsLoading(false)
        }

    }

    async function loginWithMicrosoft() {
        setIsLoading(true)
        try{
             await signIn('azure-ad')
        } catch (err) {
            toast.error('Something went wront with your login.')
        } finally {
            setIsLoading(false)
        }

    }

    return(
        <div className="min-w-full flex items-center justify-center py-12 px-4 sm:py-6 lg:px-8">
            <div className="w-full flex flex-col items-center space-y-6 max-w-md">
                logo
                <div className="flex flex-col gap-8">
                    <h1 className="font-bold text-3xl mt-14 justify-center">
                        Lets join conversation
                    </h1>
                    <Button 
                        className="max-w-sm mx-auto w-full"
                        type="button"
                        isLoading={isLoading}
                        onClick={loginWithGoogle}>
                        Login
                    </Button>
                    <Button 
                        className="max-w-sm mx-auto w-full"
                        type="button"
                        isLoading={isLoading}
                        onClick={loginWithMicrosoft}>
                        Login with Microsoft
                    </Button>
                </div>
            </div>
            
            
        </div>
    )

}

export default page