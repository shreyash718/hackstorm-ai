'use client';

import { useEffect } from 'react';

const RELOAD_KEY = 'next-static-reload-attempted';
const RELOAD_COOLDOWN_MS = 30000;

function isNextStaticUrl(value) {
  return typeof value === 'string' && value.includes('/_next/static/');
}

function isChunkLoadError(reason) {
  const message = String(reason?.message || reason || '');
  return message.includes('ChunkLoadError') || message.includes('Loading chunk');
}

export function ChunkReloadGuard() {
  useEffect(() => {
    const reloadOnce = () => {
      const lastAttempt = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      if (Date.now() - lastAttempt < RELOAD_COOLDOWN_MS) return;
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      window.location.reload();
    };

    const handleResourceError = (event) => {
      const target = event.target;
      const url = target?.src || target?.href;

      if (isNextStaticUrl(url)) {
        reloadOnce();
      }
    };

    const handleRejectedChunk = (event) => {
      if (isChunkLoadError(event.reason)) {
        reloadOnce();
      }
    };

    window.addEventListener('error', handleResourceError, true);
    window.addEventListener('unhandledrejection', handleRejectedChunk);

    return () => {
      window.removeEventListener('error', handleResourceError, true);
      window.removeEventListener('unhandledrejection', handleRejectedChunk);
    };
  }, []);

  return null;
}
