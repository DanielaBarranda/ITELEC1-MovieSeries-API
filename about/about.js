fetch("/ITELEC1-MovieSeries-API")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("navbar-placeholder").innerHTML = data;
  })
  .catch((error) => {
    console.error("Failed to load navbar:", error);
  });

  