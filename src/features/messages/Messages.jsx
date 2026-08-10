import React, { useState } from 'react'
import { Send, ArrowLeft } from 'lucide-react'
import { Card, Eyebrow, SEOMeta, EmptyState, DemoLabel } from '../../components/UI.jsx'
import { DEMO_MESSAGES } from '../../data/demo.js'

function ThreadList({ threads, activeId, onSelect }) {
  if (threads.length === 0) {
    return <EmptyState icon={Send} title="No messages yet" description="When employers reach out, you'll see them here." />
  }
  return (
    <div className="thread-list" role="list">
      {threads.map(t => (
        <button
          key={t.id}
          className={`thread-item${t.id === activeId ? ' active' : ''}${t.unread > 0 ? ' unread' : ''}`}
          onClick={() => onSelect(t)}
          role="listitem"
          aria-label={`Message from ${t.with}. ${t.unread > 0 ? `${t.unread} unread.` : ''} ${t.lastMessage}`}
        >
          <div className="thread-avatar" aria-hidden="true">{t.withInitials}</div>
          <div className="thread-info">
            <div className="thread-row">
              <strong>{t.with}</strong>
              <span className="thread-time">{t.time}</span>
            </div>
            <p className="thread-preview">{t.lastMessage}</p>
          </div>
          {t.unread > 0 && <span className="unread-dot" aria-hidden="true">{t.unread}</span>}
        </button>
      ))}
    </div>
  )
}

function Thread({ thread, onBack, onSend }) {
  const [text, setText] = useState('')
  const [localMsgs, setLocalMsgs] = useState(thread.messages)

  const handleSend = e => {
    e.preventDefault()
    if (!text.trim()) return
    setLocalMsgs(m => [...m, { id: `m-${Date.now()}`, from: 'me', text, time: 'Now' }])
    setText('')
  }

  return (
    <div className="thread-view" aria-label={`Conversation with ${thread.with}`}>
      <div className="thread-header">
        <button className="back-button" onClick={onBack} aria-label="Back to messages">
          <ArrowLeft size={17} aria-hidden="true" /> Back
        </button>
        <div className="thread-with">
          <div className="thread-avatar sm" aria-hidden="true">{thread.withInitials}</div>
          <strong>{thread.with}</strong>
        </div>
      </div>
      <div className="message-list" role="log" aria-live="polite" aria-label="Messages">
        {localMsgs.map(m => (
          <div key={m.id} className={`message-bubble ${m.from === 'me' ? 'outgoing' : 'incoming'}`}>
            <p>{m.text}{m.from !== 'me' && <> <DemoLabel /></>}</p>
            <time className="msg-time">{m.time}</time>
          </div>
        ))}
      </div>
      <form className="message-input-row" onSubmit={handleSend} aria-label="Send message">
        <input
          className="field-input message-input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message…"
          aria-label="Message"
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!text.trim()}
          aria-label="Send message"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}

export default function Messages() {
  const [threads] = useState(DEMO_MESSAGES)
  const [active, setActive] = useState(null)

  return (
    <div className="messages-page" aria-label="Messages">
      <SEOMeta title="Messages" description="Your BlueJob conversations with employers and contractors." />
      {active ? (
        <Thread thread={active} onBack={() => setActive(null)} />
      ) : (
        <>
          <h1>Messages</h1>
          <p className="muted">Conversations with employers. <DemoLabel /></p>
          <ThreadList threads={threads} activeId={active?.id} onSelect={setActive} />
        </>
      )}
    </div>
  )
}
