import { useState, useEffect, useRef } from 'react'
import API from '../api'
import { MdNotificationsNone, MdOutlineNotificationsActive } from 'react-icons/md'

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
      new_arrival: '✦',
      general: '✦'
    }
    return icons[type] || '✦'
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Professional Studio Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-1.5 sm:p-2 hover:bg-[#F5F4F1] rounded transition text-[#181A18] flex items-center justify-center cursor-pointer"
        aria-label="Studio Notifications"
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
      >
        <MdNotificationsNone className="text-xl sm:text-2xl text-[#181A18]" />
        {unreadCount > 0 && (
          <span
            style={{ background: "#23483D", color: "#FFFFFF" }}
            className="absolute -top-0.5 -right-0.5 text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold border border-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel with Mobile-Safe Viewport Positioning */}
      {isOpen && (
        <div className="fixed sm:absolute top-16 sm:top-[115%] right-3 left-3 sm:left-auto sm:right-0 sm:w-80 max-h-[440px] bg-white border border-[#E7E7E2] rounded-[4px] shadow-2xl z-[1000] overflow-hidden flex flex-col animate-fade-in font-sans">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#E7E7E2] bg-white flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A48855]" />
              <strong className="text-xs uppercase tracking-[0.14em] font-semibold text-[#181A18]">Studio Dispatch</strong>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-[#23483D] hover:underline font-semibold cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[380px] divide-y divide-[#E7E7E2]/60">
            {loading ? (
              <div className="py-8 text-center text-xs text-[#8A8D88] animate-pulse">
                Fetching notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center px-4">
                <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-[#FAF6EE] border border-[#EAE4D6] flex items-center justify-center text-[#A48855]">
                  <MdOutlineNotificationsActive className="text-lg" />
                </div>
                <p className="text-xs font-medium text-[#181A18]">All caught up</p>
                <p className="text-[11px] text-[#8A8D88] mt-0.5">No unread notifications at this time.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 transition cursor-pointer flex items-start gap-3 ${
                    n.is_read ? 'bg-white hover:bg-[#FAF6EE]/50' : 'bg-[#FAF6EE] hover:bg-[#F5EEDB] border-l-2 border-[#23483D]'
                  }`}
                >
                  <span className="text-sm shrink-0 mt-0.5 text-[#A48855]">
                    {typeIcon(n.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-xs truncate ${n.is_read ? 'font-medium text-[#181A18]' : 'font-semibold text-[#181A18]'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-[#8A8D88] shrink-0 font-mono">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#676A65] leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A48855] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
