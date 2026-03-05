import { redirect } from 'next/navigation'

/**
 * Search is now on the home page above the tracking cards.
 * Redirect /search to home.
 */
export default function SearchPage() {
  redirect('/')
}
