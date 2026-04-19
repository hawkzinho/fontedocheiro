import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useIdleLogout(timeoutMs = 2 * 60 * 60 * 1000) {
  useEffect(() => {
    let timer;

    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        supabase.auth.signOut();
      }, timeoutMs);
    };

    ['click', 'keydown', 'mousemove', 'touchstart'].forEach((eventName) =>
      window.addEventListener(eventName, reset)
    );

    reset();

    return () => {
      window.clearTimeout(timer);
      ['click', 'keydown', 'mousemove', 'touchstart'].forEach((eventName) =>
        window.removeEventListener(eventName, reset)
      );
    };
  }, [timeoutMs]);
}
