// Hamburger menu toggle — uses event delegation so it works after async navbar injection
document.addEventListener("click", function (e) {
  const btn = e.target.closest("#hamburger");
  if (!btn) return;
  const links = document.getElementById("navLinks");
  if (links) links.classList.toggle("open");
  btn.classList.toggle("active");
});
