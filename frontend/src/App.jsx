import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './App.css'

function App() {

  const [movies, setMovies] = useState([])
  const [index, setIndex] = useState(0)
  const [likedMovies, setLikedMovies] = useState([])
  const [dislikedMovies, setDislikedMovies] = useState([])
  const [showMatch, setShowMatch] = useState(false)

  const [partnerLikedMovies] = useState([
    "Interstellar",
    "Dune"
  ])

  const API_KEY = "912b86763092646e87fdf7fe4bf940e5"

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=912b86763092646e87fdf7fe4bf940e5`)
      .then(res => res.json())
      .then(data => {
        const movieData = data.results?.map(movie => ({
  title: movie.title,
  poster: movie.poster_path
})) || []

setMovies(movieData)
      })
      .catch(err => console.error(err))
  }, [])

  const handleSwipe = (direction) => {
    const movie = movies[index]
    if (!movie) return

    const action = direction === "right" ? "like" : "dislike"

    if (action === "like") {
      setLikedMovies(prev => [...prev, movie])

      if (partnerLikedMovies.includes(movie.title)) {
        setShowMatch(true)
      }

    } else {
      setDislikedMovies(prev => [...prev, movie])
    }

    setIndex(prev => prev + 1)
  }

  return (
    <div className="app">

      {showMatch && (
        <div className="matchPopup">
          🎉 IT'S A MATCH!
          <button onClick={() => setShowMatch(false)}>
            Kapat
          </button>
        </div>
      )}

      <h1>Neylesek? 🎬</h1>

      {movies.length === 0 ? (
        <h2>Yükleniyor... 🎬</h2>
      ) : index < movies.length && (
        <div className="cardContainer">
          {[0, 1, 2].map((i) => {
            const movie = movies[index + i]
            if (!movie) return null

            const isTop = i === 0

            return (
              <motion.div
                key={movie.title + index}
                className="card"
                drag={isTop ? "x" : undefined}
                dragElastic={0.2}
                animate={{
                  scale: isTop ? 1 : 0.92,
                  y: i * 12,
                  opacity: 1 - i * 0.2
                }}
                style={{
                  position: "absolute",
                  zIndex: 10 - i
                }}
                whileDrag={isTop ? { scale: 1.05, rotate: 5 } : {}}
                onDragEnd={(e, info) => {
                  if (!isTop) return

                  if (info.offset.x > 100) {
                    handleSwipe("right")
                  } else if (info.offset.x < -100) {
                    handleSwipe("left")
                  }
                }}
              >
               <>
  <img
    src={
      movie.poster
        ? `https://image.tmdb.org/t/p/w500${movie.poster}`
        : "https://via.placeholder.com/300x450"
    }
    alt={movie.title}
    style={{
      width: "100%",
      height: "80%",
      objectFit: "cover",
      borderRadius: "10px"
    }}
  />

  <h3 style={{ marginTop: "10px" }}>
    {movie.title}
  </h3>
</>
              </motion.div>
            )
          })}
        </div>
      )}

      {index >= movies.length && (
        <h2>Filmler bitti 🎬</h2>
      )}

      <div className="listContainer">

        <div className="listBox">
          <h3>👍 Liked Movies</h3>
          {likedMovies.length === 0 && <p>Henüz yok</p>}
          {likedMovies.map((movie, i) => (
            <div key={i} className="movieCard">
              🎬 {movie.title}
            </div>
          ))}
        </div>

        <div className="listBox">
          <h3>👎 Disliked Movies</h3>
          {dislikedMovies.length === 0 && <p>Henüz yok</p>}
          {dislikedMovies.map((movie, i) => (
            <div key={i} className="movieCard">
              🎬 {movie.title}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default App