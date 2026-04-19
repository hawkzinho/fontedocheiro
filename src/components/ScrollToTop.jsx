import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (location.hash) {
        const element = document.querySelector(location.hash);

        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 30);

    return () => window.clearTimeout(id);
  }, [location.pathname, location.hash]);

  return null;
}
