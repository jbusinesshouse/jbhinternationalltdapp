import { useUser } from "@/context/UserContext";
import { fetchMyProfile, patchMyProfile } from "@/lib/catalogApi";
import { useCallback, useEffect, useState } from "react";

export const useProfile = () => {
  const { session, loading: authLoading } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!session) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchMyProfile();
      setProfile(res.profile);
    } catch {
      setProfile(null);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (authLoading) return;
    fetchProfile();
  }, [authLoading, fetchProfile]);

  const updateName = async (full_name: string) => {
    const res = await patchMyProfile({ full_name });
    if (res.profile) setProfile(res.profile);
    else setProfile((prev: any) => ({ ...prev, full_name }));
  };

  return { profile, loading: authLoading || loading, updateName, refetch: fetchProfile };
};
