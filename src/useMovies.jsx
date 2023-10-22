import { useState, useEffect } from "react";

export function useMovies(query) {
   const KEY = "223537a2";
   const [movies, setMovies] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState("");

   useEffect(() => {
      const controller = new AbortController();

      async function fetchMovies() {
         try {
            setIsLoading(true);
            const res = await fetch(
               `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
               { signal: controller.signal }
            );
            if (!res.ok) {
               throw new Error("Something went wrong");
            }
            const data = await res.json();
            if (data.Response === "False") {
               throw new Error("Movie not found");
            }
            setMovies(data.Search);
         } catch (err) {
            if (err.name !== "AbortError") {
               setError(err.message);
            }
         } finally {
            setIsLoading(false);
            setError("");
         }
      }
      if (query.length < 3) {
         setMovies([]);
         setError("");
         return;
      }
      fetchMovies();

      return () => {
         controller.abort();
      };
   }, [query]);

   return {
      movies,
      error,
      isLoading,
   };
}
