// --- Load navbar (unchanged) ---
  fetch("../nav-bar/nav.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-placeholder").innerHTML = data;
  })
  .catch((error) => {
    console.error("Failed to load navbar:", error);
  });

// --- TMDB token and options ---
const token =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMjA5YTIzMzJhNmNhMDBiZTlhZmU3ZDE1OTFlOTQ3ZCIsIm5iZiI6MTc2MTU0NzI0MS44MjcwMDAxLCJzdWIiOiI2OGZmMTNlOTE1NjE4ZjAzOThkYTAyMjAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.7BrLe9Tt81ZEIg2T0zV8elagGYC78noCauoVOJIMJHE";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
};

const imageBaseURL = "https://image.tmdb.org/t/p/w500";

// --- Containers ---
const movieContainer = document.getElementById("movieContainer");
const highlightGrid = document.querySelector(".highlight-grid");
const actionContainer = document.getElementById("actionContainer");
const cartoonContainer = document.getElementById("cartoonContainer");

// --- Favorites setup ---
let favorites = [];
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

function updateFavorites() {
  favoritesContainer.innerHTML = "";
  if (favorites.length === 0) {
    favoritesContainer.innerHTML = "<p>No favorites yet.</p>";
    return;
  }
  favorites.forEach((movie) => {
    const poster = movie.poster_path
      ? `${imageBaseURL}${movie.poster_path}`
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
}

function addFavoriteButton(movie, container) {
  const heart = document.createElement("button");
  heart.textContent = "🤍";
  heart.classList.add("favorite-btn");
  heart.style.position = "absolute";
  heart.style.top = "8px";
  heart.style.right = "8px";
  heart.style.background = "transparent";
  heart.style.border = "none";
  heart.style.fontSize = "22px";
  heart.style.cursor = "pointer";

  const existing = favorites.some((fav) => fav.id === movie.id);
  if (existing) heart.textContent = "❤️";

  heart.addEventListener("click", (e) => {
    e.stopPropagation();
    const isFavorited = favorites.some((fav) => fav.id === movie.id);
    if (isFavorited) {
      favorites = favorites.filter((fav) => fav.id !== movie.id);
      heart.textContent = "🤍";
    } else {
      favorites.push(movie);
      heart.textContent = "❤️";
    }
    updateFavorites();

    localStorage.setItem("favorites", JSON.stringify(favorites));

  });
  container.appendChild(heart);
}

// --- Create Movie Card ---
function createMovieCard(movie) {
  const poster = movie.poster_path
    ? `${imageBaseURL}${movie.poster_path}`
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
  card.style.position = "relative";
  card.innerHTML = `
    <img src="${poster}" alt="${movie.title}">
    <div class="movie-info">
      <h3>${movie.title}</h3>
      <p>${releaseDate} • ⭐ ${movie.vote_average.toFixed(1)}</p>
    </div>
  `;
  addFavoriteButton(movie, card);
  makeCardClickable(card, movie);
  return card;
}

window.addEventListener("DOMContentLoaded", () => {
  favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  updateFavorites();
});


// --- Display Functions ---
function displayMovies(movies) {
  if (!movieContainer) return;
  movieContainer.innerHTML = "";
  if (!movies || movies.length === 0) {
    movieContainer.innerHTML = `<p>No movies found.</p>`;
    return;
  }

  const shuffledMovies = movies.sort(() => Math.random() - 0.5).slice(0, 8);
  shuffledMovies.forEach((movie) => {
    const movieCard = createMovieCard(movie);
    movieContainer.appendChild(movieCard);
  });
}

function display2025Highlights(movies) {
  if (!highlightGrid) return;
  highlightGrid.innerHTML = "";

  const movies2025 = movies
    .filter((movie) => movie.release_date && movie.release_date.startsWith("2025"))
    .slice(0, 20);

  if (movies2025.length === 0) {
    highlightGrid.innerHTML = `<p>No 2025 movies found.</p>`;
    return;
  }

  movies2025.forEach((movie) => {
    const card = createMovieCard(movie);
    highlightGrid.appendChild(card);
  });
}

function displayActionMovies(movies) {
  if (!actionContainer) return;
  actionContainer.innerHTML = "";
  movies.slice(0, 20).forEach((movie) => {
    const card = createMovieCard(movie);
    actionContainer.appendChild(card);
  });
}

function displayCartoonMovies(movies) {
  if (!cartoonContainer) return;
  cartoonContainer.innerHTML = "";
  movies.slice(0, 20).forEach((movie) => {
    const card = createMovieCard(movie);
    cartoonContainer.appendChild(card);
  });
}

// --- Initial Fetches ---
fetch("https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1", options)
  .then((res) => res.json())
  .then((data) => display2025Highlights(data.results))
  .catch((err) => console.error(err));

fetch("https://api.themoviedb.org/3/movie/popular?language=en-US&page=1", options)
  .then((res) => res.json())
  .then((data) => displayMovies(data.results))
  .catch((err) => console.error(err));

fetch("https://api.themoviedb.org/3/discover/movie?with_genres=28&language=en-US&page=1", options)
  .then((res) => res.json())
  .then((data) => displayActionMovies(data.results))
  .catch((err) => console.error(err));

fetch("https://api.themoviedb.org/3/discover/movie?with_genres=16&language=en-US&page=1", options)
  .then((res) => res.json())
  .then((data) => displayCartoonMovies(data.results))
  .catch((err) => console.error(err));


// --- Scroll Bar Addition Animation ---
  document.querySelectorAll('.highlight-grid, .movie-grid').forEach(track => {
    let isDown = false, startX, scrollLeft;
    track.addEventListener('mousedown', e => {
      isDown = true;
      track.classList.add('dragging');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      e.preventDefault();
    });

    window.addEventListener('mouseup', () => { isDown = false; track.classList.remove('dragging'); });
    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.2; // scroll speed
      track.scrollLeft = scrollLeft - walk;
    });

    // touch support:
    track.addEventListener('touchstart', e => { startX = e.touches[0].pageX - track.offsetLeft; scrollLeft = track.scrollLeft; });
    track.addEventListener('touchmove', e => {
      const x = e.touches[0].pageX - track.offsetLeft;
      const walk = (x - startX) * 1.2;
      track.scrollLeft = scrollLeft - walk;
    });
  });


