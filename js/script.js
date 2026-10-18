const movies = [
  {id:1,title:"Solar Drift",genre:"Sci-Fi",duration:"2h 08m",rating:"8.6",price:220,theme:"space",tag:"TRENDING",description:"A journey beyond the stars."},
  {id:2,title:"Midnight Run",genre:"Action",duration:"2h 16m",rating:"8.2",price:200,theme:"crime",tag:"TOP PICK",description:"One night. No second chances."},
  {id:3,title:"Laughing Out Loud",genre:"Comedy",duration:"1h 52m",rating:"7.9",price:150,theme:"comedy",tag:"FEEL GOOD",description:"Chaos has never been this funny."},
  {id:4,title:"The Last Tide",genre:"Drama",duration:"2h 04m",rating:"8.4",price:180,theme:"ocean",tag:"CRITICS' CHOICE",description:"Some stories come full circle."},
  {id:5,title:"Wild Horizon",genre:"Action",duration:"2h 21m",rating:"8.1",price:210,theme:"forest",tag:"NEW RELEASE",description:"The wild is calling."},
  {id:6,title:"Velvet City",genre:"Drama",duration:"1h 58m",rating:"7.8",price:170,theme:"crime",tag:"MUST WATCH",description:"Every city has a secret."}
];

const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const bookingModal = document.getElementById("bookingModal");
const selectedMovieInfo = document.getElementById("selectedMovieInfo");
const seatMap = document.getElementById("seatMap");
const selectedSeatsText = document.getElementById("selectedSeatsText");
const totalPrice = document.getElementById("totalPrice");
const confirmBookingBtn = document.getElementById("confirmBookingBtn");
const bookingCount = document.getElementById("bookingCount");
const toast = document.getElementById("toast");

let activeGenre = "All";
let currentMovie = null;
let selectedSeats = [];
let occupiedSeats = [];
let toastTimer = null;
let bookings = loadBookings();

