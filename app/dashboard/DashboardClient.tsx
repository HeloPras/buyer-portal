'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Property } from '@prisma/client'
import type { JWTPayload } from '@/lib/auth'
import styles from './dashboard.module.css'

interface Props {
  user: JWTPayload
  properties: Property[]
  initialFavouriteIds: string[]
}

function formatPrice(price: number) {
  if (price >= 10_000_000) return `NPR ${(price / 10_000_000).toFixed(1)}Cr`
  if (price >= 100_000) return `NPR ${(price / 100_000).toFixed(0)}L`
  return `NPR ${price.toLocaleString()}`
}

const TYPE_COLORS: Record<string, string> = {
  Apartment: '#e8f0fe',
  Villa: '#fce8e6',
  Studio: '#e6f4ea',
  House: '#fff3e0',
  Penthouse: '#f3e8fd',
  Cottage: '#e0f2f1',
}

export default function DashboardClient({ user, properties, initialFavouriteIds }: Props) {
  const router = useRouter()
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set(initialFavouriteIds))
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all')
  const [isPending, startTransition] = useTransition()

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function toggleFavourite(propertyId: string) {
    const isFav = favouriteIds.has(propertyId)

    // Optimistic update
    setFavouriteIds((prev) => {
      const next = new Set(prev)
      isFav ? next.delete(propertyId) : next.add(propertyId)
      return next
    })

    try {
      const res = isFav
        ? await fetch(`/api/favourites/${propertyId}`, { method: 'DELETE' })
        : await fetch('/api/favourites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ propertyId }),
          })

      if (!res.ok) {
        // Revert on failure
        setFavouriteIds((prev) => {
          const next = new Set(prev)
          isFav ? next.add(propertyId) : next.delete(propertyId)
          return next
        })
        const data = await res.json()
        showToast(data.error ?? 'Something went wrong.', 'error')
        return
      }

      showToast(isFav ? 'Removed from saved.' : 'Saved to favourites!', 'success')
    } catch {
      setFavouriteIds((prev) => {
        const next = new Set(prev)
        isFav ? next.add(propertyId) : next.delete(propertyId)
        return next
      })
      showToast('Network error. Please try again.', 'error')
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    startTransition(() => { router.push('/login'); router.refresh() })
  }

  const displayed = activeTab === 'saved'
    ? properties.filter((p) => favouriteIds.has(p.id))
    : properties

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>BP</span>
            <span className={styles.brandName}>Buyer Portal</span>
          </div>

          <nav className={styles.nav}>
            <button
              className={`${styles.navItem} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>
              All properties
              <span className={styles.badge}>{properties.length}</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'saved' ? styles.active : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.567 3.067 2 5 2C6.105 2 7.09 2.528 7.75 3.35L8 3.667L8.25 3.35C8.91 2.528 9.895 2 11 2C12.933 2 14.5 3.567 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
              My favourites
              <span className={styles.badge}>{favouriteIds.size}</span>
            </button>
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{user.name[0].toUpperCase()}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>{user.role}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} disabled={isPending}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 12H3C2.448 12 2 11.552 2 11V3C2 2.448 2.448 2 3 2H5M9.5 9.5L12 7L9.5 4.5M12 7H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.heading}>
              {activeTab === 'saved' ? 'My favourites' : 'Browse properties'}
            </h1>
            <p className={styles.subheading}>
              {activeTab === 'saved'
                ? `${favouriteIds.size} saved propert${favouriteIds.size === 1 ? 'y' : 'ies'}`
                : `${properties.length} properties available`}
            </p>
          </div>
        </header>

        {displayed.length === 0 && activeTab === 'saved' && (
          <div className={styles.empty}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M20 33C20 33 5 24 5 14.5C5 9.806 8.806 6 13.5 6C16.26 6 18.725 7.318 20.25 9.375L20 9.667L19.75 9.375C21.275 7.318 23.74 6 26.5 6C31.194 6 35 9.806 35 14.5C35 24 20 33 20 33Z" stroke="var(--ink-light)" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            <p>No saved properties yet.</p>
            <button className="btn-ghost" onClick={() => setActiveTab('all')}>Browse all properties</button>
          </div>
        )}

        <div className={styles.grid}>
          {displayed.map((property) => {
            const isFav = favouriteIds.has(property.id)
            return (
              <article key={property.id} className={styles.card}>
                <div className={styles.cardImage} style={{ background: TYPE_COLORS[property.type] ?? '#f5f5f5' }}>
                  <span className={styles.typeLabel}>{property.type}</span>
                  <button
                    className={`${styles.heartBtn} ${isFav ? styles.hearted : ''}`}
                    onClick={() => toggleFavourite(property.id)}
                    aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M9 15C9 15 2 10.5 2 6C2 3.791 3.791 2 6 2C7.348 2 8.531 2.672 9.25 3.703L9 4L8.75 3.703C9.469 2.672 10.652 2 12 2C14.209 2 16 3.791 16 6C16 10.5 9 15 9 15Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        fill={isFav ? 'currentColor' : 'none'}
                      />
                    </svg>
                  </button>
                  <div className={styles.bedroomBadge}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="4" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M1 7h10M4 7V4a2 2 0 014 0v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{property.title}</h3>
                  <p className={styles.cardAddress}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1C4.067 1 2.5 2.567 2.5 4.5C2.5 7.5 6 11 6 11C6 11 9.5 7.5 9.5 4.5C9.5 2.567 7.933 1 6 1Z" stroke="currentColor" strokeWidth="1.2"/><circle cx="6" cy="4.5" r="1.25" stroke="currentColor" strokeWidth="1.2"/></svg>
                    {property.address}
                  </p>
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>{formatPrice(property.price)}</span>
                    <button
                      className={`${styles.saveBtn} ${isFav ? styles.saveBtnActive : ''}`}
                      onClick={() => toggleFavourite(property.id)}
                    >
                      {isFav ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {toast.type === 'success'
            ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          }
          {toast.msg}
        </div>
      )}
    </div>
  )
}
