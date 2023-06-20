'use client'
import { useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Button from './ui/Button'
import axios from 'axios'
import { toast } from 'react-hot-toast'

interface ChatInputProps {
  chatPartner: User
  chatId: string
}

export default function ChatInput({ chatPartner, chatId }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [input, setInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const sendMessage = async () => {
    if (!input) return
    setIsLoading(true)
    try {
      await axios.post('/api/message/send', {
        text: input,
        chatId,
      })
      setInput('')
      textareaRef.current?.focus()
    } catch (error) {
      toast.error('something went wrong. try again later')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mb-2 px-72 pt-4 sm:mb-0 ">
      <div className="relative flex-1 cursor-text overflow-hidden rounded-lg bg-zinc-800 shadow-sm ring-1 ring-inset ring-zinc-800 focus-within:ring-2 focus-within:ring-purple-500">
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${chatPartner.name}`}
          className="block h-20 w-full resize-none border-0 bg-transparent text-zinc-200 placeholder:text-zinc-400 focus:ring-0 sm:py-1.5 sm:leading-6"
        />

        <div className="absolute bottom-0 right-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrink-0">
            {/* <Button isLoading={isLoading} onClick={sendMessage} type="submit">
              Send
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  )
}
