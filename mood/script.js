// ==================== SEARCH OVERLAY FUNCTIONALITY (Unified with MovieCard + Favorites) ====================

// --- TMDB token (same as discover.js) ---
const token =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMjA5YTIzMzJhNmNhMDBiZTlhZmU3ZDE1OTFlOTQ3ZCIsIm5iZiI6MTc2MTU0NzI0MS44MjcwMDAxLCJzdWIiOiI2OGZmMTNlOTE1NjE4ZjAzOThkYTAyMjAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.7BrLe9Tt81ZEIg2T0zV8elagGYC78noCauoVOJIMJHE";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
};

// --- Genre IDs ---
const GENRE_IDS = {
  Action: 28,
  Fantasy: 14,
  Horror: 27,
  "Science Fiction": 878,
};

// --- Inject Overlay Styles ---
function injectOverlayStyles() {
  if (document.getElementById("search-overlay-styles")) return;
  const style = document.createElement("style");
  style.id = "search-overlay-styles";
  style.innerHTML = `
.search-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(10,11,12,0.96);
  backdrop-filter: blur(6px);
  padding: 2.5rem 6rem;
  z-index: 3000;
  display: none;
  color: #fff;
  overflow-y: auto;
}
.search-overlay.open { display: block; animation: fadeIn 180ms ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-6px);} to { opacity: 1; transform: translateY(0);} }
.search-overlay input[type="text"] {
  flex: 1; padding: 0.8rem 1rem; border-radius: 999px;
  border: none; outline: none; background: #1f1f1f; color: #fff;
}
.search-overlay .search-cta {
  background:#fff; color:#000; border-radius: 999px; padding:0.6rem 0.9rem;
  cursor:pointer; font-weight:600;
}
.search-overlay .genres { display:flex; gap:1.2rem; margin-bottom:1.2rem; flex-wrap:wrap; }
.search-overlay .genre {
  background: transparent; border: 1px solid rgba(255,255,255,0.12);
  padding:0.45rem 0.75rem; border-radius:6px; cursor:pointer; color:#ddd;
}
.search-overlay .genre.active {
  background: rgba(255,255,255,0.12); color:#fff;
}
.search-overlay .close-overlay {
  position:absolute; right:1.5rem; top:1rem;
  background:transparent; border:none; color:#fff;
  font-size:1.4rem; cursor:pointer;
}
#overlayResults {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  justify-items: center;
  align-items: start;
  width: 100%;
}
`;
  document.head.appendChild(style);
}

// --- Create Search Overlay ---
function createSearchOverlay() {
  if (document.querySelector(".search-overlay"))
    return document.querySelector(".search-overlay");

  injectOverlayStyles();

  const overlay = document.createElement("div");
  overlay.className = "search-overlay";
  overlay.innerHTML = `
<div class="search-panel">
  <button class="close-overlay">✕</button>
  <div class="search-row" style="display:flex;gap:1rem;align-items:center;margin-bottom:1.2rem;">
    <input type="text" id="overlaySearchInput" placeholder="Search movies..." autocomplete="off" />
    <button class="search-cta" id="overlaySearchBtn">Search</button>
  </div>
  <div class="genres" id="overlayGenres"></div>
  <div class="results"><div id="overlayResults"></div></div>
</div>
`;

  document.body.appendChild(overlay);

  const overlayGenres = overlay.querySelector("#overlayGenres");
  ["Action", "Fantasy", "Horror", "Science Fiction"].forEach((g) => {
    const btn = document.createElement("button");
    btn.className = "genre";
    btn.textContent = g;
    btn.dataset.genre = g;
    overlayGenres.appendChild(btn);
  });

  return overlay;
}

