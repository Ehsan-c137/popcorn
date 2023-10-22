import { useEffect, useState, useDeferredValue, useRef } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { Usekey } from "./useKey";

const average = (arr) =>
   arr?.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "223537a2";

export default function App() {
   const [query, setQuery] = useState("");

   // const deferredQuery = useDeferredValue(query);

   // const [movies, setMovies] = useState([]);

   const [watched, setWatched] = useLocalStorageState([], "watched");

   const [selectedId, setSelectedId] = useState(null);

   const { isLoading, error, movies } = useMovies(query);

   function handleDeleteWatched(id) {
      const newList = watched?.filter((movie) => movie.imdbID !== id);
      setWatched(newList);
   }

   function handleAddWatched(movie) {
      setWatched((watched) => [...watched, movie]);
      // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
   }

   function handleSelectMovie(id) {
      setSelectedId((prevId) => (prevId == id ? null : id));
   }
   function handleCloseMovie() {
      setSelectedId(null);
   }

   return (
      <>
         <Navbar>
            <Search query={query} setQuery={setQuery} />
            <NumResults movies={movies} />
         </Navbar>
         <main className="main">
            <Box>
               {isLoading && <Loader />}
               {error && <ErrorMessage message={error} />}
               {!isLoading && !error && (
                  <MovieList
                     movies={movies}
                     onSelectMovie={handleSelectMovie}
                     handleSelectMovie={handleSelectMovie}
                  />
               )}
            </Box>
            <Box>
               {selectedId ? (
                  <MovieDetails
                     selectedId={selectedId}
                     onCloseMovie={handleCloseMovie}
                     onAddWatched={handleAddWatched}
                     watched={watched}
                  />
               ) : (
                  <>
                     <WatchedSummary watched={watched} />
                     <WatchedMovieList
                        watched={watched}
                        onDeleteWatched={handleDeleteWatched}
                     />
                  </>
               )}
            </Box>
         </main>
      </>
   );
}

function MovieList({ movies, handleSelectMovie }) {
   return (
      <ul className="list list-movies">
         {movies?.map((movie) => (
            <Movie
               movie={movie}
               key={movie.imdbID}
               onSelectMovie={handleSelectMovie}
            />
         ))}
      </ul>
   );
}

function Movie({ movie, onSelectMovie }) {
   return (
      <li onClick={() => onSelectMovie(movie.imdbID)} key={movie.imdbID}>
         <img
            src={movie.Poster == "N/A" ? "./empty.jpg" : movie.Poster}
            alt={`${movie.Title} poster`}
         />
         <h3>{movie.Title}</h3>
         <div>
            <p>
               <span>📆</span>
               <span>{movie.Year}</span>
            </p>
         </div>
      </li>
   );
}

function WatchedSummary({ watched }) {
   const avgImdbRating = average(watched?.map((movie) => movie.ImdbRating));
   const avgUserRating = average(watched?.map((movie) => movie.userRating));
   const avgRuntime = average(watched?.map((movie) => movie.Runtime))?.toFixed(
      1
   );

   return (
      <div className="summary">
         <h2>Movies you watched</h2>
         <div>
            <p>
               <span>#️⃣</span>
               <span>{watched?.Title} movies</span>
            </p>
            <p>
               <span> ⭐</span>
               <span>{avgImdbRating?.toFixed(2)}</span>
            </p>
            <p>
               <span>🌟</span>
               <span>{avgUserRating?.toFixed(2)}</span>
            </p>
            <p>
               <span>⌛</span>
               <span>{avgRuntime} min</span>
            </p>
         </div>
      </div>
   );
}

function WatchedMovieList({ watched, onDeleteWatched }) {
   return (
      <ul className="list">
         {watched?.map((movie) => (
            <WatchedMovie
               movie={movie}
               key={movie.imdbID}
               onDeleteWatched={onDeleteWatched}
            />
         ))}
      </ul>
   );
}

