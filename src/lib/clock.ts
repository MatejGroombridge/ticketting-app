/**
 * Fixed "now" for the mock data, so sales windows, expiries and deadlines look the same
 * whenever the demo is opened and render identically on server and client.
 * Replace with real time once data comes from the backend.
 */
export const NOW = new Date("2026-11-18T12:00:00+11:00").getTime()
