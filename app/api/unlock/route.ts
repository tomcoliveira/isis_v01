import { NextResponse } from "next/server"

// Mapeamento de códigos para modos e mensagens de boas-vindas
const codeMap: Record<string, { mode: string; message: string }> = {
  "sou eu": {
    mode: "unlocked",
    message: "Acesso total concedido. Olá! Sou a Isis, como posso ajudar hoje?",
  },
  "hum...": {
    mode: "fast",
    message: "Entendido. Serei rápida e direta.",
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

// Lista de respostas criativas para códigos inválidos - AGORA EXPANDIDA
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

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (code in codeMap) {
      const { mode, message } = codeMap[code]
      return NextResponse.json({ success: true, mode, message })
    } else {
      // Escolhe uma resposta aleatória da lista de rejeições
      const randomRejection = rejectionResponses[Math.floor(Math.random() * rejectionResponses.length)]
      return NextResponse.json({ success: false, message: randomRejection }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Erro no servidor." }, { status: 500 })
  }
}
