import type { ICache } from './cache'

type Entry<V> = { v: V; expiresAt?: number; t: number } // t = last touch (for simple LRU-ish eviction)

export class MemoryCache<V = unknown> implements ICache<V> {
  private store = new Map<string, Entry<V>>()
  private max: number

  constructor(opts?: { max?: number }) {
    this.max = Math.max(1, opts?.max ?? 500)
  }

  get(key: string): V | undefined {
    const e = this.store.get(key)
    if (!e) return undefined
    if (e.expiresAt && e.expiresAt <= Date.now()) {
      this.store.delete(key)
      return undefined
    }
    e.t = Date.now() // touch
    return e.v
  }

  set(key: string, value: V, ttlMs?: number): void {
    const expiresAt = ttlMs ? Date.now() + ttlMs : undefined
    const entry: Entry<V> = { v: value, expiresAt, t: Date.now() }
    this.store.set(key, entry)
    this.evictIfNeeded()
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  private evictIfNeeded() {
    if (this.store.size <= this.max) return
    // naive LRU-ish: evict the oldest `t`
    let oldestKey: string | undefined
    let oldestT = Infinity
    for (const [k, e] of this.store) {
      if (e.t < oldestT) {
        oldestT = e.t
        oldestKey = k
      }
    }
    if (oldestKey) this.store.delete(oldestKey)
  }
}
