import { useRouter } from "next/router";
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(post.likes?.length > 0)
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  const imageSrc = post.image ? (post.image.startsWith('http') ? post.image : `${base}${post.image}`) : null
  const { user } = useAuth()
  const router = useRouter();

  const isOwner = user && (user.id === post.userId)
  const isAdmin = user && user.role === 'ADMIN'

  async function toggleLike() {
    try {
      await axios.post(`/api/posts/${post.id}/like`)
      setLiked(!liked)
    } catch (e) { console.error(e) }
  }

  function renderContentWithLinks(content) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{part}</a>;
      }
      return part;
    });
  }
  return (
    <article className="card">
        <div className="flex items-center gap-3 mb-2">
          {post.user?.avatar ? (
            <img
              src={post.user.avatar}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                router.push(`/profile/${post.user.username}`);
              }}
            />
          ) : (
            <div 
            className="w-10 h-10 rounded-full bg-muted" 
            onClick={() => router.push(`/profile/${post.user?.username || post.username}`)}
            />
          )}
          <span
            className="font-semibold cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              router.push(`/profile/${post.user?.username || post.username}`);
            }}
          >
            {post.user?.username || post.username}
          </span>
        </div>
        <div className="text-white-800 mb-2">{renderContentWithLinks(post.content)}</div>
  {imageSrc && <img src={imageSrc} alt="post" className="w-full rounded mb-2" />}
      <div className="flex gap-4 items-center">
        <button onClick={toggleLike} className={`px-3 py-1 rounded ${liked ? 'bg-white text-black' : 'bg-bg/20'}`}>{liked ? 'Liked' : 'Like'}</button>
        <span className="text-sm text-muted">{Array.isArray(post.likes) ? post.likes.length : 0} Likes</span>
        <a href={`/post/${post.id}`} className="px-3 py-1 rounded bg-bg/20">Comments</a>
        <button
          className="px-3 py-1 rounded bg-blue-500 text-white"
          onClick={async () => {
            const url = `${window.location.origin}/post/${post.id}`;
            if (navigator.share) {
              try {
                await navigator.share({ url, title: 'Check out this post!' });
              } catch (e) {}
            } else {
              try {
                await navigator.clipboard.writeText(url);
                alert('Post link copied to clipboard!');
              } catch (e) {
                alert('Failed to copy link');
              }
            }
          }}
        >Share</button>
        {(isOwner || isAdmin) && (
          <button onClick={async ()=>{ if (!confirm('Delete this post?')) return; try{ await axios.delete(`/api/posts/${post.id}`); window.location.reload(); }catch(e){alert('Delete failed')} }} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
        )}
      </div>
    </article>
  );
}
