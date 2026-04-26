import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './App.css'

const genreMap = {
  28: "Aksiyon", 12: "Macera", 16: "Animasyon", 35: "Komedi", 80: "Suç",
  99: "Belgesel", 18: "Dram", 10751: "Aile", 14: "Fantastik", 36: "Tarih",
  27: "Korku", 10402: "Müzik", 9648: "Gizem", 10749: "Romantik",
  878: "B. Kurgu", 10770: "TV Film", 53: "Gerilim", 10752: "Savaş", 37: "Vahşi Batı"
};

function App() {
  const [movies, setMovies] = useState([])
  const [index, setIndex] = useState(0)
  const [likedMovies, setLikedMovies] = useState([])
  const [dislikedMovies, setDislikedMovies] = useState([])
  const [showMatch, setShowMatch] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
const [matchedMovie, setMatchedMovie] = useState(null)

  const [partnerLikedMovies] = useState(["Your Heart Will Be Broken", "Send Help"])

  // 📦 LOAD FROM LOCALSTORAGE
  useEffect(() => {
    const savedLiked = JSON.parse(localStorage.getItem("likedMovies") || "[]")
    const savedDisliked = JSON.parse(localStorage.getItem("dislikedMovies") || "[]")
    setLikedMovies(savedLiked)
    setDislikedMovies(savedDisliked)
  }, [])

  // 💾 SAVE TO LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem("likedMovies", JSON.stringify(likedMovies || []))
  }, [likedMovies])

  useEffect(() => {
    localStorage.setItem("dislikedMovies", JSON.stringify(dislikedMovies || []))
  }, [dislikedMovies])

  // 🎬 FETCH MOVIES
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=912b86763092646e87fdf7fe4bf940e5`)
      .then(res => res.json())
      .then(data => {
        const movieData = data.results?.map(movie => ({
          title: movie.title,
          poster: movie.poster_path,
          rating: movie.vote_average,
          overview: movie.overview, // 👈 Virgül hatası buradaydı, düzeltildi
          genres: movie.genre_ids.map(id => genreMap[id]).slice(0, 2)
        })) || []
        setMovies(movieData)
      })
      .catch(err => console.error(err))
  }, [])

  const handleSwipe = (direction) => {
  const movie = movies[index];
  if (!movie) return;

  if (direction === "right") {
    setLikedMovies((prev) => [...prev, movie]);

    // Match Kontrolü: İsimleri küçük harfe çevirip karşılaştırıyoruz (Hata payını azaltır)
    const isMatched = partnerLikedMovies.some(
      (pMovieName) => pMovieName.toLowerCase() === movie.title.toLowerCase()
    );

    if (isMatched) {
  setMatchedMovie(movie); // 🔥 sabitle
  setShowMatch(true);
}
  } else {
    setDislikedMovies((prev) => [...prev, movie]);
  }
  setIndex((prev) => prev + 1);
};

  return (
    <div className="app">
      {selectedMovie && (
        <div className="modal" onClick={() => setSelectedMovie(null)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedMovie.title}</h2>
            <img
              src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster}`}
              style={{ width: "200px", borderRadius: "10px" }}
              alt="poster"
            />
            <p>{selectedMovie.overview}</p>
            <button onClick={() => setSelectedMovie(null)}>Kapat</button>
          </div>
        </div>
      )}

      {showMatch && (
  <motion.div 
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    className="matchOverlay"
  >
    <div className="matchContent">
      <h2 className="matchTitle">IT'S A MATCH! 🍿</h2>
      <p>Partnerinle ortak noktanı buldun:</p>
      
      {/* O an eşleşen filmin afişini gösterelim */}
      <img 
  src={`https://image.tmdb.org/t/p/w500${matchedMovie?.poster}`} 
  className="matchedPoster"
  alt="Match"
/>

<h3 className="matchedMovieName">
  {matchedMovie?.title}
</h3>
      
      <div className="matchButtons">
        <button className="keepSwiping" onClick={() => setShowMatch(false)}>
          Kaydırmaya Devam Et
        </button>
      </div>
    </div>
  </motion.div>
)}

      <h1>Neylesek? 🎬</h1>

      <div className="cardContainer">
        {movies.length === 0 ? (
          <h2>Yükleniyor... 🎬</h2>
        ) : index < movies.length ? (
          [0, 1, 2].map((i) => {
            const movie = movies[index + i]
            if (!movie) return null
            const isTop = i === 0

            return (
              <motion.div
                key={movie.title + (index + i)}
                className="card"
                drag={isTop ? "x" : false}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(e, info) => {
                  setIsDragging(false)
                  if (!isTop) return
                  if (info.offset.x > 100) handleSwipe("right")
                  else if (info.offset.x < -100) handleSwipe("left")
                }}
                onClick={() => { if (!isDragging) setSelectedMovie(movie) }}
                animate={{
                  scale: isTop ? 1 : 0.92,
                  y: i * 12,
                  opacity: 1 - i * 0.2
                }}
                style={{ position: "absolute", zIndex: 10 - i }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                  alt={movie.title}
                  style={{ width: "100%", height: "60%", objectFit: "cover", borderRadius: "10px" }}
                />
                <h3>{movie.title}</h3>
                
                {/* 🏷️ TÜRLER (GENRES) BURAYA EKLENDİ */}
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '5px' }}>
                  {movie.genres?.map((g, idx) => (
                    <span key={idx} style={{ fontSize: '10px', background: '#444', padding: '2px 6px', borderRadius: '10px' }}>
                      {g}
                    </span>
                  ))}
                </div>

                <h4>⭐ {movie.rating?.toFixed(1)}</h4>
                <p style={{ fontSize: "11px", padding: "0 10px", textAlign: "center", overflowY: "auto" }}>
                  {movie.overview.substring(0, 100)}...
                </p>
              </motion.div>
            )
          })
        ) : (
          <h2>Filmler bitti 🎬</h2>
        )}
      </div>

      <div className="listContainer">
        <div className="listBox">
          <h3>👍 Liked</h3>
          {likedMovies.map((m, i) => <div key={i} className="movieCard">{m.title}</div>)}
        </div>
        <div className="listBox">
          <h3>👎 Disliked</h3>
          {dislikedMovies.map((m, i) => <div key={i} className="movieCard">{m.title}</div>)}
        </div>
      </div>
    </div>
  )
}

export default App 