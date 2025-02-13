import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface CustomReCAPTCHAProps {
  siteKey: string;
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  invisible?: boolean; // if true, use invisible mode
}

export interface CustomReCAPTCHAHandle {
  execute: () => void;
  reset: () => void;
}

// Inline declaration for window.grecaptcha
declare global {
  interface Window {
    grecaptcha: any;
  }
}

const CustomReCAPTCHA = forwardRef<CustomReCAPTCHAHandle, CustomReCAPTCHAProps>(
  ({ siteKey, onChange, onExpired, invisible = false }, ref) => {
    const recaptchaRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<number | null>(null);

    useEffect(() => {
      // Load the reCAPTCHA script if it isn't already loaded
      const loadScript = (): Promise<void> =>
        new Promise((resolve) => {
          if (document.querySelector('#recaptcha-script')) {
            resolve();
            return;
          }
          const script = document.createElement('script');
          script.id = 'recaptcha-script';
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

      loadScript().then(waitForGrecaptcha).then(() => {
        if (window.grecaptcha && recaptchaRef.current) {
          widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
            sitekey: siteKey, // Must be lowercase "sitekey"
            size: invisible ? 'invisible' : 'normal',
            callback: (token: string) => onChange(token),
            'expired-callback': () => {
              onExpired?.();
              onChange(null);
            },
          });
        }
      });

      // Cleanup on unmount
      return () => {
        if (window.grecaptcha && widgetIdRef.current !== null) {
          window.grecaptcha.reset(widgetIdRef.current);
        }
      };
    }, [siteKey, onChange, onExpired, invisible]);

    // Expose execute and reset methods to parent components
    useImperativeHandle(ref, () => ({
      execute: () => {
        if (window.grecaptcha && widgetIdRef.current !== null) {
          window.grecaptcha.execute(widgetIdRef.current);
        }
      },
      reset: () => {
        if (window.grecaptcha && widgetIdRef.current !== null) {
          window.grecaptcha.reset(widgetIdRef.current);
        }
      },
    }));

    return <div ref={recaptchaRef} />;
  }
);

export default CustomReCAPTCHA;
