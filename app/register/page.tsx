'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../login/auth.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
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
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Start saving properties you love</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              autoComplete="name"
            />
          </div>

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
            <label htmlFor="password">Password <span style={{ color: 'var(--ink-light)', fontWeight: 400 }}>(min. 8 chars)</span></label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="msg-error">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link href="/login" className={styles.link}>Sign in</Link>
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
