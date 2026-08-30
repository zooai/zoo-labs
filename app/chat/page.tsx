import type { Metadata } from 'next'
import { BelugaChat } from '@/components/beluga-chat'

export const metadata: Metadata = {
  title: 'Blue · Zoo',
  description: 'Chat with Blue the beluga — Zoo AI for endangered species and decentralized science.',
}

export default function ChatPage() {
  return <BelugaChat />
}
