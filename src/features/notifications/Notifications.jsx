import React, { useState } from 'react'
import { Bell, Briefcase, MessageCircle, Star, ArrowLeft, CheckCheck } from 'lucide-react'
import { Eyebrow, SEOMeta, EmptyState, DemoLabel } from '../../components/UI.jsx'
import { DEMO_NOTIFICATIONS } from '../../data/demo.js'

const TYPE_ICON = {
  match: Briefcase,
  message: MessageCircle,
  evidence: Star,
  score: Bell,
}

export default function Notifications({ onBack, notifications: propNotifs, onMarkRead }) {
  const [notifs, setNotifs] = useState(propNotifs || DEMO_NOTIFICATIONS)

  const markAll = () => {
    const updated = notifs.map(n => ({ ...n, read: true }))
    setNotifs(updated)
    if (onMarkRead) onMarkRead()
  }

  const markOne = id => {
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x))
  }

  const unread = notifs.filter(n => !n.read).length

  return (
    <div className="notifications-page" aria-label="Notifications">
      <SEOMeta title="Notifications" />
      <div className="page-top">
        <button className="back-button" onClick={onBack} aria-label="Back"><ArrowLeft size={17} aria-hidden="true" /> Back</button>
        {unread > 0 && (
          <button className="text-button small" onClick={markAll} aria-label="Mark all as read">
            <CheckCheck size={15} aria-hidden="true" /> Mark all read
          </button>
        )}
      </div>
      <h1>Notifications</h1>
      {notifs.length === 0 ? (
        <EmptyState icon={Bell} title="All caught up" description="No new notifications." />
      ) : (
        <div className="notif-list" role="list">
          {notifs.map(n => {
            const Icon = TYPE_ICON[n.type] || Bell
            return (
              <button
                key={n.id}
                className={`notif-row${n.read ? '' : ' unread'}`}
                onClick={() => markOne(n.id)}
                role="listitem"
                aria-label={`${n.read ? '' : 'Unread: '}${n.text}`}
              >
                <div className="notif-icon" aria-hidden="true"><Icon size={17} /></div>
                <div className="notif-body">
                  <p>{n.text} <DemoLabel /></p>
                  <time className="notif-time">{n.time}</time>
                </div>
                {!n.read && <span className="unread-dot" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