function loadBookings() {
  try { return JSON.parse(localStorage.getItem("cinebookBookings") || "[]"); }
  catch { return []; }
}
function saveBookings() {
  localStorage.setItem("cinebookBookings", JSON.stringify(bookings));
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function renderMovies() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = movies.filter(movie =>
    (activeGenre === "All" || movie.genre === activeGenre) &&
    `${movie.title} ${movie.genre} ${movie.description}`.toLowerCase().includes(query)
  );
  movieGrid.innerHTML = filtered.map(movie => `
    <article class="movie-card">
      <div class="poster" data-theme="${movie.theme}">
        <div class="poster-art"><i class="orb one"></i><i class="orb two"></i><i class="orb three"></i></div>
        <span class="poster-badge">${movie.tag}</span>
        <div class="poster-title">${movie.title}</div>
      </div>
      <div class="movie-info">
        <div class="movie-meta"><h3>${movie.title}</h3><span class="rating">★ ${movie.rating}</span></div>
        <div class="movie-details"><span>${movie.genre}</span><span>${movie.duration}</span></div>
        <div class="movie-card-bottom"><div class="price-label">TICKETS FROM<strong>₹${movie.price}</strong></div><button class="book-btn" data-book="${movie.id}">Book tickets ↗</button></div>
      </div>
    </article>`).join("");
  emptyState.classList.toggle("hidden", filtered.length > 0);
}
function populateDates() {
  const select = document.getElementById("showDate");
  select.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const value = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    const option = document.createElement("option");
    option.value = value;
    option.textContent = date.toLocaleDateString("en-IN", {weekday:"short",day:"numeric",month:"short"}) + (i === 0 ? " · Today" : "");
    select.appendChild(option);
  }
}
function getShowKey() {
  return `${currentMovie.id}|${document.getElementById("showDate").value}|${document.getElementById("showTime").value}`;
}
function getOccupiedSeats() {
  const key = getShowKey();
  const saved = bookings.filter(b => b.showKey === key).flatMap(b => b.seats);
  const fixed = [];
  for (let i = 0; i < 40; i++) if ((i * 7 + currentMovie.id * 3) % 13 === 0) fixed.push(i);
  return [...new Set([...fixed, ...saved])];
}
function openBooking(movieId) {
  currentMovie = movies.find(movie => movie.id === Number(movieId));
  if (!currentMovie) return;
  selectedSeats = [];
  document.getElementById("bookingStep").classList.remove("hidden");
  document.getElementById("bookingSuccess").classList.add("hidden");
  selectedMovieInfo.innerHTML = `<div class="mini-poster" style="background:linear-gradient(145deg,var(--accent),#4d5660)"></div><div><strong>${escapeHTML(currentMovie.title)}</strong><small>${currentMovie.genre} · ${currentMovie.duration} · ★ ${currentMovie.rating}</small></div>`;
  populateDates();
  renderSeats();
  bookingModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function renderSeats() {
  occupiedSeats = getOccupiedSeats();
  seatMap.innerHTML = "";
  for (let i = 0; i < 40; i++) {
    const row = String.fromCharCode(65 + Math.floor(i / 8));
    const number = (i % 8) + 1;
    const seatId = `${row}${number}`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "seat";
    button.textContent = number;
    button.title = `Seat ${seatId}`;
    button.setAttribute("aria-label", `Seat ${seatId}`);
    if (occupiedSeats.includes(i)) {
      button.classList.add("occupied");
      button.disabled = true;
    } else if (selectedSeats.includes(seatId)) {
      button.classList.add("selected");
      button.setAttribute("aria-pressed", "true");
    } else button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      if (selectedSeats.includes(seatId)) selectedSeats = selectedSeats.filter(s => s !== seatId);
      else if (selectedSeats.length < 8) selectedSeats.push(seatId);
      else { showToast("You can select up to 8 seats."); return; }
      renderSeats();
      updateSummary();
    });
    const spacer = document.createElement("span");
    if (i % 8 === 0) {
      spacer.style.display = "none";
    }
    seatMap.appendChild(button);
  }
  updateSummary();
}
function updateSummary() {
  selectedSeatsText.textContent = selectedSeats.length ? selectedSeats.slice().sort().join(", ") : "None";
  totalPrice.textContent = `₹${selectedSeats.length * (currentMovie?.price || 0)}`;
  confirmBookingBtn.disabled = selectedSeats.length === 0;
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2600);
}
function updateBookingCount() { bookingCount.textContent = bookings.length; }
function closeModal() {
  bookingModal.classList.add("hidden");
  document.body.style.overflow = "";
}
function renderBookings() {
  const list = document.getElementById("bookingsList");
  updateBookingCount();
  if (!bookings.length) {
    list.innerHTML = '<div class="no-bookings">No bookings yet.<br>Choose a movie and book your seats to see them here.</div>';
    return;
  }
  list.innerHTML = bookings.slice().reverse().map(booking => `
    <article class="booking-item">
      <h3>${escapeHTML(booking.movieTitle)}</h3>
      <p>${escapeHTML(booking.dateLabel)} · ${escapeHTML(booking.time)}<br>Seats: ${escapeHTML(booking.seats.join(", "))}<br>Total: ₹${booking.total}<br><span class="booking-ref">${escapeHTML(booking.code)}</span></p>
      <button class="cancel-booking" data-cancel="${escapeHTML(booking.code)}">Cancel booking</button>
    </article>`).join("");
}
movieGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-book]");
  if (button) openBooking(button.dataset.book);
});
searchInput.addEventListener("input", renderMovies);
document.getElementById("genreFilters").addEventListener("click", event => {
  const button = event.target.closest("[data-genre]");
  if (!button) return;
  activeGenre = button.dataset.genre;
  document.querySelectorAll(".filter-pill").forEach(pill => pill.classList.toggle("active", pill === button));
  renderMovies();
});
document.getElementById("showDate").addEventListener("change", () => { selectedSeats = []; renderSeats(); });
document.getElementById("showTime").addEventListener("change", () => { selectedSeats = []; renderSeats(); });
confirmBookingBtn.addEventListener("click", () => {
  if (!currentMovie || !selectedSeats.length) return;
  const dateValue = document.getElementById("showDate").value;
  const date = new Date(`${dateValue}T12:00:00`);
  const dateLabel = date.toLocaleDateString("en-IN", {weekday:"short",day:"numeric",month:"short",year:"numeric"});
  const code = "CB" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const booking = {
    code, movieId:currentMovie.id, movieTitle:currentMovie.title, date:dateValue, dateLabel,
    time:document.getElementById("showTime").value, seats:selectedSeats.slice().sort(),
    total:selectedSeats.length * currentMovie.price, showKey:getShowKey()
  };
  bookings.push(booking);
  saveBookings();
  document.getElementById("bookingStep").classList.add("hidden");
  document.getElementById("bookingSuccess").classList.remove("hidden");
  document.getElementById("successMessage").textContent = `${booking.movieTitle} · ${booking.dateLabel} at ${booking.time}. Seats ${booking.seats.join(", ")}. Total ₹${booking.total}.`;
  document.getElementById("ticketCode").textContent = booking.code;
  renderBookings();
  renderSeats();
});
document.getElementById("closeModalBtn").addEventListener("click", closeModal);
document.getElementById("doneBtn").addEventListener("click", closeModal);
bookingModal.addEventListener("click", event => { if (event.target === bookingModal) closeModal(); });
document.getElementById("viewBookingsBtn").addEventListener("click", () => {
  renderBookings();
  document.getElementById("bookingsDrawerBackdrop").classList.remove("hidden");
  document.body.style.overflow = "hidden";
});
function closeDrawer() {
  document.getElementById("bookingsDrawerBackdrop").classList.add("hidden");
  document.body.style.overflow = "";
}
document.getElementById("closeDrawerBtn").addEventListener("click", closeDrawer);
document.getElementById("bookingsDrawerBackdrop").addEventListener("click", event => {
  if (event.target.id === "bookingsDrawerBackdrop") closeDrawer();
});
document.getElementById("bookingsList").addEventListener("click", event => {
  const button = event.target.closest("[data-cancel]");
  if (!button) return;
  const booking = bookings.find(item => item.code === button.dataset.cancel);
  if (!booking) return;
  if (!confirm(`Cancel your booking for ${booking.movieTitle}?`)) return;
  bookings = bookings.filter(item => item.code !== booking.code);
  saveBookings();
  renderBookings();
  showToast("Booking cancelled.");
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
    closeDrawer();
  }
});
renderMovies();
renderBookings();
