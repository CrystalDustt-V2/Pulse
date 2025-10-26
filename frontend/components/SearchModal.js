import Link from "next/link";
import { useState } from "react";
import axios from "../lib/axios";

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    const q = e.target.value;
    setQuery(q);
    setError("");
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      // Example: search users and posts
      const [usersRes, postsRes] = await Promise.all([
        axios.get(`/api/search/users?q=${encodeURIComponent(q)}`),
        axios.get(`/api/search/posts?q=${encodeURIComponent(q)}`)
      ]);
      setResults([
        ...usersRes.data.users.map(u => ({ type: "user", ...u })),
        ...postsRes.data.posts.map(p => ({ type: "post", ...p }))
      ]);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("Search feature is currently unavailable. Please contact support or try again later.");
      } else {
        setError("Search failed. Please check your connection or try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative bg-black rounded shadow-lg p-6 w-full max-w-md z-10">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-xl font-bold mb-4">Search</h2>
        <input
          type="text"
          className="border rounded p-2 w-full mb-4 text-black"
          placeholder="Search users, posts..."
          value={query}
          onChange={handleSearch}
          autoFocus
        />
        {loading && <div className="text-gray-500">Searching...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <ul className="mt-2">
          {results.map((r, i) => (
            <li key={i} className="mb-2">
              {r.type === "user" ? (
                <Link href={`/profile/${r.username}`} legacyBehavior>
                  <a className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded">
                    <img src={r.avatar || "/default-avatar.png"} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-semibold">{r.username}</span>
                  </a>
                </Link>
              ) : (
                <Link href={`/post/${r.id}`} legacyBehavior>
                  <a className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded">
                    <span className="font-semibold">Post:</span>
                    <span className="truncate">{r.content}</span>
                  </a>
                </Link>
              )}
            </li>
          ))}
          {!loading && !results.length && query && <li className="text-gray-500">No results found.</li>}
        </ul>
      </div>
    </div>
  );
}