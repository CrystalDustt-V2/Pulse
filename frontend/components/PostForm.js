import { useState } from 'react'
import axios from '../lib/axios'

export default function PostForm({ onCreated }) {
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  function onFileChange(e) {
    const f = e.target.files?.[0]
    setFile(f || null)
    if (f) setPreview(URL.createObjectURL(f))
    else setPreview(null)
  }

  async function submit(e) {
    e.preventDefault()
    if (!content && !file) return alert('Add some content or an image')
    const form = new FormData()
    form.append('content', content)
    if (file) form.append('image', file)
    setLoading(true)
    try {
      const res = await axios.post('/api/posts', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      const post = res.data.post
      setContent('')
      setFile(null)
      setPreview(null)
      if (onCreated) onCreated(post)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="card mb-4">
      <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="What's happening?" className="w-full p-2 rounded bg-bg/20 min-h-[80px]" />
      {preview && <img src={preview} alt="preview" className="w-full rounded mt-2" />}
      <div className="flex items-center gap-2 mt-2">
        <label className="px-3 py-1 rounded bg-bg/20 cursor-pointer">
          <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          Attach image
        </label>
        <button type="submit" disabled={loading} className="ml-auto bg-white text-black px-4 py-2 rounded">{loading ? 'Posting...' : 'Post'}</button>
      </div>
    </form>
  )
}
