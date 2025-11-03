// ==================== NAVBAR (SAME AS DISCOVER) ====================
fetch("../nav-bar/nav.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("navbar-placeholder").innerHTML = data;
  })
  .catch(error => console.error("Failed to load navbar:", error));


// ==================== SEARCH OVERLAY FUNCTIONALITY ====================

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
  if (document.querySelector(".search-overlay")) return document.querySelector(".search-overlay");
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

  function performSearch(query) {
    if (!query) {
      overlayResults.innerHTML = "<p>Type to search movies or choose a genre.</p>";
      return;
    }
    overlayResults.innerHTML = `<p>Loading results for "${query}"...</p>`;
    fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`, options)
      .then(res => res.json())
      .then(data => {
        overlayResults.innerHTML = "";
        if (!data.results || data.results.length === 0) {
          overlayResults.innerHTML = "<p>No results found.</p>";
          return;
        }
        data.results.slice(0, 20).forEach(movie => {
          const img = movie.poster_path
            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
            : "https://via.placeholder.com/500x750?text=No+Image";
          overlayResults.innerHTML += `
            <div class="movie-card">
              <img src="${img}" alt="${movie.title}" style="width:100%;border-radius:10px;">
              <p>${movie.title}</p>
            </div>`;
        });
      });
  }

  // Genre buttons
  genresContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".genre");
    if (!btn) return;
    genresContainer.querySelectorAll(".genre").forEach(g => g.classList.remove("active"));
    btn.classList.add("active");
    const id = GENRE_IDS[btn.dataset.genre];
    if (id) {
      overlayResults.innerHTML = `<p>Loading ${btn.dataset.genre} movies...</p>`;
      fetch(`https://api.themoviedb.org/3/discover/movie?with_genres=${id}&language=en-US&page=1`, options)
        .then(res => res.json())
        .then(data => {
          overlayResults.innerHTML = "";
          data.results.slice(0, 20).forEach(movie => {
            const img = movie.poster_path
              ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
              : "https://via.placeholder.com/500x750?text=No+Image";
            overlayResults.innerHTML += `
              <div class="movie-card">
                <img src="${img}" alt="${movie.title}" style="width:100%;border-radius:10px;">
                <p>${movie.title}</p>
              </div>`;
          });
        });
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



// ==================== LANDING SCROLL ANIMATION ====================
const arrow = document.getElementById("scrollArrow");
const landing = document.querySelector(".landing");

arrow.addEventListener("click", () => {
  landing.classList.add("slide-up");
  arrow.classList.add("slide-away");
});
// ================= SHOW NAVBAR AFTER LANDING =================
const navbarCheck = setInterval(() => {
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    clearInterval(navbarCheck);

    // When arrow is clicked (landing slides up)
    arrow.addEventListener("click", () => {
      setTimeout(() => {
        navbar.classList.add("visible");
      }, 800); // Delay until landing finishes sliding up
    });

    // If user scrolls down manually, also show it
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      if (scrollY > window.innerHeight * 0.2) {
        navbar.classList.add("visible");
      } else {
        navbar.classList.remove("visible");
      }
    });
  }
}, 200);


// ==================== WEATHER + MOVIE MOOD ====================
const WEATHER_API_KEY = "3e5a7eb1fa9e9597753931bac70bc76f";
const TMDB_JWT = token; // reuse same token

const GENRES = {
  romance: "10749",
  adventure: "12",
  drama: "18",
  comedy: "35",
  popular: "28",
};

// same weather and mood functions (keep your existing code)
async function getWeatherAndMood() {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
    );
    const weather = await weatherRes.json();

    const temp = Math.round(weather.main.temp);
    const condition = weather.weather[0].main.toLowerCase();
    const icon = weather.weather[0].icon;
    const city = weather.name;

    document.getElementById("weatherTemp").textContent = `${temp}°C`;
    document.getElementById("weatherLocation").textContent = city;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    let moodSuggestion = "";
    let genre = "";

    if (condition.includes("rain")) {
      moodSuggestion = "Rainy coziness — grab something heartwarming 💗";
      genre = "romance";
    } else if (condition.includes("clear")) {
      moodSuggestion = "Clear skies today! Something fun or adventurous ✨";
      genre = "adventure";
    } else if (condition.includes("cloud")) {
      moodSuggestion = "Cloudy calm vibes — a thoughtful drama fits 🎭";
      genre = "drama";
    } else if (temp > 30) {
      moodSuggestion = "Hot outside! Cool down with a refreshing comedy 😂";
      genre = "comedy";
    } else if (temp < 20) {
      moodSuggestion = "A bit chilly — warm it up with romance ❤️";
      genre = "romance";
    } else {
      moodSuggestion = "Weather is steady — mix it up, pick what feels good 🎬";
      genre = "popular";
    }

    document.getElementById("moodDescription").textContent = moodSuggestion;
    fetchMovies(GENRES[genre]);
  });
}

async function fetchMovies(genreId) {
  const res = await fetch(
    `https://api.themoviedb.org/3/discover/movie?include_adult=false&sort_by=popularity.desc&with_genres=${genreId}`,
    { headers: { Authorization: `Bearer ${TMDB_JWT}` } }
  );
  const data = await res.json();
  const list = data.results.slice(0, 7);
  const movieListContainer = document.getElementById("movie-list");
  movieListContainer.innerHTML = list
    .map(
      (movie) => `
      <div class="movie-card">
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
        <p>${movie.title}</p>
      </div>`
    )
    .join("");

  if (list.length >= 3) {
    document.getElementById("movieNameSuggestions").innerHTML = `
      Try <b>${list[0].title}</b>, <b>${list[1].title}</b>, or <b>${list[2].title}</b> today. </br>
      See more in our suggested movies below!`;
  }
}

document.getElementById("refreshMoodBtn").onclick = getWeatherAndMood;
document.getElementById("seeMoreBtn").onclick = () =>
  (window.location.href = "../discover/discover.html");

getWeatherAndMood();


// ==================== MOVIE FACTS ====================
async function getMovieFact() {
  const factText = document.getElementById("movieFact");
  factText.textContent = "Loading a fun fact... 🎥";
  try {
    const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
    const data = await res.json();
    factText.textContent = data.text || "No fact found — try again!";
  } catch (error) {
    console.error("Error fetching movie fact:", error);
    factText.textContent = "Sorry, couldn’t fetch a movie fact right now.";
  }
}

document.getElementById("factBtn").addEventListener("click", getMovieFact);