function WatchedMovie({ movie, onDeleteWatched }) {
   return (
      <li>
         <img src={movie.Poster} alt={`${movie.Title} poster`} />
         <h3>{movie.Title}</h3>
         <div>
            <p>
               <span>⭐</span>
               <span>{movie.ImdbRating}</span>
            </p>
            <p>
               <span>🌟</span>
               <span>{movie.userRating}</span>
            </p>
            <p>
               <span>⌛</span>
               <span>{movie.Runtime} min</span>
            </p>
            <button
               className="btn-delete"
               onClick={() => onDeleteWatched(movie.imdbID)}
            >
               X
            </button>
         </div>
      </li>
   );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
   const [movie, setMovie] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [userRating, setUserRating] = useState("");

   const countRef = useRef(0);

   useEffect(() => {
      if (userRating) countRef.current = countRef.current + 1;
   }, [userRating]);
   const isWatched = watched?.map((movie) => movie.imdbID).includes(selectedId);
   const watchedUserRating = watched?.find(
      (movie) => movie.imdbID === selectedId
   )?.userRating;

   useEffect(() => {
      function callBack(e) {
         if (e.code === "Escape") {
            onCloseMovie();
         }
      }
      document.addEventListener("keydown", callBack);

      return () => {
         document.removeEventListener("keydown", callBack);
      };
   }, [onCloseMovie]);

   const {
      Title,
      Year,
      Poster,
      Runtime,
      imdbRating,
      Plot,
      Released,
      Actors,
      Director,
      Genre,
   } = movie;

   useEffect(() => {
      async function fetchDetail() {
         setIsLoading(true);
         const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
         );
         if (!res.ok) {
            throw new Error("Something went wrong");
         }
         const data = await res.json();
         if (data.Response === "False") {
            throw new Error("Movie not found");
         }
         setMovie(data);
         setIsLoading(false);
      }

      fetchDetail();
   }, [selectedId]);

   useEffect(() => {
      if (!Title) return;
      document.title = `Movie | ${Title}`;
      return function () {
         document.title = "POPCORN";
      };
   }, [Title]);

   useEffect(() => {
      localStorage.setItem("watched", JSON.stringify(watched));
   }, [watched]);

   const handleAdd = () => {
      const newWatchedMovie = {
         imdbID: selectedId,
         Title,
         Year,
         Poster,
         Runtime: Number(Runtime.split(" ").at(0)),
         ImdbRating: Number(imdbRating),
         userRating,
         countRatingDecisions: countRef.current,
      };
      onAddWatched(newWatchedMovie);
      onCloseMovie();
   };

   return (
      <div className="details">
         {isLoading ? (
            <Loader />
         ) : (
            <>
               <header>
                  <button className="btn-back" onClick={onCloseMovie}>
                     ⬅
                  </button>
                  <img src={Poster} alt={`Poster of ${movie} movie`} />
                  <div className="details-overview">
                     <div>
                        <h2>{Title}</h2>
                        <p>
                           {Released} &bull; {Runtime}
                        </p>
                        <p>{Genre}</p>
                        <p>
                           <span>⭐</span>
                           {imdbRating} IMDB rating
                        </p>
                     </div>
                  </div>
               </header>
               <section>
                  <div className="rating">
                     {!isWatched ? (
                        <>
                           <StarRating
                              maxRating={10}
                              onSetRating={setUserRating}
                           />
                           {userRating > 0 && (
                              <button className="btn-add" onClick={handleAdd}>
                                 Add to list
                              </button>
                           )}
                        </>
                     ) : (
                        <p>You rated with movie {watchedUserRating}🌟</p>
                     )}
                  </div>
                  <p>
                     <em>{Plot}</em>
                  </p>
                  <p>Starring {Actors}</p>
                  <p>Directed by {Director}</p>
               </section>
            </>
         )}
      </div>
   );
}

function Loader() {
   return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
   return (
      <p className="error">
         <span>⛔</span> {message}
      </p>
   );
}

function Navbar({ children }) {
   return (
      <nav className="nav-bar">
         <Logo />
         {children}
      </nav>
   );
}

function Logo() {
   return (
      <div className="logo">
         <span role="img">🍿</span>
         <h1>usePopcorn</h1>
      </div>
   );
}

function Search({ query, setQuery }) {
   const inputEl = useRef(null);

   Usekey("Enter", () => {
      if (document.activeElement === inputEl.current) return;
   });

   useEffect(() => {
      inputEl.current.focus();

      const callback = (e) => {
         if (document.activeElement === inputEl.current) return;
         if (e.code === "Enter") {
            inputEl.current.focus();
            setQuery("");
         }
      };

      document.addEventListener("keydown", callback);

      return () => {
         document.removeEventListener("keydown", callback);
      };
   }, [setQuery]);

   return (
      <input
         className="search"
         type="text"
         placeholder="Search movies..."
         value={query}
         onChange={(e) => setQuery(e.target.value)}
         ref={inputEl}
      />
   );
}

function NumResults({ movies }) {
   return (
      <p className="num-results">
         Found <strong>{movies?.length}</strong> results
      </p>
   );
}

function Box({ children }) {
   const [isOpen, setIsOpen] = useState(true);

   return (
      <div className="box">
         <button className="btn-toggle" onClick={() => setIsOpen((o) => !o)}>
            {isOpen ? "-" : "+"}
         </button>
         {isOpen && children}
      </div>
   );
}
