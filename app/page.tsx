import type { Metadata } from 'next'
import { BelugaChat } from '@/components/beluga-chat'

export const metadata: Metadata = {
  title: 'Zoo Labs',
  description: 'Chat with Blue the beluga — Zoo AI for endangered species and decentralized science.',
}

export default function Home() {
  return <BelugaChat />
}
