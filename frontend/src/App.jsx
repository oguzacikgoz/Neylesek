import React, { useState } from 'react'
import { motion } from 'framer-motion'
import './App.css'

const movies = [
  "Interstellar 🎬",
  "Inception 🧠",
  "The Dark Knight 🦇",
  "Avatar 🌍",
  "Dune 🌵"
]

function App() {
  const [index, setIndex] = useState(0)
  const [likedMovies, setLikedMovies] = useState([])
  const [dislikedMovies, setDislikedMovies] = useState([])

  const currentMovie = movies[index]

  const handleSwipe = (direction) => {
    if (direction === "right") {
      setLikedMovies(prev => [...prev, currentMovie])
    } else {
      setDislikedMovies(prev => [...prev, currentMovie])
    }

    setIndex(prev => prev + 1)
  }

  if (index >= movies.length) {
    return (
      <div className="app">
        <h2>Filmler bitti 🎬</h2>

        <div style={{ display: "flex", gap: 60, marginTop: 40 }}>

          <div>
            <h3>👍 Liked Movies</h3>
            {likedMovies.length === 0 && <p>Henüz yok</p>}
            {likedMovies.map((m, i) => (
              <p key={i}>🎬 {m}</p>
            ))}
          </div>

          <div>
            <h3>👎 Disliked Movies</h3>
            {dislikedMovies.length === 0 && <p>Henüz yok</p>}
            {dislikedMovies.map((m, i) => (
              <p key={i}>🎬 {m}</p>
            ))}
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <h1>Neylesek? 🎬</h1>

      <div className="cardContainer">

        {[0, 1, 2].map((i) => {
          const movie = movies[index + i]
          if (!movie) return null

          const isTop = i === 0

          return (
            <motion.div
              key={movie}
              className="card"

              drag={isTop ? "x" : false}
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
              {movie}
            </motion.div>
          )
        })}

      </div>
    </div>
  )
}

export default App