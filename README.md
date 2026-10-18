# CineBook — Movie Ticket Booking Frontend

A responsive movie ticket booking website built with **HTML, CSS, and vanilla JavaScript**. This is a frontend-only demo; it does not connect to a real cinema or payment provider.

## Features
- Responsive homepage and movie cards
- Search movies by title, genre, or description
- Filter movies by genre
- Select a movie, show date, showtime, and seats
- Seat map with unavailable and selected seats
- Automatic ticket price calculation
- Demo booking confirmation and booking reference
- View and cancel bookings
- Saves bookings in browser `localStorage`

## Project structure
```text
cinebook_movie_booking/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    └── script.js
```

## Run the website
1. Extract the ZIP file.
2. Open the `cinebook_movie_booking` folder in VS Code.
3. Open `index.html` in a browser, or run it using the **Live Server** extension.

No installation or backend is required.

## Important
This project is a demo frontend. Movie listings, ratings, seat availability, and bookings are sample data. Bookings are stored only in the current browser and are not shared between devices. No payment is processed.

## Possible next step
Connect the frontend to a Python Flask backend and MySQL database to store movies, users, seats, and bookings persistently.
