// TawkToScript.tsx
import { useEffect } from 'react';

export function TawkToScript() {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/650376840f2b18434fd897f2/1haaoduf8';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);

    // Cleanup: remove script on component unmount if needed
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
