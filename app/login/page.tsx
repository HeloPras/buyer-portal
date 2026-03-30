'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './auth.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>BP</span>
          <span className={styles.brandName}>Buyer Portal</span>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to view your saved properties</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="msg-error">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.footer}>
          No account?{' '}
          <Link href="/register" className={styles.link}>Create one</Link>
        </p>
      </div>

      <div className={styles.visual}>
        <div className={styles.visualInner}>
          <blockquote className={styles.quote}>
            "Find the home that fits your life, not the other way around."
          </blockquote>
          <div className={styles.stats}>
            <div className={styles.stat}><span className={styles.statNum}>6</span><span className={styles.statLabel}>Properties</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>3</span><span className={styles.statLabel}>Cities</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>∞</span><span className={styles.statLabel}>Possibilities</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
