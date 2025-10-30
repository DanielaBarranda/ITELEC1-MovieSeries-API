// ================= LANDING SCROLL ANIMATION =================
const arrow = document.getElementById("scrollArrow");
const landing = document.querySelector(".landing");

arrow.addEventListener("click", () => {
  landing.classList.add("slide-up");
  arrow.classList.add("slide-away");
});

// ================= WEATHER + MOVIE MOOD =================
const WEATHER_API_KEY = "3e5a7eb1fa9e9597753931bac70bc76f";
const TMDB_JWT = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMjA5YTIzMzJhNmNhMDBiZTlhZmU3ZDE1OTFlOTQ3ZCIsIm5iZiI6MTc2MTU0NzI0MS44MjcwMDAxLCJzdWIiOiI2OGZmMTNlOTE1NjE4ZjAzOThkYTAyMjAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.7BrLe9Tt81ZEIg2T0zV8elagGYC78noCauoVOJIMJHE";

// TMDB Genre Map
const GENRES = {
  romance: "10749",
  adventure: "12",
  drama: "18",
  comedy: "35",
  popular: "28" 
};

async function getWeatherAndMood() {
  navigator.geolocation.getCurrentPosition(async position => {
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

    // LEFT SIDE DETAILS
    document.getElementById("weatherTemp").textContent = `${temp}°C`;
    document.getElementById("weatherLocation").textContent = city;
    document.getElementById("weatherIcon").src =
      `https://openweathermap.org/img/wn/${icon}@2x.png`;

    // RIGHT SIDE MOOD TEXT & GENRE
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

  // ==== DISPLAY POSTERS ====
  const movieListContainer = document.getElementById("movie-list");
  movieListContainer.innerHTML = list
    .map(movie => `
      <div class="movie-card">
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
        <p>${movie.title}</p>
      </div>
    `)
    .join("");

  // ==== TEXT SUGGESTION (1-2 movie names) ====
  if (list.length >= 2) {
    document.getElementById("movieNameSuggestions").innerHTML =
      `Try <b>${list[0].title}</b>, <b>${list[1].title}</b>, or <b>${list[2].title}</b> today. </br> See more in our suggested movies below!`;
  }
}

// Refresh button
document.getElementById("refreshMoodBtn").onclick = getWeatherAndMood;

// "See More" button → Discover
document.getElementById("seeMoreBtn").onclick = () =>
  window.location.href = "../discover/discover.html";

// Load at start
getWeatherAndMood();

// ================= MOVIE FACTS & TRIVIA =================
async function getMovieFact() {
  const factText = document.getElementById("movieFact");
  factText.textContent = "Loading a fun fact... 🎥";

  try {
    const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
    const data = await res.json();

    // Clean and show fact
    factText.textContent = data.text
      ? data.text
      : "No fact found — try again!";
  } catch (error) {
    console.error("Error fetching movie fact:", error);
    factText.textContent = "Sorry, couldn’t fetch a movie fact right now.";
  }
}

// Event listener
document.getElementById("factBtn").addEventListener("click", getMovieFact);

