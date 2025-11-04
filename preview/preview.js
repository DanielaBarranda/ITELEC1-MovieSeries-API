// Same token sa discover na page.
const token =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMjA5YTIzMzJhNmNhMDBiZTlhZmU3ZDE1OTFlOTQ3ZCIsIm5iZiI6MTc2MTU0NzI0MS44MjcwMDAxLCJzdWIiOiI2OGZmMTNlOTE1NjE4ZjAzOThkYTAyMjAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.7BrLe9Tt81ZEIg2T0zV8elagGYC78noCauoVOJIMJHE";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
};

// getting movies id
const urlParams = new URLSearchParams(window.location.search);
const movieID = urlParams.get("movieID");

const imageBaseURL = "https://image.tmdb.org/t/p/w500";
const movieTitle = document.getElementById("title");
const moviePoster = document.getElementById("poster");
const movieMeta = document.getElementById("meta");
const moviePlot = document.getElementById("plot");
const movieDirector = document.getElementById("director");
const movieCast = document.getElementById("cast");
const movieTrailer = document.getElementById("trailer");
const movieOriginalTitle = document.getElementById("original-title");
const genreTags = document.getElementById("genre-tags");
const noTrailer = document.querySelector(".no-trailer");

// reference for "Where to Watch"
const watchOptions = document.getElementById("watch-options");

if (movieID) {
  // Fetch movie details
  fetch(
    `https://api.themoviedb.org/3/movie/${movieID}?language=en-US&append_to_response=videos,credits`,
    options
  )
    .then((res) => res.json())
    .then((data) => {
      // Update content
      movieTitle.textContent = data.title || "No title available";
      movieOriginalTitle.textContent = `Original title: ${
        data.original_title || "N/A"
      }`;
      moviePoster.src = data.poster_path
        ? `${imageBaseURL}${data.poster_path}`
        : "https://via.placeholder.com/260x390?text=No+Poster";
      movieMeta.textContent = `${data.release_date?.split("-")[0] || "N/A"} · ⭐ ${
        data.vote_average?.toFixed(1) || "N/A"
      } · ${data.runtime || "N/A"} mins`;
      moviePlot.textContent = data.overview || "No description available.";

      // Director
      const director = data.credits?.crew?.find((p) => p.job === "Director");
      movieDirector.textContent = director ? director.name : "N/A";

      // Cast
      const castList = data.credits?.cast
        ?.slice(0, 3)
        .map((a) => a.name)
        .join(", ");
      movieCast.textContent = castList || "N/A";

      // Trailer
      const trailer = data.videos?.results?.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
      );

      if (trailer) {
        movieTrailer.src = `https://www.youtube.com/embed/${trailer.key}`;
        movieTrailer.style.display = "block";
        if (noTrailer) noTrailer.style.display = "none";
      } else {
        movieTrailer.src = "";
        movieTrailer.style.display = "none";
        if (noTrailer) noTrailer.style.display = "flex";
      }

      // Genres (tags)
      genreTags.innerHTML = "";
      if (data.genres?.length) {
        data.genres.forEach((genre) => {
          const tag = document.createElement("span");
          tag.textContent = genre.name;
          genreTags.appendChild(tag);
        });
      }

      // Where to Watch (using TMDB)
    fetch(`https://api.themoviedb.org/3/movie/${movieID}/watch/providers`, options)
      .then((res) => res.json())
      .then((provData) => {
        const country = provData.results?.PH || provData.results?.US || null;

        watchOptions.innerHTML = "<h3>Available on:</h3>";

        if (!country) {
          watchOptions.innerHTML +=
            "<p class='no-watch'>No streaming info available for your region.</p>";
          return;
        }

        const allProviders = [
          ...(country.flatrate || []),
          ...(country.buy || []),
          ...(country.rent || []),
        ];

        const unique = [];
        const seen = new Set();

        allProviders.forEach((prov) => {
          if (!seen.has(prov.provider_id)) {
            seen.add(prov.provider_id);
            unique.push(prov);
          }
        });

        if (unique.length) {
          const providersDiv = document.createElement("div");
          providersDiv.className = "provider-section";

          unique.forEach((prov) => {
            const span = document.createElement("span");
            span.className = "provider-badge";
            span.textContent = prov.provider_name;
            providersDiv.appendChild(span);
          });

          watchOptions.appendChild(providersDiv);
        } else {
          watchOptions.innerHTML +=
            "<p class='no-watch'>No streaming options available.</p>";
        }
      })
      .catch((err) => {
        console.error("Error fetching watch providers:", err);
        watchOptions.innerHTML =
          "<p class='no-watch'>Unable to load streaming options.</p>";
      });

        })
        .catch((err) => {
          console.error("Error fetching movie details:", err);
          movieTitle.textContent = "Failed to load movie details.";
        });
    } else {
      movieTitle.textContent = "No movie selected.";
    }
