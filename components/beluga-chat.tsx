'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'

// The beluga clips are served from the Zoo chat origin; a static site can point
// straight at them (video playback is not CORS-gated). Emotion clips are named
// for the mood Blue closes each reply with; the swim clips loop when it is idle.
const CLIP = 'https://chat.zoo.ngo/bg_video'
const SWIM = ['relactation0', 'relactation1', 'relactation2', 'relactation3', 'relactation4']
const swimUrl = () => `${CLIP}/static/${SWIM[Math.floor(Math.random() * SWIM.length)]}.mp4`
const emotionUrl = (e: string) => `${CLIP}/emotion/${e}.mp4`

// Split a streaming reply into its prose and the trailing `emotion: X` tag.
function split(s: string): [string, string?] {
  const i = s.lastIndexOf('emotion:')
  if (i === -1) return [s]
  const emo = s.slice(i + 8).trim().split(/\s/)[0]
  return [s.slice(0, i).trimEnd(), emo || undefined]
}

type Msg = { id: string; role: 'user' | 'assistant'; content: string }
let seq = 0
const uid = () => `m${++seq}`

export function BelugaChat() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)

  // Two stacked videos crossfade: the hidden one loads the next clip, then we
  // flip which is shown so there is never a black frame between moods.
  const [srcA, setSrcA] = useState<string>()
  const [srcB, setSrcB] = useState<string>()
  const [showA, setShowA] = useState(true)
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scroller = useRef<HTMLDivElement>(null)

  const play = (url: string) => (showA ? setSrcB(url) : setSrcA(url))
  const onLoaded = () => setShowA((v) => !v)
  const onError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!e.currentTarget.src.includes('relactation')) play(swimUrl())
  }

  const armIdle = () => {
    if (idle.current) clearTimeout(idle.current)
    const loop = () => {
      play(swimUrl())
      idle.current = setTimeout(loop, 12000)
    }
    idle.current = setTimeout(loop, 25000)
  }

  useEffect(() => {
    play(swimUrl())
    armIdle()
    return () => {
      if (idle.current) clearTimeout(idle.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    const outgoing: Msg[] = [...messages, { id: uid(), role: 'user', content: text }]
    const assistant: Msg = { id: uid(), role: 'assistant', content: '' }
    setMessages([...outgoing, assistant])
    setBusy(true)
    if (idle.current) clearTimeout(idle.current)

    try {
      const res = await fetch('/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: outgoing.map((m) => ({ role: m.role, content: m.content })) }),
      })
      if (!res.ok || !res.body) throw new Error(await res.text())
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let full = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        full += dec.decode(value, { stream: true })
        const [body, emo] = split(full)
        if (emo) play(emotionUrl(emo))
        setMessages((m) => m.map((x) => (x.id === assistant.id ? { ...x, content: body } : x)))
      }
    } catch {
      setMessages((m) =>
        m.map((x) =>
          x.id === assistant.id ? { ...x, content: 'Blue lost the thread — try again in a moment.' } : x,
        ),
      )
    } finally {
      setBusy(false)
      armIdle()
    }
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg-primary">
      <video
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={onLoaded}
        onError={onError}
        src={srcA}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${showA ? 'opacity-100' : 'opacity-0'}`}
      />
      <video
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={onLoaded}
        onError={onError}
        src={srcB}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${showA ? 'opacity-0' : 'opacity-100'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />

      <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col px-4">
        <header className="flex items-center gap-3 py-5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand shadow-[0_0_12px_var(--brand)]" />
          <h1 className="font-mono text-sm tracking-widest text-text-primary uppercase">Blue · Zoo</h1>
        </header>

        <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="max-w-md text-2xl font-semibold text-text-primary text-balance">
                Hi, I&apos;m Blue the beluga.
              </p>
              <p className="mt-2 max-w-md text-text-secondary">
                Ask me about endangered species, decentralized science, or Zoo. Watch how I feel as we talk.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed backdrop-blur-md ${
                    m.role === 'user'
                      ? 'bg-brand/90 text-black'
                      : 'border border-white/10 bg-black/40 text-text-primary'
                  }`}
                >
                  {m.content || (busy ? '…' : '')}
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="mb-5 flex items-end gap-2 rounded-2xl border border-white/10 bg-black/50 p-2 backdrop-blur-xl"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            rows={1}
            placeholder="Talk to Blue…"
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-[15px] text-text-primary outline-none placeholder:text-text-muted"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-black transition-opacity disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
