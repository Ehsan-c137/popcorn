import { useEffect } from "react";
import { useState } from "react";

export function useLocalStorageState(initialState, key) {
   const [value, setValue] = useState(function () {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : [];
   });

   useEffect(() => {
      localStorage.setItem(key, JSON.stringify(value));
   }, [value, key]);

   return [value, setValue];
}
