'use client'

import { addFriendValidator } from "@/lib/validations/add-fiend"
import Button from "./ui/Button"
import axios, { AxiosError } from "axios"
import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

interface AddFriendButtonProps {}

type AddFriendValidatorForm = z.infer<typeof addFriendValidator>

export default function AddFriendButton({}: AddFriendButtonProps) {

    const [successSate, setSuccessState] = useState<boolean>(false)
    
    const {
        register,
        handleSubmit,
        setError,
        formState: {errors}
    } = useForm<AddFriendValidatorForm>({resolver: zodResolver(addFriendValidator)})

    const addFriend = async (email: string) => {
        try{
            const validatedEmail = addFriendValidator.parse({email})
            await axios.post('/api/friends/add', {
                email: validatedEmail,
            }).then((res) => {
                setSuccessState(true)
            })
            
        } catch (err) {
            setSuccessState(false)
            if(err instanceof z.ZodError){
                setError("email", {message: err.message})
                return
            }

            if(err instanceof AxiosError){
                setError("email", {message: err.response?.data})
                return
            }
            setError("email", {message: 'Something went wrong.'})
        }
    }

    const onSubmit = (data: AddFriendValidatorForm) => {
        addFriend(data.email)
    }

    return (
        <form 
            className="max-w-sm"
            onSubmit={handleSubmit(onSubmit)}
            >
            <label 
                htmlFor="email" 
                className="block text-sm font-medium leading-6">
                Add a friend by e-mail
            </label>

            <div className="mt-2 flex gap-4">
                <input 
                    {...register("email")}
                    type="text"
                    placeholder="email@example.com"
                    className="block w-full bg-zinc-950 rounded-md border-0 py-1.5 ring-1 ring-inset ring-purple-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm sm:leading-6"/>
                <Button>Add</Button>
            </div>

            <p className="mt-1 text-sm text-red-400">{errors.email?.message}</p>
            {successSate ? (
                <p className="mt-1 text-sm text-green-400">Friend request sent!</p>
            ) : null}
            
        </form>
    )
} 