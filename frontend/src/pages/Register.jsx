// pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm]    = useState({ name: '', email: '', mobileNumber: '', password: '', confirm: '', role: 'USER' })
  const [error, setError]  = useState('')
  const { register, loading } = useAuth()
  const navigate           = useNavigate()

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const result = await register(form.name, form.email, form.mobileNumber, form.password, form.role)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card rise-in">
        {/* Header */}
        <div style={styles.header}>
          <div className="auth-logo">🍔</div>
            <h1 className="auth-title">Join ByteSoul</h1>
          <p className="auth-subtitle">Create your account to start ordering or selling</p>
          <p style={styles.helperText}>Seller accounts do not need restaurant details here. You can add restaurants after logging in.</p>
        </div>

        {/* Error */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              className="form-input"
              type="tel"
              name="mobileNumber"
              placeholder="919876543210"
              value={form.mobileNumber}
              onChange={handleChange}
              pattern="^[0-9]{10,13}$"
              title="Enter 10 to 13 digits. Example: 9876543210 or 919876543210"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-input"
              type="password"
              name="confirm"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select
              className="form-input"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="USER">Customer</option>
              <option value="SELLER">Seller</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: '8px', padding: '14px' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footnote">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  header: { textAlign: 'center', marginBottom: '32px' },
}