// --- Search Overlay Implementation --- //
// --- Genre IDs ---
const GENRE_IDS = {
  Action: 28,
  Fantasy: 14,
  Horror: 27,
  "Science Fiction": 878,
};

// --- Overlay Styles ---
function injectOverlayStyles() {
  if (document.getElementById("search-overlay-styles")) return;
  const style = document.createElement("style");
  style.id = "search-overlay-styles";
  style.innerHTML = `
  .search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10,11,12,0.96);
    backdrop-filter: blur(6px);
    padding: 2.5rem 6rem;
    z-index: 3000;
    display: none;
    color: #fff;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    overflow-y: auto;
  }
  .search-overlay.open { display: block; animation: fadeIn 180ms ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px);} to { opacity: 1; transform: translateY(0);} }
  .search-overlay .search-panel { max-width: 1100px; margin: 0 auto; }
  .search-overlay .search-row { display:flex; gap:1rem; align-items:center; margin-bottom:1.2rem; }
  .search-overlay input[type="text"]{
    flex:1; padding:0.8rem 1rem; border-radius: 999px;
    border: none; outline: none; font-size:1rem; background: #1f1f1f; color: #fff;
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
    background: rgba(255,255,255,0.12); color:#fff; border-color: rgba(255,255,255,0.2);
  }
  .search-overlay .results { margin-top:1rem; max-height: 70vh; overflow-y: auto; }
  #overlayResults {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
    justify-items: center;
    align-items: start;
    width: 100%;
  }
  .search-overlay .close-overlay {
    position:absolute; right:1.5rem; top:1rem;
    background:transparent; border:none; color:#fff;
    font-size:1.4rem; cursor:pointer;
  }`;
  document.head.appendChild(style);
}

