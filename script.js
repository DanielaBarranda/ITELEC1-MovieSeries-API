const apiKey = "YOUR_OMDB_API_KEY"; //  don't forget to replace with the actual OMDb key
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");

function goBack(){
  window.history.back();
}

async function fetchMovieDetails(){
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

    titleEl.textContent = data.Title || "Untitled";
    document.getElementById("movie-original-title").textContent = `Original title: ${data.Title || "N/A"}`;
    document.getElementById("movie-details").textContent = `${data.Year || ""} · ${data.Rated || ""} · ${data.Runtime || ""}`;
    document.getElementById("movie-plot").textContent = data.Plot || "No description available.";
    document.getElementById("movie-director").textContent = data.Director || "N/A";
    document.getElementById("movie-cast").textContent = data.Actors || "N/A";

    const poster = (data.Poster && data.Poster !== "N/A") ? data.Poster : "placeholder.jpg";
    document.getElementById("movie-poster").src = poster;


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

document.getElementById("play-trailer-btn").addEventListener("click", () => {
  alert("Trailer action — implement open modal or embed YouTube here.");
});

fetchMovieDetails();
