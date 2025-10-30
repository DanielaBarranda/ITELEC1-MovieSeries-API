// Navbar ID
fetch("/ITELEC1-MovieSeries-API")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("navbar-placeholder").innerHTML = data;
  })
  .catch((error) => {
    console.error("Failed to load navbar:", error);
  });

/* Insert nyo to sa html nyo:

<link rel="stylesheet" href="/ITELEC1-MovieSeries-API/nav-bar/nav-bar.css" />

<!-- Navbar -->
  <div id="navbar-placeholder"></div>

*/