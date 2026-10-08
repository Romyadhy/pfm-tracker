import { redirect } from 'next/navigation';

export default function Home() {
  // ponytail: redirect root straight to dashboard (handled by middleware if unauthenticated)
  redirect('/dashboard');
}