// --- Setup Overlay Behavior ---
function setupOverlayBehavior() {
  const overlay = createSearchOverlay();
  const overlayInput = overlay.querySelector("#overlaySearchInput");
  const overlayBtn = overlay.querySelector("#overlaySearchBtn");
  const overlayResults = overlay.querySelector("#overlayResults");
  const genresContainer = overlay.querySelector("#overlayGenres");
  const closeBtn = overlay.querySelector(".close-overlay");

  // ✅ Reuse movie card generator
  function renderMovies(movieList) {
    overlayResults.innerHTML = "";
    if (!movieList || movieList.length === 0) {
      overlayResults.innerHTML = "<p>No movies found.</p>";
      return;
    }
    movieList.slice(0, 20).forEach((movie) => {
      const card = createMovieCard(movie); // ❤️ Same as Discover section
      overlayResults.appendChild(card);
    });
  }

  // --- Search by title ---
  async function performSearch(query) {
    if (!query) {
      overlayResults.innerHTML = "<p>Type to search movies or choose a genre.</p>";
      return;
    }

    overlayResults.innerHTML = `<p>Loading results for "${query}"...</p>`;

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`,
        options
      );
      const data = await res.json();
      renderMovies(data.results);
    } catch (err) {
      console.error("Search error:", err);
      overlayResults.innerHTML = "<p>Search failed. Try again later.</p>";
    }
  }

  // --- Genre click search ---
  genresContainer.addEventListener("click", async (e) => {
    const btn = e.target.closest(".genre");
    if (!btn) return;

    genresContainer.querySelectorAll(".genre").forEach((g) => g.classList.remove("active"));
    btn.classList.add("active");

    const id = GENRE_IDS[btn.dataset.genre];
    if (!id) return;

    overlayResults.innerHTML = `<p>Loading ${btn.dataset.genre} movies...</p>`;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?with_genres=${id}&language=en-US&page=1`,
        options
      );
      const data = await res.json();
      renderMovies(data.results);
    } catch (err) {
      console.error("Genre search error:", err);
      overlayResults.innerHTML = "<p>Failed to fetch genre movies.</p>";
    }
  });

  overlayBtn.addEventListener("click", () => performSearch(overlayInput.value.trim()));
  overlayInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch(overlayInput.value.trim());
  });

  const closeOverlay = () => {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    overlayResults.innerHTML = "";
  };

  closeBtn.addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeOverlay(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeOverlay(); });

  const openOverlay = () => {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    overlayResults.innerHTML = "<p>Type to search or choose a genre.</p>";
  };

  return { openOverlay };
}

// --- Wait for Navbar to Load, Then Enable Search Button ---
document.addEventListener("DOMContentLoaded", () => {
  const check = setInterval(() => {
    const toggle = document.getElementById("searchToggle") || document.getElementById("searchBtn");
    if (toggle) {
      clearInterval(check);
      const { openOverlay } = setupOverlayBehavior();
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        openOverlay();
      });
    }
  }, 150);
});



// --- Show Mood Buttons ---
const moodButtonsContainer = document.getElementById("moodButtonsContainer");
const movieSection = document.getElementById("movieSection");
const movieContainer = document.getElementById("movieContainer");

const moods = [
  { name: "Happy", key: "happiness" },
  { name: "Sad", key: "sadness" },
  { name: "Angry", key: "anger" },
  { name: "Scared", key: "fear" },
  { name: "In-love", key: "love" },
  { name: "Excited", key: "excitement" },
  { name: "Relaxed", key: "relaxed" },
];

moods.forEach((m) => {
  const btn = document.createElement("button");
  btn.textContent = m.name;
  btn.addEventListener("click", () => {
    suggestMoviesByMood(m.key);
    highlightActiveButton(btn);
  });
  moodButtonsContainer.appendChild(btn);
});

