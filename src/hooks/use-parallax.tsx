import { useEffect, useRef, useState } from 'react';

interface UseParallaxOptions {
  speed?: number; // 0.5 = half speed, 1 = normal, 2 = double speed
  direction?: 'up' | 'down';
}

export const useParallax = (options: UseParallaxOptions = {}) => {
  const { speed = 0.5, direction = 'up' } = options;
  const elementRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const scrollPosition = window.pageYOffset;
      const elementTop = rect.top + scrollPosition;
      const windowHeight = window.innerHeight;

      // Calculate parallax offset when element is in viewport
      if (rect.top < windowHeight && rect.bottom > 0) {
        const distance = scrollPosition - elementTop + windowHeight;
        const movement = distance * speed;
        setOffset(direction === 'up' ? -movement : movement);
      }
    };

    handleScroll(); // Initial calculation
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  return { elementRef, offset };
};
