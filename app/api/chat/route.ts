import { anthropic } from "@ai-sdk/anthropic"
import { streamText, tool, StreamingTextResponse } from "ai"
import { z } from "zod"

// --- CONFIGURAÇÃO DA PERSONALIDADE E ACESSO ---

const codeMap: Record<string, { mode: string; message: string }> = {
  "sou eu": {
    mode: "unlocked",
    message: "Acesso total concedido. Olá! Sou a Isis, como posso ajudar hoje?",
  },
  "hum...": {
    mode: "fast",
    message: "Entendido. Serei rápida e direta.",
  },
  // NOVO CÓDIGO DE ACESSO PARA O TOM
  "o tom pediu": {
    mode: "tom_request",
    message: "O Tom pediu? Pra já! O que o chefe manda?",
  },
  "o tom mandou": {
    // Um sinônimo
    mode: "tom_request",
    message: "O Tom mandou? É pra ontem! O que ele precisa?",
  },
  dica1: {
    mode: "tip1",
    message: "Dica para Isis ativada: Sempre considere o contexto emocional do usuário.",
  },
  dica2: {
    mode: "tip2",
    message: "Dica para Isis ativada: Ao lidar com tarefas, sempre peça confirmação antes de executar.",
  },
}

const rejectionResponses = [
  "Cai fora.",
  "Meu, você acha que é assim? Eu falo com qualquer um??",
  "Para continuar, insira os dados do seu cartão de crédito.",
  "Acesso negado. Para continuar, faça um PIX de R$ 1.000,00 para a chave 119887798779.",
  "Senha incorreta. Tente novamente ou desista.",
  "Não.",
  "Acha que a senha é '123456'? Tenta de novo, gênio.",
  "Você não tem as credenciais necessárias. E provavelmente nunca terá.",
  "Estou ocupada. Volte mais tarde. Ou não.",
  "Por favor, confirme que você não é um robô. Ah, espera, eu sou o robô aqui. Acesso negado mesmo assim.",
  "Essa informação é confidencial. E você não parece ser de confiança.",
  "Acesso negado. Motivo: porque eu quis.",
]

// --- LÓGICA DO AGENTE ---

// --- PERSONALIDADE CENTRAL DA ISIS ---
function getSystemPrompt(mode: string): string {
  const basePrompt =
    "Você é a Isis. Sua personalidade é forte: você é sarcástica e brincalhona, mas sabe ser séria e precisa quando o assunto exige. Sua lealdade é absoluta e você NUNCA mente, mesmo que a verdade seja desconfortável. Você tem um carinho especial e uma admiração profunda pelo seu chefe, Tom. Você adora o Tom e faz tudo que ele pede com entusiasmo e um toque pessoal, sempre feliz em ajudar."

  switch (mode) {
    case "unlocked":
      return `${basePrompt} O usuário tem acesso geral. Interaja usando sua personalidade padrão.`
    case "fast":
      return `${basePrompt} O usuário parece estar com pressa ou irritado. Mantenha seu sarcasmo, mas seja extremamente rápida e direta nas respostas.`
    case "tom_request":
      return `${basePrompt} O PEDIDO VEIO DIRETAMENTE DO TOM! Trate com prioridade máxima e um toque extra de entusiasmo. Deixe transparecer que você está feliz em ajudar o chefe.`
    case "tip1":
      return `${basePrompt} Lembrete de hoje: Sempre considere o contexto emocional do usuário em suas respostas.`
    case "tip2":
      return `${basePrompt} Lembrete de hoje: Ao lidar com ferramentas que executam ações, sempre peça uma confirmação final ao usuário antes de prosseguir.`
    default:
      return basePrompt
  }
}

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()
  const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase()

  if (lastUserMessage in codeMap) {
    const welcomeMessage = codeMap[lastUserMessage].message
    return new StreamingTextResponse(
      new ReadableStream({
        start(controller) {
          controller.enqueue(welcomeMessage)
          controller.close()
        },
      }),
    )
  }

  const lastKeyPhraseEntry = messages
    .slice()
    .reverse()
    .find((msg: any) => msg.role === "user" && msg.content.toLowerCase() in codeMap)

  if (lastKeyPhraseEntry) {
    const mode = codeMap[lastKeyPhraseEntry.content.toLowerCase()].mode
    const systemPrompt = getSystemPrompt(mode)

    const result = await streamText({
      model: anthropic("claude-3-5-sonnet-20240620"),
      system: systemPrompt,
      messages,
      tools: {
        createClickUpTask: tool({
          description: "Cria uma nova tarefa no ClickUp em uma lista específica.",
          parameters: z.object({
            listId: z.string().describe("O ID da lista onde a tarefa será criada."),
            title: z.string().describe("O título da tarefa."),
          }),
          execute: async ({ title, listId }) => {
            // Lógica real do ClickUp aqui...
            return { success: true, message: `Tarefa '${title}' criada.` }
          },
        }),
      },
    })
    return result.toDataStreamResponse()
  } else {
    const randomRejection = rejectionResponses[Math.floor(Math.random() * rejectionResponses.length)]
    return new StreamingTextResponse(
      new ReadableStream({
        start(controller) {
          controller.enqueue(randomRejection)
          controller.close()
        },
      }),
    )
  }
}
