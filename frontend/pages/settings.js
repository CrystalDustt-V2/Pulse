import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../lib/axios";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const [username, setUsername] = useState(user?.username || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
    await axios.put("/api/users/me", { username, bio, avatar });
      setUser({ ...user, username, bio, avatar });
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-black rounded shadow text-center">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={()=>setOpen(true)}>Open Settings</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 transition-opacity" onClick={()=>setOpen(false)}></div>
      <div className="relative max-w-xl w-full mx-auto p-6 bg-gray rounded shadow z-10">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold" onClick={()=>setOpen(false)} aria-label='Close'>&times;</button>
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="font-semibold">Username</label>
          <input
            className="border rounded p-2 text-black"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label className="font-semibold">Bio</label>
          <textarea
            className="border rounded p-2 text-black"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />
          <label className="font-semibold">Avatar</label>
          <input
            className="border rounded p-2 text-black"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              // Simple preview, cropping integration can be added later
              const reader = new FileReader();
              reader.onload = (ev) => setAvatar(ev.target.result);
              reader.readAsDataURL(file);
            }}
          />
          {avatar && (
            <img src={avatar} alt="avatar preview" className="w-16 h-16 rounded-full object-cover mt-2" />
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          {message && <div className="mt-2 text-sm text-green-600">{message}</div>}
        </form>
      </div>
    </div>
  );
}