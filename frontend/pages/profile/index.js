import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function ProfileRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.username) {
      router.replace(`/profile/${user.username}`);
    }
  }, [user, router]);

  return <div className="p-6">Loading profile...</div>;
}