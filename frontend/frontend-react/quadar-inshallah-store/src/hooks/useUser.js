import { useState, useEffect } from "react";
import api from "../api/axios";

export const useUser = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/users/profile");
      setProfile(data);
    } catch (err) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    const { data } = await api.put("/users/profile", updates);
    setProfile(data);
    return data;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, fetchProfile, updateProfile };
};