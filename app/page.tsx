import dynamic from "next/dynamic"

// Usamos dynamic import para carregar o componente apenas no lado do cliente
const LlmInterface = dynamic(() => import("@/components/llm-interface").then((mod) => mod.LlmInterface), {
  ssr: false, // ssr: false desativa a renderização no servidor
  loading: () => (
    <p className="flex h-screen items-center justify-center bg-black text-white">Carregando Interface...</p>
  ),
})

export default function Home() {
  return (
    <main>
      <LlmInterface />
    </main>
  )
}