// --- TMDB Setup ---
const TMDB_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMjA5YTIzMzJhNmNhMDBiZTlhZmU3ZDE1OTFlOTQ3ZCIsIm5iZiI6MTc2MTU0NzI0MS44MjcwMDAxLCJzdWIiOiI2OGZmMTNlOTE1NjE4ZjAzOThkYTAyMjAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.7BrLe9Tt81ZEIg2T0zV8elagGYC78noCauoVOJIMJHE";
const TMDB_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${TMDB_TOKEN}`,
  },
};
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// --- Mood → TMDB Genres ---
const moodToGenres = {
  happiness: [35],
  sadness: [18, 10751],
  anger: [28, 53],
  fear: [27, 53],
  love: [10749, 35],
  excitement: [28, 12],
  relaxed: [16, 14],
};

// --- Suggest movies based on mood ---
// --- Suggest movies based on mood (with Mood API integrated) ---
async function suggestMoviesByMood(userMood) {
  movieSection.style.display = "block";
  movieSection.classList.add("active");

  // Shrink hero when showing movies
  document.querySelector(".hero").classList.add("shrink");

  movieContainer.innerHTML = "<p>Loading movies...</p>";

  // 🟢 Mood API integration (new 3rd API)
  try {
    const moodApiUrl = `https://mood-based-quote-api.p.rapidapi.com/${userMood}`;
    const moodApiOptions = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "119a5a03a9mshc59cd19cf2c6aedp1db733jsnd34c9bcaac17",
        "x-rapidapi-host": "mood-based-quote-api.p.rapidapi.com",
      },
    };

    const response = await fetch(moodApiUrl, moodApiOptions);
    if (response.ok) {
      const quoteData = await response.json();
      console.log("Mood API success:", quoteData);

      // Optional: show quote result in UI
      const quoteEl = document.createElement("p");
      quoteEl.classList.add("mood-quote");
      quoteEl.textContent =
        quoteData.quote ||
        "Feeling the vibe... here are movies that match your mood!";
      movieContainer.prepend(quoteEl);
    } else {
      console.warn("Mood API failed or rate-limited.");
    }
  } catch (err) {
    console.error("Mood API error:", err);
  }

  // 🎬 Fetch movies from TMDB (main API)
  const genreIds = moodToGenres[userMood] || [35];
  const randomPage = Math.floor(Math.random() * 5) + 1;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?with_genres=${genreIds.join(
        ","
      )}&language=en-US&page=${randomPage}`,
      TMDB_OPTIONS
    );
    const data = await res.json();
    const shuffled = data.results.sort(() => 0.5 - Math.random()).slice(0, 20);
    displayMovies(shuffled);
  } catch (err) {
    console.error(err);
    movieContainer.innerHTML = "<p>Failed to fetch movies.</p>";
  }
}


// --- Display movies ---
function displayMovies(movies) {
  movieContainer.innerHTML = "";
  if (!movies || movies.length === 0) {
    movieContainer.innerHTML = "<p>No movies found.</p>";
    return;
  }
  movies.forEach((movie) => movieContainer.appendChild(createMovieCard(movie)));
}

// --- Create movie card ---
function createMovieCard(movie) {
  const poster = movie.poster_path
    ? IMAGE_BASE_URL + movie.poster_path
    : "https://via.placeholder.com/500x750?text=No+Image";

  const card = document.createElement("div");
  card.classList.add("movie-card");
  card.innerHTML = `
    <img src="${poster}" alt="${movie.title}">
    <div class="movie-info">
      <h3>${movie.title}</h3>
      <p>⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</p>
    </div>
  `;

  // ✅ Add favorite heart button
  addFavoriteButton(movie, card);

  return card;
}

// --- Highlight Active Mood Button ---
function highlightActiveButton(activeBtn) {
  const allButtons = document.querySelectorAll(".mood-buttons button");
  allButtons.forEach((btn) => btn.classList.remove("active"));
  activeBtn.classList.add("active");
}

// --- Favorites setup ---
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const mainContainer = document.querySelector("main.container");

const favoritesSection = document.createElement("section");
favoritesSection.classList.add("movies-section");
favoritesSection.id = "favoritesSection";
favoritesSection.innerHTML = `
  <h2>Favorites ❤️</h2>
  <div id="favoritesContainer" class="movie-grid"></div>
`;
mainContainer.appendChild(favoritesSection);

const favoritesContainer = document.getElementById("favoritesContainer");

// --- Helper: check if movie is in favorites ---
function isMovieFavorited(id) {
  return favorites.some((fav) => fav.id === id);
}

// --- Update Favorites Section ---
function updateFavorites() {
  favoritesContainer.innerHTML = "";
  if (favorites.length === 0) {
    favoritesContainer.innerHTML = "<p>No favorites yet.</p>";
    return;
  }

  favorites.forEach((movie) => {
    const poster = movie.poster_path
      ? `${IMAGE_BASE_URL}${movie.poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Image";

    const releaseDate = movie.release_date
      ? new Date(movie.release_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Unknown date";

    const card = document.createElement("div");
    card.classList.add("movie-card", "large-card");
    card.innerHTML = `
      <img src="${poster}" alt="${movie.title}">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p>${releaseDate} • ⭐ ${movie.vote_average.toFixed(1)}</p>
      </div>
    `;

    makeCardClickable(card, movie);
    favoritesContainer.appendChild(card);
  });

  // Refresh hearts in all sections when favorites change
  refreshAllFavoriteButtons();
}

// --- Add Favorite Button (Heart) ---
function addFavoriteButton(movie, container) {
  const heart = document.createElement("button");
  heart.classList.add("favorite-btn");
  heart.innerHTML = isMovieFavorited(movie.id) ? "❤️" : "🤍";

  heart.addEventListener("click", (e) => {
    e.stopPropagation();

    if (isMovieFavorited(movie.id)) {
      favorites = favorites.filter((fav) => fav.id !== movie.id);
      heart.innerHTML = "🤍";
    } else {
      favorites.push(movie);
      heart.innerHTML = "❤️";
    }

    // Update favorites + save
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavorites();
  });

  container.appendChild(heart);
}

// --- Refresh all visible heart buttons (for mood + discover sync) ---
function refreshAllFavoriteButtons() {
  document.querySelectorAll(".favorite-btn").forEach((btn) => {
    const card = btn.closest(".movie-card");
    if (!card) return;

    const titleEl = card.querySelector("h3");
    if (!titleEl) return;

    const movieTitle = titleEl.textContent;
    const matchedFav = favorites.find((m) => m.title === movieTitle);

    btn.innerHTML = matchedFav ? "❤️" : "🤍";
  });
}

// --- Load Favorites on page start ---
updateFavorites();
