import { useState, useEffect } from 'react';

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if window is defined (for SSR compatibility)
        if (typeof window === 'undefined') return;

        // Function to check if device is mobile
        const checkMobile = () => {
            const width = window.innerWidth;
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;

            // Check based on width (< 768px is typically mobile)
            const isMobileWidth = width < 768;

            // Check based on user agent for better mobile detection
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

            return isMobileWidth || isMobileDevice;
        };

        // Set initial value
        setIsMobile(checkMobile());

        // Add resize listener
        const handleResize = () => {
            setIsMobile(checkMobile());
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
}
