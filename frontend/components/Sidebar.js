import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from "react";
import SearchModal from './SearchModal';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Profile', href: '/profile' },
  { name: 'Settings', href: '/settings' }
];

export default function Sidebar() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-black border-r border-gray-200 flex flex-col p-4 z-20 min-h-screen hidden md:flex">
      <div className="mb-8 text-2xl font-bold text-blue-600 flex items-center justify-between">
        Pulse
        <button
          className="ml-2 text-white hover:text-blue-400 p-1 rounded focus:outline-none"
          title="Search"
          onClick={() => setSearchOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} legacyBehavior>
            <a className={`px-4 py-2 rounded transition-colors ${router.pathname === item.href ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-white-700'}`}>{item.name}</a>
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-8 text-xs text-white-400">© {new Date().getFullYear()} Pulse</div>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </aside>
  );
}