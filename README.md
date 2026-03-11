# Movie Tracker
A full-stack web application for tracking movies you and your friends watch across streaming platforms.

## Description
Movie Tracker lets users organize movies they've watched, are currently watching, or plan to watch. Each user has a personalized watchlist where they can rate movies and leave notes. The app pulls live data from a PostgreSQL database through a Node.js/Express API.

## Tech Stack
- **Database:** PostgreSQL
- **Backend:** Node.js + Express
- **Frontend:** HTML, CSS, Vanilla JavaScript

## Database Schema
- **platforms** - stores streaming service info (platform_id, name, website, monthly_cost)
- **movies** - stores movie info, references platforms (movie_id, title, genre, release_year, director, platform_id)
- **users** - stores user accounts (user_id, name, email, created_at)
- **watchlist** - links users to movies with status and rating (watchlist_id, user_id, movie_id, status, rating, notes)

## Setup Instructions
1. Create the database: `psql -U postgres` then `CREATE DATABASE movie_tracker;`
2. Load schema: `psql -U postgres -d movie_tracker -f database.sql`
3. Update password in `server.js`
4. Run `npm install`
5. Run `node server.js`
6. Open `index.html` in your browser

## API Endpoints
- `GET /api/movies` - get all movies
- `GET /api/movies/search?q=term` - search movies by title
- `GET /api/watchlist/:userId` - get a user's watchlist
- `GET /api/users` - get all users
- `GET /api/platforms` - get all platforms
- `POST /api/movies` - add a new movie
- `POST /api/watchlist` - add to watchlist
- `PUT /api/watchlist/:id` - update watchlist entry
- `DELETE /api/watchlist/:id` - remove from watchlist