// Replace this with your actual OMDb API key (get it from https://www.omdbapi.com/apikey.aspx)
const apiKey = "YOUR_OMDB_API_KEY";  

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id"); // Example: ?id=tt1375666 (Inception)

// Go back button
function goBack() {
  window.history.back();
}

// Fetch movie details from OMDb
async function fetchMovieDetails() {
  const titleEl = document.getElementById("movie-title");

  if (!movieId) {
    titleEl.textContent = "No movie selected.";
    document.getElementById("movie-poster").src = "placeholder.jpg";
    return;
  }

  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`);
    const data = await res.json();

    if (data.Response === "False") {
      titleEl.textContent = "Movie not found.";
      document.getElementById("movie-poster").src = "placeholder.jpg";
      return;
    }

    // Title + Basic Details
    titleEl.textContent = data.Title || "Untitled";
    document.getElementById("movie-original-title").textContent = `Original title: ${data.Title || "N/A"}`;
    document.getElementById("movie-details").textContent = `${data.Year || ""} · ${data.Rated || ""} · ${data.Runtime || ""}`;
    document.getElementById("movie-plot").textContent = data.Plot || "No description available.";
    document.getElementById("movie-director").textContent = data.Director || "N/A";
    document.getElementById("movie-cast").textContent = data.Actors || "N/A";

    // Poster
    const poster = (data.Poster && data.Poster !== "N/A") ? data.Poster : "placeholder.jpg";
    document.getElementById("movie-poster").src = poster;

    // Genre Tags
    const container = document.getElementById("movie-genres");
    container.innerHTML = "";
    if (data.Genre) {
      data.Genre.split(", ").forEach(g => {
        const el = document.createElement("span");
        el.textContent = g;
        container.appendChild(el);
      });
    }

  } catch (err) {
    console.error("OMDb fetch error:", err);
  }
}

// Optional: Trailer Button
document.getElementById("play-trailer-btn").addEventListener("click", () => {
  alert("Trailer action — you can replace this with a YouTube embed or modal later.");
});

// Initialize
fetchMovieDetails();
