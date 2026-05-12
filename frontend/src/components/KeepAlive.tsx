"use client";
import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function KeepAlive() {
  useEffect(() => {
    // Ping immediately on mount to wake up the backend
    const ping = () => fetch(`${API_URL.replace('/api/v1', '')}/health`, { method: 'GET' }).catch(() => {});
    ping();
    // Then ping every 10 minutes to prevent spin-down
    const interval = setInterval(ping, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
