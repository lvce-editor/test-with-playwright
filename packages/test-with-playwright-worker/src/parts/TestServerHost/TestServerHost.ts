// Keep the server bind address and browser URLs on the same address family.
// Chromium can fall back to IPv4 even when Node resolved localhost to ::1.
export const testServerHost = '127.0.0.1'
