import React, { useEffect, useRef } from 'react';

interface CustomReCAPTCHAProps {
  siteKey: string;
  onChange: (token: string | null) => void;
  onExpired?: () => void;
}

// Declare the grecaptcha property on the global window object
declare global {
  interface Window {
    grecaptcha: any;
  }
}

const CustomReCAPTCHA: React.FC<CustomReCAPTCHAProps> = ({ siteKey, onChange, onExpired }) => {
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the reCAPTCHA script if it isn't already loaded
    const loadScript = (): Promise<void> =>
      new Promise<void>((resolve) => {
        if (document.querySelector('#recaptcha-script')) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.id = 'recaptcha-script';
        // Note: using render=explicit for explicit rendering mode
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

    // Wait until window.grecaptcha and its render function are available
    const waitForGrecaptcha = (): Promise<void> =>
      new Promise((resolve) => {
        const check = () => {
          if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });

    // Load the script, wait for grecaptcha to be ready, then render the widget
    loadScript()
      .then(waitForGrecaptcha)
      .then(() => {
        if (window.grecaptcha && recaptchaRef.current) {
          window.grecaptcha.render(recaptchaRef.current, {
            sitekey: siteKey, // use the passed siteKey (must be lowercase "sitekey")
            callback: (token: string) => onChange(token),
            'expired-callback': () => {
              onExpired?.();
              onChange(null);
            },
          });
        }
      });

    // Capture the current ref for cleanup
    const currentRef = recaptchaRef.current;
    return () => {
      if (window.grecaptcha && currentRef) {
        window.grecaptcha.reset();
      }
    };
  }, [siteKey, onChange, onExpired]);

  return <div ref={recaptchaRef} />;
};

export default CustomReCAPTCHA;

// jsdhfjd
