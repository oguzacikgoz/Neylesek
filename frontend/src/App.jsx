import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './App.css'
import { db } from "./firebase"
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion
} from "firebase/firestore"
import { getDoc } from "firebase/firestore";

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
  const [matchedMovie, setMatchedMovie] = useState(null)
  const [lastShownMatchId, setLastShownMatchId] = useState(null)

  const [roomId, setRoomId] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const userId = params.get("user") || "user1"; 
useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  let id = params.get("room");
  const user = params.get("user") || "user1";

  if (!id) {
    id = crypto.randomUUID();

    window.location.href = `/?room=${id}&user=${user}`;
    return;
  }

  setRoomId(id);
}, []);
const roomRef = roomId ? doc(db, "rooms", roomId) : null;
  // 🔥 ROOM INIT
  useEffect(() => {
  const initRoom = async () => {
    try {
      const snap = await getDoc(roomRef);

      if (!snap.exists()) {
        await setDoc(roomRef, {
          user1Likes: [],
          user2Likes: [],
          matches: []
        });
        console.log("✅ ROOM CREATED");
      } else {
        console.log("ℹ️ ROOM ZATEN VAR");
      }

    } catch (err) {
      console.error("Room init hatası:", err);
    }
  };

  if (roomRef) {
    initRoom();
  }
}, [roomRef]);
  // 1. Filmleri API'den Çek
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=912b86763092646e87fdf7fe4bf940e5`)
      .then(res => res.json())
      .then(data => {
        const movieData = (data.results || []).map(movie => ({
          id: movie.id,
          title: movie.title,
          poster: movie.poster_path,
          rating: movie.vote_average,
          overview: movie.overview,
          genres: (movie.genre_ids || []).map(id => genreMap[id]).slice(0, 2)
        }))
        setMovies(movieData)
      })
  }, [])

  // 2. Eşleşme Dinleyicisi
  useEffect(() => {
    if (movies.length === 0) return;

    const unsub = onSnapshot(roomRef, async (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
 console.log("🔥 SNAPSHOT DATA:", data);
      const u1 = Array.isArray(data.user1Likes) ? data.user1Likes.map(Number) : [];
      const u2 = Array.isArray(data.user2Likes) ? data.user2Likes.map(Number) : [];
 const matches = Array.isArray(data.matches) ? data.matches.map(Number) : [];
       console.log("u1:", u1);
  console.log("u2:", u2);

  const commonIds = u1.filter(id => u2.includes(id));
 console.log("COMMON IDS:", commonIds);
     if (commonIds.length > 0) {
  const lastMatchId = commonIds[commonIds.length - 1];

  if (lastMatchId === lastShownMatchId) return;

  const foundMovie = movies.find(
    m => Number(m.id) === Number(lastMatchId)
  );

  if (foundMovie) {
    setMatchedMovie(foundMovie);
    setShowMatch(true);

    setLastShownMatchId(lastMatchId); // 🔥 BU ÇOK ÖNEMLİ
  

          try {
            await updateDoc(roomRef, {
              matches: arrayUnion(lastMatchId)
            });
          } catch (err) {
            console.error("Match yazma hatası:", err);
          }
        }
      }
    });

    return () => unsub();
  }, [movies, lastShownMatchId]);

  // Swipe
  const handleSwipe = async (direction) => {
    
    const currentMovie = movies[index];
    if (!currentMovie || !userId) return;

    if (direction === "right") {
      setLikedMovies(prev => [...prev, currentMovie]);

      try {
         console.log("🔥 WRITE START");
  console.log("ROOM:", roomRef?.path);
  console.log("USER:", userId);
  console.log("MOVIE ID:", currentMovie.id);

        const field = userId === "user1" ? "user1Likes" : "user2Likes";
        await updateDoc(roomRef, {
          [field]: arrayUnion(currentMovie.id)
        });
        console.log("✅ WRITE SUCCESS");
} catch (err) {
  console.error("❌ FIRESTORE ERROR:", err);
}
    } else {
      setDislikedMovies(prev => [...prev, currentMovie]);
    }

    setIndex(prev => prev + 1);
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
          </div>
        </div>
      )}

      {showMatch && matchedMovie && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="matchOverlay"
        >
          <div className="matchContent">
            <h2>IT'S A MATCH! 🍿</h2>
            <img
              src={`https://image.tmdb.org/t/p/w500${matchedMovie.poster}`}
              style={{ width: "200px", borderRadius: "10px" }}
              alt="match-poster"
            />
            <h3>{matchedMovie.title}</h3>
            <button onClick={() => setShowMatch(false)}>Devam Et</button>
          </div>
        </motion.div>
      )}

      <h1>Neylesek? 🎬</h1>
      <p style={{color: '#aaa'}}>Kullanıcı: {userId}</p>

      <div className="cardContainer">
        {movies.length === 0 ? (
          <h2>Yükleniyor...</h2>
        ) : index < movies.length ? (
          [0, 1, 2].map((i) => {
            const movie = movies[index + i]
            if (!movie) return null
            const isTop = i === 0

            return (
              <motion.div
                key={movie.id}
                className="card"
                drag={isTop ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, info) => {
                  if (!isTop) return
                  if (info.offset.x > 120) handleSwipe("right")
                  else if (info.offset.x < -120) handleSwipe("left")
                }}
                onClick={() => setSelectedMovie(movie)}
                animate={{
                  scale: isTop ? 1 : 0.92,
                  y: i * 15,
                  opacity: 1 - i * 0.2
                }}
                style={{
                  position: "absolute",
                  zIndex: 10 - i,
                  width: "260px",
                  height: "420px"
                }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                  alt={movie.title}
                  style={{ width: "100%", height: "70%", objectFit: "cover", borderRadius: "10px" }}
                />
                <h3>{movie.title}</h3>
                <h4>⭐ {movie.rating?.toFixed(1)}</h4>
              </motion.div>
            )
          })
        ) : (
          <h2>Filmler bitti 🎬</h2>
        )}
      </div>

      <div className="listContainer">
        <div className="listBox">
          <h3>Beğendiklerin 👍</h3>
          {likedMovies.map((m, i) => (
            <div key={i} className="movieCard">{m.title}</div>
          ))}
        </div>
        <div className="listBox">
          <h3>Beğenmediklerin 👎</h3>
          {dislikedMovies.map((m, i) => (
            <div key={i} className="movieCard">{m.title}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App