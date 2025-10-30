// Navbar ID
fetch("/nav-bar/nav.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("navbar-placeholder").innerHTML = data;
  })
  .catch((error) => {
    console.error("Failed to load navbar:", error);
  });

// TMDB Bearer Token
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
const movieContainer = document.getElementById("movieContainer");
const highlightGrid = document.querySelector(".highlight-grid");
const actionContainer = document.getElementById("actionContainer");
const cartoonContainer = document.getElementById("cartoonContainer");

// --- FAVORITES SETUP ---
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

  heart.addEventListener("click", () => {
    const isFavorited = favorites.some((fav) => fav.id === movie.id);
    if (isFavorited) {
      favorites = favorites.filter((fav) => fav.id !== movie.id);
      heart.textContent = "🤍";
    } else {
      favorites.push(movie);
      heart.textContent = "❤️";
    }
    updateFavorites();
  });

  container.appendChild(heart);
}

// Function to display general movies (Latest)
function displayMovies(movies) {
  movieContainer.innerHTML = "";
  if (!movies || movies.length === 0) {
    movieContainer.innerHTML = `<p>No movies found.</p>`;
    return;
  }

  const shuffledMovies = movies.sort(() => Math.random() - 0.5).slice(0, 7);

  shuffledMovies.forEach((movie) => {
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

    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card", "large-card");
    movieCard.style.position = "relative";
    movieCard.innerHTML = `
      <img src="${poster}" alt="${movie.title}">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p>${releaseDate} • ⭐ ${movie.vote_average.toFixed(1)}</p>
      </div>
    `;
    addFavoriteButton(movie, movieCard);
    movieContainer.appendChild(movieCard);
  });
}

// Function to display top 6 movies from 2025 (Highlights)
function display2025Highlights(movies) {
  highlightGrid.innerHTML = "";

  const movies2025 = movies
    .filter((movie) => movie.release_date && movie.release_date.startsWith("2025"))
    .slice(0, 6);

  if (movies2025.length === 0) {
    highlightGrid.innerHTML = `<p>No 2025 movies found.</p>`;
    return;
  }

  movies2025.forEach((movie) => {
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
    card.classList.add("movie-card");
    card.style.position = "relative";
    card.innerHTML = `
      <img src="${poster}" alt="${movie.title}">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p>${releaseDate} • ⭐ ${movie.vote_average.toFixed(1)}</p>
      </div>
    `;
    addFavoriteButton(movie, card);
    highlightGrid.appendChild(card);
  });
}

// --- Fetch Highlights (2025) ---
fetch("https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1", options)
  .then((res) => res.json())
  .then((data) => display2025Highlights(data.results))
  .catch((err) => console.error(err));

// --- Fetch Latest Movies ---
fetch("https://api.themoviedb.org/3/movie/popular?language=en-US&page=1", options)
  .then((res) => res.json())
  .then((data) => displayMovies(data.results))
  .catch((err) => console.error(err));

// --- Fetch Action Movies ---
function displayActionMovies(movies) {
  actionContainer.innerHTML = "";
  movies.slice(0, 7).forEach((movie) => {
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
    actionContainer.appendChild(card);
  });
}

fetch("https://api.themoviedb.org/3/discover/movie?with_genres=28&language=en-US&page=1", options)
  .then((res) => res.json())
  .then((data) => displayActionMovies(data.results))
  .catch((err) => console.error(err));

// --- Fetch Cartoons (Animation) ---
function displayCartoonMovies(movies) {
  cartoonContainer.innerHTML = "";
  movies.slice(0, 7).forEach((movie) => {
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
    cartoonContainer.appendChild(card);
  });
}

fetch("https://api.themoviedb.org/3/discover/movie?with_genres=16&language=en-US&page=1", options)
  .then((res) => res.json())
  .then((data) => displayCartoonMovies(data.results))
  .catch((err) => console.error(err));

// --- 🟦 SEARCH FUNCTION (Change entire screen) ---
document.addEventListener("DOMContentLoaded", () => {
  const checkNavbar = setInterval(() => {
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    if (searchInput && searchBtn) {
      clearInterval(checkNavbar);

      // Create search results container
      const searchSection = document.createElement("section");
      searchSection.id = "searchResultsSection";
      searchSection.classList.add("movies-section");
      searchSection.style.display = "none";
      searchSection.innerHTML = `
        <h2>Search Results</h2>
        <div id="searchResultsContainer" class="movie-grid"></div>
        <button id="backToDiscoverBtn" style="margin-top:20px;">← Back to Discover</button>
      `;
      document.querySelector("main.container").appendChild(searchSection);

      const searchResultsSection = document.getElementById("searchResultsSection");
      const searchResultsContainer = document.getElementById("searchResultsContainer");
      const backToDiscoverBtn = document.getElementById("backToDiscoverBtn");

      function showSearchResults(query) {
        if (!query) return;
        document.querySelectorAll("main section").forEach((section) => {
          if (section.id !== "searchResultsSection") section.style.display = "none";
        });
        searchResultsSection.style.display = "block";

        fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`, options)
          .then((res) => res.json())
          .then((data) => {
            searchResultsContainer.innerHTML = "";
            if (!data.results || data.results.length === 0) {
              searchResultsContainer.innerHTML = "<p>No results found.</p>";
              return;
            }

            data.results.slice(0, 20).forEach((movie) => {
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
              searchResultsContainer.appendChild(card);
            });
          })
          .catch((err) => {
            console.error(err);
            searchResultsContainer.innerHTML = "<p>Failed to load results.</p>";
          });
      }

      backToDiscoverBtn.addEventListener("click", () => {
        searchResultsSection.style.display = "none";
        document.querySelectorAll("main section").forEach((section) => {
          if (section.id !== "searchResultsSection") section.style.display = "block";
        });
      });

      searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        showSearchResults(query);
      });

      searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();
        if (query.length > 2) showSearchResults(query);
      });
    }
  }, 200);
});
