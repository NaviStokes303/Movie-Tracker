// ============================================
// Movie Tracker - Backend Server
// AP Computer Science Final Project
// server.js
// ============================================

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 3000;

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Enable CORS so the frontend can communicate with this server
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// ============================================
// DATABASE CONNECTION
// ============================================

// Pool manages a collection of database connections for efficiency
const pool = new Pool({
    user: 'postgres',       // Your PostgreSQL username
    host: 'localhost',      // Database is on the same machine
    database: 'movie_tracker', // The database we created
    password: 'AllanWang',   // Your PostgreSQL password
    port: 5432              // Default PostgreSQL port
});

// ============================================
// API ENDPOINTS
// ============================================

// --- GET: Retrieve all movies with their platform info ---
// Returns a joined table of movies + platform names
app.get('/api/movies', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                m.movie_id,
                m.title,
                m.genre,
                m.release_year,
                m.director,
                p.name AS platform_name
            FROM movies m
            LEFT JOIN platforms p ON m.platform_id = p.platform_id
            ORDER BY m.title ASC
        `);
        res.json(result.rows);
    } catch (error) {
        // Log the error on the server and send a 500 status to the client
        console.error('Error fetching movies:', error);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

// --- GET: Search movies by title (partial match) ---
// Uses ILIKE for case-insensitive search
// Example: GET /api/movies/search?q=inception
app.get('/api/movies/search', async (req, res) => {
    try {
        const { q } = req.query;

        // If no search term is provided, return an error
        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }

        // $1 is a parameterized placeholder to prevent SQL injection
        const result = await pool.query(
            `SELECT m.movie_id, m.title, m.genre, m.release_year, m.director,
                    p.name AS platform_name
             FROM movies m
             LEFT JOIN platforms p ON m.platform_id = p.platform_id
             WHERE m.title ILIKE $1
             ORDER BY m.title ASC`,
            [`%${q}%`] // Wrap search term in % for partial matching
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error searching movies:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// --- GET: Retrieve a specific user's watchlist ---
// Joins watchlist, movies, and platforms to get full details
// Example: GET /api/watchlist/1
app.get('/api/watchlist/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(`
            SELECT 
                w.watchlist_id,
                m.title,
                m.genre,
                m.release_year,
                p.name AS platform_name,
                w.status,
                w.rating,
                w.date_added,
                w.notes
            FROM watchlist w
            JOIN movies m ON w.movie_id = m.movie_id
            LEFT JOIN platforms p ON m.platform_id = p.platform_id
            WHERE w.user_id = $1
            ORDER BY w.date_added DESC
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

// --- GET: Retrieve all users ---
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT user_id, name, email, created_at FROM users ORDER BY name ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// --- GET: Retrieve all platforms ---
app.get('/api/platforms', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM platforms ORDER BY name ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching platforms:', error);
        res.status(500).json({ error: 'Failed to fetch platforms' });
    }
});

// --- POST: Add a new movie to the database ---
// Expects JSON body: { title, genre, release_year, director, platform_id }
app.post('/api/movies', async (req, res) => {
    try {
        const { title, genre, release_year, director, platform_id } = req.body;

        // Validate that required fields are present
        if (!title) {
            return res.status(400).json({ error: 'Movie title is required' });
        }

        const result = await pool.query(
            `INSERT INTO movies (title, genre, release_year, director, platform_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [title, genre, release_year, director, platform_id]
        );

        // Return the newly created movie with 201 Created status
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding movie:', error);
        res.status(500).json({ error: 'Failed to add movie' });
    }
});

// --- POST: Add a movie to a user's watchlist ---
// Expects JSON body: { user_id, movie_id, status, rating, notes }
app.post('/api/watchlist', async (req, res) => {
    try {
        const { user_id, movie_id, status, rating, notes } = req.body;

        // Validate required fields
        if (!user_id || !movie_id || !status) {
            return res.status(400).json({ error: 'user_id, movie_id, and status are required' });
        }

        const result = await pool.query(
            `INSERT INTO watchlist (user_id, movie_id, status, rating, notes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [user_id, movie_id, status, rating || null, notes || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
});

// --- PUT: Update a watchlist entry's status and/or rating ---
// Expects JSON body: { status, rating, notes }
// Example: PUT /api/watchlist/3
app.put('/api/watchlist/:watchlistId', async (req, res) => {
    try {
        const { watchlistId } = req.params;
        const { status, rating, notes } = req.body;

        // Validate that at least one field is being updated
        if (!status && rating === undefined && !notes) {
            return res.status(400).json({ error: 'No update fields provided' });
        }

        const result = await pool.query(
            `UPDATE watchlist
             SET status = COALESCE($1, status),
                 rating = COALESCE($2, rating),
                 notes  = COALESCE($3, notes)
             WHERE watchlist_id = $4
             RETURNING *`,
            [status || null, rating || null, notes || null, watchlistId]
        );

        // If no rows were updated, the entry doesn't exist
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Watchlist entry not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating watchlist:', error);
        res.status(500).json({ error: 'Failed to update watchlist' });
    }
});

// --- DELETE: Remove a movie from a user's watchlist ---
// Example: DELETE /api/watchlist/3
app.delete('/api/watchlist/:watchlistId', async (req, res) => {
    try {
        const { watchlistId } = req.params;

        const result = await pool.query(
            'DELETE FROM watchlist WHERE watchlist_id = $1 RETURNING *',
            [watchlistId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Watchlist entry not found' });
        }

        res.json({ message: 'Entry deleted successfully', deleted: result.rows[0] });
    } catch (error) {
        console.error('Error deleting from watchlist:', error);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});

// ============================================
// START THE SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`Movie Tracker server running at http://localhost:${PORT}`);
});