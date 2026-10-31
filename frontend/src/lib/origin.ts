/**
 * Proof that a request to the API comes from this website's server: the host lets requests carrying
 * this secret header through its rate limit (Vercel has no fixed outgoing IPs on our plan).
 * Server-side only: API_ORIGIN_KEY has no NEXT_PUBLIC_ prefix, so it never reaches the browser.
 */
export const ORIGIN_HEADERS: Record<string, string> = process.env.API_ORIGIN_KEY ? { "X-Toubkal-Origin": process.env.API_ORIGIN_KEY } : {};
