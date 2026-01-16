// src/modules/accessControl/.../accessControl.container.ts

/**
 * Legacy hook (tsyringe removed).
 *
 * This remains as a no-op so older bootstrap code that calls
 * registerAccessControlModule() doesn't break.
 *
 * IMPORTANT:
 * Use explicit wiring (moduleFactory/buildAccessControlUseCases) instead of DI.
 */
export function registerAccessControlModule(): void {
  // no-op
}
