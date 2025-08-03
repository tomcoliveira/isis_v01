"use client"
import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { History, Terminal, User, Download, RotateCw, LoaderCircle, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

const NotionIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
    <path
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"
      fill="currentColor"
    />
    <path
      d="M8.915 7.584l6.17 8.832-1.584 1.109-6.17-8.832 1.584-1.109zm.585 8.832l4.5-6.428-1.584-1.109-4.5 6.428 1.584 1.109zM8 8h3v8H8V8zm5 0h3v8h-3V8z"
      fill="currentColor"
    />
  </svg>
)

export function LlmInterface() {
  const [notepadContent, setNotepadContent] = useState("")
  // Garantimos que messages e input tenham valores padrão para evitar erros
  const {
    messages = [],
    input = "",
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
  })

  const handleRestart = () => {
    setMessages([])
    setNotepadContent("")
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const chatContainer = chatContainerRef.current
    const notepad = document.getElementById("notepad") as HTMLTextAreaElement | null
    const handleScroll = () => {
      if (chatContainer && notepad) {
        const scrollPercentage = chatContainer.scrollTop / (chatContainer.scrollHeight - chatContainer.clientHeight)
        notepad.scrollTop = scrollPercentage * (notepad.scrollHeight - notepad.clientHeight)
      }
    }
    chatContainer?.addEventListener("scroll", handleScroll)
    return () => chatContainer?.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div className="flex h-screen w-full flex-col bg-black text-gray-300 font-sans">
      <header className="flex h-14 items-center justify-center gap-4 border-b border-gray-800/50 px-4 flex-shrink-0">
        <button className="p-2 rounded-md hover:bg-yellow-900/20 text-yellow-400/80 hover:text-yellow-400 transition-colors">
          <Download className="h-5 w-5" />
          <span className="sr-only">Save as Markdown</span>
        </button>
        <button
          onClick={handleRestart}
          className="p-2 rounded-md hover:bg-yellow-900/20 text-yellow-400/80 hover:text-yellow-400 transition-colors"
        >
          <RotateCw className="h-5 w-5" />
          <span className="sr-only">Restart Chat</span>
        </button>
        <button className="p-2 rounded-md hover:bg-yellow-900/20 text-yellow-400/80 hover:text-yellow-400 transition-colors">
          <NotionIcon />
          <span className="sr-only">Save to Notion</span>
        </button>
        <button className="p-2 rounded-md hover:bg-yellow-900/20 text-yellow-400/80 hover:text-yellow-400 transition-colors">
          <Lock className="h-5 w-5" />
          <span className="sr-only">Lock Chat</span>
        </button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-16 flex-shrink-0 border-r border-gray-800/50 p-4 flex flex-col items-center">
          <History className="h-6 w-6 text-yellow-400/80" />
          <div className="mt-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-8 rounded-full bg-gray-800/50" />
            ))}
          </div>
        </aside>
        <main className="flex-1 flex flex-col" onClick={handleContainerClick}>
          <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto relative">
            {messages.length === 0 && !isLoading && (
              <div className="absolute inset-0 flex items-start justify-start pt-16 pl-16 transition-opacity duration-500">
                <div
                  className={cn(
                    "text-8xl md:text-9xl font-mono text-yellow-400/80 transition-all duration-300",
                    input.length > 0 && "text-3xl opacity-0",
                  )}
                >
                  {">"}
                  <span className="animate-blink">_</span>
                </div>
              </div>
            )}
            <div className="space-y-8">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex items-start gap-4", m.role === "user" && "flex-row-reverse")}>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-yellow-400/80 flex-shrink-0",
                      m.role === "assistant" ? "bg-gray-800/50" : "bg-yellow-900/20",
                    )}
                  >
                    {m.role === "assistant" ? <Terminal className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>
                  <div className={cn("flex-1", m.role === "user" && "pt-1.5")}>
                    {m.role === "assistant" ? (
                      <div className="rounded-lg bg-gray-900/50 p-4">
                        <p>{m.content}</p>
                      </div>
                    ) : (
                      <p>{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800/50 p-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-400/80">
                {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Terminal className="h-5 w-5" />}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Converse com a Isis..."
                disabled={isLoading}
                className="w-full rounded-md border border-gray-700/50 bg-gray-900/50 py-2 pl-10 pr-4 text-gray-300 focus:border-yellow-400/50 focus:outline-none focus:ring-1 focus:ring-yellow-400/50 disabled:opacity-50"
              />
            </form>
          </div>
        </main>
        <aside
          className="w-1/4 flex-shrink-0 border-l border-gray-800/50 p-4 hidden md:flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center text-yellow-400/80">
            <span className="text-2xl font-bold tracking-tighter leading-none">///</span>
          </div>
          <textarea
            id="notepad"
            value={notepadContent}
            onChange={(e) => setNotepadContent(e.target.value)}
            placeholder="..."
            className="mt-4 flex-1 resize-none bg-transparent text-gray-400 placeholder-gray-600 focus:outline-none"
          />
        </aside>
      </div>
    </div>
  )
}
