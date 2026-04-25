// components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useEffect, useRef, useState } from 'react'
import { notificationAPI } from '../api/services'
import { getApiErrorMessage } from '../api/axios'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cartCount, refreshCartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const panelRef = useRef(null)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationError, setNotificationError] = useState('')

  // Refresh cart count whenever location changes (e.g., after adding item)
  useEffect(() => {
    if (user) refreshCartCount()
  }, [location, user])

  const loadNotifications = async () => {
    if (!user) return
    try {
      setNotificationError('')
      const [listRes, unreadRes] = await Promise.all([
        notificationAPI.getAll(),
        notificationAPI.getUnreadCount(),
      ])
      setNotifications(listRes?.data?.data || [])
      setUnreadCount(unreadRes?.data?.data?.unreadCount || 0)
    } catch (err) {
      setNotificationError(getApiErrorMessage(err, 'Could not load notifications'))
    }
  }

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    loadNotifications()
    const intervalId = setInterval(loadNotifications, 30000)
    return () => clearInterval(intervalId)
  }, [user, location.pathname])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  const formatDateTime = (value) => {
    if (!value) return ''
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ''
    return parsed.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const handleToggleNotifications = () => {
    setIsNotificationOpen(prev => !prev)
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id)
      await loadNotifications()
    } catch (err) {
      setNotificationError(getApiErrorMessage(err, 'Could not mark notification as read'))
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead()
      await loadNotifications()
    } catch (err) {
      setNotificationError(getApiErrorMessage(err, 'Could not mark all notifications as read'))
    }
  }

  return (
    <nav className="nav-shell">
      <div className="container nav-inner">
        {/* Logo */}
        <Link to="/" className="brand">
          <span className="brand-icon">🍔</span>
          <span className="brand-text">ByteSoul</span>
        </Link>

        {/* Nav Links */}
        {user && (
          <div className="nav-links">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/cart" className={isActive('/cart')}>
              Cart
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>
            <Link to="/orders" className={isActive('/orders')}>Orders</Link>
            {user.role === 'SELLER' && (
              <Link to="/seller" className={isActive('/seller')}>Seller</Link>
            )}
          </div>
        )}

        {/* User / Auth */}
        <div className="nav-actions">
          {user ? (
            <>
              <div className="notification-shell" ref={panelRef}>
                <button
                  type="button"
                  className="notification-bell"
                  onClick={handleToggleNotifications}
                  aria-label="Notifications"
                >
                  <span>🔔</span>
                  {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                </button>

                {isNotificationOpen && (
                  <div className="notification-panel">
                    <div className="notification-header">
                      <h4>Notifications</h4>
                      <button type="button" className="notification-text-btn" onClick={handleMarkAllRead}>Mark all read</button>
                    </div>

                    {notificationError && <p className="notification-error">{notificationError}</p>}

                    {!notificationError && notifications.length === 0 && (
                      <p className="notification-empty">No notifications yet.</p>
                    )}

                    {notifications.slice(0, 8).map((item) => (
                      <div key={item.id} className={`notification-item ${item.read ? '' : 'unread'}`}>
                        <div className="notification-row">
                          <p className="notification-title">{item.title}</p>
                          {!item.read && (
                            <button
                              type="button"
                              className="notification-text-btn"
                              onClick={() => handleMarkRead(item.id)}
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                        <p className="notification-message">{item.message}</p>
                        <p className="notification-time">{formatDateTime(item.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <span className="user-chip">Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
            </>
          ) : !isAuthPage ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