// --- Overlay DOM ---
function createSearchOverlay() {
  if (document.querySelector(".search-overlay")) return document.querySelector(".search-overlay");
  injectOverlayStyles();
  const overlay = document.createElement("div");
  overlay.className = "search-overlay";
  overlay.innerHTML = `
    <div class="search-panel">
      <button class="close-overlay" title="Close">✕</button>
      <div class="search-row">
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

// --- Overlay Behavior ---
function setupOverlayBehavior() {
  const overlay = createSearchOverlay();
  const overlayInput = overlay.querySelector("#overlaySearchInput");
  const overlayBtn = overlay.querySelector("#overlaySearchBtn");
  const overlayResults = overlay.querySelector("#overlayResults");
  const genresContainer = overlay.querySelector("#overlayGenres");
  const closeBtn = overlay.querySelector(".close-overlay");

  // Helper: perform TMDB search
  function performSearch(query) {
    if (!query) {
      overlayResults.innerHTML = "<p>Type to search movies or choose a genre.</p>";
      return;
    }
    overlayResults.innerHTML = `<p>Loading results for "${escapeHtml(query)}"...</p>`;
    fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`, options)
      .then((res) => res.json())
      .then((data) => {
        overlayResults.innerHTML = "";
        overlayResults.style.display = "grid";
        overlayResults.style.gridTemplateColumns = "repeat(auto-fill, minmax(180px, 1fr))";
        overlayResults.style.gap = "1.5rem";
        overlayResults.style.justifyItems = "center";
        overlayResults.style.alignItems = "start";
        overlayResults.style.width = "100%";
        if (!data.results || data.results.length === 0) {
          overlayResults.innerHTML = "<p>No results found.</p>";
          return;
        }
        data.results.slice(0, 24).forEach((movie) => {
          const card = createMovieCard(movie);
          overlayResults.appendChild(card);
        });
      })
      .catch((err) => {
        console.error(err);
        overlayResults.innerHTML = "<p>Failed to load results.</p>";
      });
  }

  // Helper: fetch by genre
  function fetchByGenre(genreId, friendlyName) {
    overlayResults.innerHTML = `<p>Loading ${escapeHtml(friendlyName)} movies...</p>`;
    fetch(`https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&language=en-US&page=1`, options)
      .then((res) => res.json())
      .then((data) => {
        overlayResults.innerHTML = "";
        overlayResults.style.display = "grid";
        overlayResults.style.gridTemplateColumns = "repeat(auto-fill, minmax(180px, 1fr))";
        overlayResults.style.gap = "1.5rem";
        overlayResults.style.justifyItems = "center";
        overlayResults.style.alignItems = "start";
        overlayResults.style.width = "100%";
        if (!data.results || data.results.length === 0) {
          overlayResults.innerHTML = "<p>No results found.</p>";
          return;
        }
        data.results.slice(0, 24).forEach((movie) => {
          const card = createMovieCard(movie);
          overlayResults.appendChild(card);
        });
      })
      .catch((err) => {
        console.error(err);
        overlayResults.innerHTML = "<p>Failed to load results.</p>";
      });
  }

  // Genre clicks
  genresContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".genre");
    if (!btn) return;
    genresContainer.querySelectorAll(".genre").forEach((g) => g.classList.remove("active"));
    btn.classList.add("active");
    const name = btn.dataset.genre;
    const id = GENRE_IDS[name];
    if (id) fetchByGenre(id, name);
  });

  // Search input and button
  overlayBtn.addEventListener("click", () => performSearch(overlayInput.value.trim()));
  overlayInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch(overlayInput.value.trim());
  });

  // Close overlay
  const closeOverlay = () => {
    overlay.classList.remove("open");
    document.body.style.overflow = ""; // ✅ allow scrolling again
    overlayInput.value = "";
    overlayResults.innerHTML = "";
  };
  closeBtn.addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOverlay();
  });

  const openOverlay = (initialQuery = "") => {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden"; // 🚫 prevent scroll on Discover
    overlayInput.value = initialQuery;
    overlayInput.focus();
    overlayResults.innerHTML = `<p>Type to search or choose a genre.</p>`;
  };

  return { openOverlay };
}

// --- Wait for navbar then attach toggle ---
document.addEventListener("DOMContentLoaded", () => {
  const navbarCheck = setInterval(() => {
    const searchToggle = document.getElementById("searchToggle");
    const fallbackToggle = document.getElementById("searchBtn");
    const toggleBtn = searchToggle || fallbackToggle;
    if (toggleBtn) {
      clearInterval(navbarCheck);
      const { openOverlay } = setupOverlayBehavior();
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openOverlay();
      });
    }
  }, 150);
});

// --- Clickable cards ---
function makeCardClickable(card, movie) {
  card.addEventListener("click", (e) => {
    if (e.target.classList && e.target.classList.contains("favorite-btn")) return;
    window.location.href = `../preview/preview.html?movieID=${movie.id}`;
  });
}

// --- Escape HTML helper ---
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}