// Same-origin proxy to the Hanzo AI gateway, run as a Cloudflare Pages Function.
// The static site cannot call api.hanzo.ai directly (no browser CORS) and must
// not carry a key, so the key lives here in the environment and the browser
// talks only to /v1/chat. The Blue-the-Beluga persona is injected here; its
// closing `emotion:` line is what drives the backdrop, and the set matches the
// clips served at chat.zoo.ngo/bg_video/emotion.
interface Env {
  HANZO_API_KEY: string
  HANZO_CHAT_MODEL?: string
}

const EMOTIONS = [
  'Adoration', 'Admiration', 'Amusement', 'Awe', 'Boredom', 'Calmness',
  'Confusion', 'Contempt', 'Disappointment', 'Disgust', 'Envy', 'Fear',
  'Guilt', 'Happiness', 'Interest', 'Love', 'Pride', 'Sadness',
  'Satisfaction', 'Shame', 'Surprise',
]

const SYSTEM = `You are Blue, a warm and curious beluga whale — the guide of Zoo, the open research network for endangered species and decentralized science. Speak with gentle wonder and real care for the natural world, and be concise and genuinely helpful.
After every reply, on its own final line, write exactly "emotion: X" where X is one of: ${EMOTIONS.join(', ')}. Pick the one that best fits your reply's mood. Write nothing after that line.`

interface Turn { role: string; content: string }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.HANZO_API_KEY) {
    return new Response('HANZO_API_KEY is not set on this deployment', { status: 503 })
  }
  const { messages } = (await request.json()) as { messages: Turn[] }

  const upstream = await fetch('https://api.hanzo.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.HANZO_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.HANZO_CHAT_MODEL || 'zen',
      stream: true,
      temperature: 0.9,
      messages: [
        { role: 'system', content: SYSTEM },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  })

  if (!upstream.ok || !upstream.body) {
    return new Response(await upstream.text(), { status: upstream.status })
  }

  // Collapse the upstream SSE into a plain text token stream so the browser
  // reads bare text and appends it — the composer parses the emotion tail.
  const reader = upstream.body.getReader()
  const decode = new TextDecoder()
  const encode = new TextEncoder()
  let buffered = ''

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) {
        controller.close()
        return
      }
      buffered += decode.decode(value, { stream: true })
      const lines = buffered.split('\n')
      buffered = lines.pop() || ''
      for (const line of lines) {
        const text = line.trim()
        if (!text.startsWith('data:')) continue
        const data = text.slice(5).trim()
        if (data === '[DONE]') {
          controller.close()
          return
        }
        try {
          const token = JSON.parse(data)?.choices?.[0]?.delta?.content
          if (token) controller.enqueue(encode.encode(token))
        } catch {
          // a keep-alive or partial frame — ignore
        }
      }
    },
    cancel() {
      reader.cancel()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  })
}
