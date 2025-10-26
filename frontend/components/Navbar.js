import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth()
  return (
    <nav className="w-full p-4 border-b border-bg/40">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/">Pulse</Link>
          {user && <div className="text-sm text-muted">Logged in as <span className="font-medium">{user.username}</span></div>}
        </div>
        <div className="flex gap-3 items-center">
          {!user ? (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          ) : (
            <button onClick={async ()=>{ await signOut(); }} className="text-sm">Sign Out</button>
          )}
        </div>
      </div>
    </nav>
  )
}
