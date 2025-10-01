export interface ICache<V = unknown> {
  get(key: string): V | undefined
  set(key: string, value: V, ttlMs?: number): void
  delete(key: string): void
  clear(): void
}
