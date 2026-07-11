/**
 * ⛔ FIREBASE FCM HAS BEEN REMOVED FROM HELPMEMAN
 *
 * Firebase Cloud Messaging is no longer used on the frontend.
 * Push notifications now use the native browser Push API.
 *
 * Replacement: lib/push.ts
 *
 * If you see an import of this file, it is a bug. Change to: import from '@/lib/push'
 */

// Re-export from the new push module for backward compatibility during transition
export { requestPushPermissionAndRegister, unregisterPushSubscription, listenForForegroundMessages, isPushSupported } from './push';
