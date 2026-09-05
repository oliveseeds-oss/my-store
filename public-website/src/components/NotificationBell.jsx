import { useState, useEffect, useRef } from 'react'
import API from '../api'

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)

  // Fetch unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchUnreadCount = async () => {
    const member = JSON.parse(localStorage.getItem('member') || '{}')
    const admin = JSON.parse(localStorage.getItem('admin') || '{}')
    const token = member.token || admin.token || (typeof admin === 'string' ? admin : null)
    if (!token) {
      setUnreadCount(0)
      return
    }
    try {
      const res = await API.get('/notifications/unread-count')
      setUnreadCount(res.data.count || 0)
    } catch (err) {
      // Silent fail — do not show error to user
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setUnreadCount(0);
      }
    }
  }

  const fetchNotifications = async () => {
    const member = JSON.parse(localStorage.getItem('member') || '{}')
    const admin = JSON.parse(localStorage.getItem('admin') || '{}')
    const token = member.token || admin.token || (typeof admin === 'string' ? admin : null)
    if (!token) {
      setNotifications([])
      return
    }
    setLoading(true)
    try {
      const res = await API.get('/notifications')
      setNotifications(res.data || [])
    } catch (err) {
      // Silent fail
    }
    setLoading(false)
  }

  const handleBellClick = () => {
    const nextState = !isOpen
    setIsOpen(nextState)
    if (nextState) fetchNotifications()
  }

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {}
  }

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all')
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
    } catch (err) {}
  }

  const timeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const typeIcon = (type) => {
    const icons = {
      order_confirmed: '📦',
      order_shipped: '🚚',
      order_out_for_delivery: '🛵',
      order_delivered: '🎉',
      new_arrival: '✨',
      general: '🔔'
    }
    return icons[type] || '🔔'
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px',
          fontSize: '1.4rem'
        }}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: '#e53e3e',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '110%',
          width: '320px',
          maxHeight: '420px',
          overflowY: 'auto',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 1000,
          border: '1px solid #eee'
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            background: 'white'
          }}>
            <strong style={{ color: '#333' }}>Notifications</strong>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6B7C3F',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#888' }}>
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '2rem' }}>🔔</div>
              <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f5f5f5',
                  background: n.is_read ? 'white' : '#f0f4e8',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.2rem' }}>{typeIcon(n.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: n.is_read ? 'normal' : 'bold',
                      fontSize: '0.9rem',
                      marginBottom: '2px',
                      color: '#222'
                    }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>
                      {timeAgo(n.created_at)}
                    </div>
                  </div>
                  {!n.is_read && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#6B7C3F',
                      marginTop: '4px',
                      flexShrink: 0
                    }}/>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
