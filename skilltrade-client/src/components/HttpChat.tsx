import { useEffect, useState, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Send, X } from "lucide-react"
import buildClient from "../../api/client"

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  isMe: boolean
}

interface HttpChatProps {
  sessionId: string
  userId: string
  currentUserName: string
  otherUserName: string
  onClose: () => void
}

export default function HttpChat({
  sessionId,
  userId,
  currentUserName,
  otherUserName,
  onClose,
}: HttpChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageTimeRef = useRef<Date | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch messages
  const fetchMessages = async (since?: Date) => {
    try {
      const client = buildClient({ req: undefined })
      const params = since ? `?since=${since.toISOString()}` : ""
      const response = await client.get(`/api/connections/active/${sessionId}/messages${params}`)

      const fetchedMessages = response.data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        isMe: msg.senderId === userId,
      }))

      if (since) {
        // Append new messages
        setMessages(prev => [...prev, ...fetchedMessages])
        if (fetchedMessages.length > 0) {
          lastMessageTimeRef.current = fetchedMessages[fetchedMessages.length - 1].timestamp
        }
      } else {
        // Initial load
        setMessages(fetchedMessages)
        if (fetchedMessages.length > 0) {
          lastMessageTimeRef.current = fetchedMessages[fetchedMessages.length - 1].timestamp
        }

        // Add welcome message if no messages exist
        if (fetchedMessages.length === 0) {
          const welcomeMsg: Message = {
            id: "welcome",
            senderId: "system",
            senderName: "System",
            content: "Chat started! You can now send messages.",
            timestamp: new Date(),
            isMe: false,
          }
          setMessages([welcomeMsg])
        }
      }

      setIsLoading(false)
      setError("")
    } catch (err: any) {
      console.error("Failed to fetch messages:", err)
      setError("Failed to load messages")
      setIsLoading(false)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const client = buildClient({ req: undefined })
      const response = await client.post(`/api/connections/active/${sessionId}/messages`, {
        message: newMessage.trim(),
      })

      // Add sent message to local state
      const sentMessage: Message = {
        ...response.data,
        timestamp: new Date(response.data.timestamp),
        isMe: true,
      }

      setMessages(prev => [...prev, sentMessage])
      lastMessageTimeRef.current = sentMessage.timestamp
      setNewMessage("")
      setError("")
    } catch (err: any) {
      console.error("Failed to send message:", err)
      setError("Failed to send message")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Polling for new messages
  useEffect(() => {
    // Initial fetch
    fetchMessages()

    // Set up polling every 2 seconds
    pollingRef.current = setInterval(() => {
      if (lastMessageTimeRef.current) {
        fetchMessages(lastMessageTimeRef.current)
      }
    }, 2000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [sessionId])

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
          <p className="text-sm text-gray-600">Chatting with {otherUserName}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 max-h-[400px] min-h-[300px]"
        style={{ scrollBehavior: "smooth" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.isMe ? "justify-end" : "justify-start"} ${
                  message.senderId === "system" ? "justify-center" : ""
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${
                    message.senderId === "system"
                      ? "bg-gray-100 text-gray-600 text-sm"
                      : message.isMe
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {message.senderId !== "system" && (
                    <div className="text-xs opacity-75 mb-1 font-medium">
                      {message.senderName} • {formatTime(message.timestamp)}
                    </div>
                  )}
                  <div className="text-sm leading-relaxed">{message.content}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">{error}</div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-3">
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-4 py-2"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isLoading}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • Messages refresh automatically
        </div>
      </div>
    </div>
  )
}
