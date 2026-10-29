import { useEffect, useState } from 'react';
 
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
 
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // cleanup: cancel the previous timer
  }, [value, delay]);
 
  return debounced;
}
