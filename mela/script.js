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
async function suggestMoviesByMood(userMood) {
  movieSection.style.display = "block";
  movieSection.classList.add("active");
  movieContainer.innerHTML = "<p>Loading movies...</p>";

  const genreIds = moodToGenres[userMood] || [35];
  const randomPage = Math.floor(Math.random() * 5) + 1;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?with_genres=${genreIds.join(",")}&language=en-US&page=${randomPage}`,
      TMDB_OPTIONS
    );
    const data = await res.json();
    const shuffled = data.results.sort(() => 0.5 - Math.random()).slice(0, 7);
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
      <p>⭐ ${movie.vote_average.toFixed(1)}</p>
    </div>
  `;
  return card;
}

// --- Highlight Active Button ---
function highlightActiveButton(activeBtn) {
  const allButtons = document.querySelectorAll(".mood-buttons button");
  allButtons.forEach((btn) => btn.classList.remove("active"));
  activeBtn.classList.add("active");
}
