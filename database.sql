DROP TABLE IF EXISTS watchlist;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS platforms;
DROP TABLE IF EXISTS users;

-- T:platforms

CREATE TABLE platforms (
    platform_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    website VARCHAR(200),
    monthly_cost DECIMAL(5,2)
);


--  t:movies

CREATE TABLE movies (
    movie_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    genre VARCHAR(50),
    release_year INTEGER,
    director VARCHAR(100),
    platform_id INTEGER REFERENCES platforms(platform_id)
);


-- t:users

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE
);

-- T:watchlist

CREATE TABLE watchlist (
    watchlist_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(movie_id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('watched', 'watching', 'plan_to_watch')) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    date_added DATE DEFAULT CURRENT_DATE,
    notes VARCHAR(500)
);


-- Platforms

INSERT INTO platforms (name, website, monthly_cost) VALUES
    ('Netflix', 'https://netflix.com', 15.99),
    ('Disney+', 'https://disneyplus.com', 10.99),
    ('HBO Max', 'https://max.com', 15.99),
    ('Amazon Prime', 'https://primevideo.com', 8.99),
    ('Hulu', 'https://hulu.com', 7.99),
    ('Apple TV+', 'https://tv.apple.com', 9.99);


-- movies 

INSERT INTO movies (title, genre, release_year, director, platform_id) VALUES
    ('Inception', 'Sci-Fi', 2010, 'Christopher Nolan', 3),
    ('The Lion King', 'Animation', 2019, 'Jon Favreau', 2),
    ('Stranger Things', 'Horror', 2016, 'Duffer Brothers', 1),
    ('Dune', 'Sci-Fi', 2021, 'Denis Villeneuve', 3),
    ('Encanto', 'Animation', 2021, 'Jared Bush', 2),
    ('The Boys', 'Action', 2019, 'Eric Kripke', 4),
    ('Oppenheimer', 'Drama', 2023, 'Christopher Nolan', 5),
    ('Ted Lasso', 'Comedy', 2020, 'Jason Sudeikis', 6),
    ('Squid Game', 'Thriller', 2021, 'Hwang Dong-hyuk', 1),
    ('Interstellar', 'Sci-Fi', 2014, 'Christopher Nolan', 4);

-- User
INSERT INTO users (name, email, created_at) VALUES
    ('Allan Wang', 'awang26@cranbrook.edu', '2025-01-01'),
    ('Alex Johnson', 'alex@email.com', '2025-01-15'),
    ('Maria Garcia', 'maria@email.com', '2025-02-20'),
    ('James Lee', 'james@email.com', '2025-03-10'),
    ('Sofia Patel', 'sofia@email.com', '2025-04-05'),
    ('Noah Williams', 'noah@email.com', '2025-05-18');
    
-- Watchlist
INSERT INTO watchlist (user_id, movie_id, status, rating, date_added, notes) VALUES
    (1, 1, 'watched', 5, '2025-06-01', 'Mind-blowing film, watched twice!'),
    (1, 3, 'watching', NULL, '2025-06-10', 'On season 3 now'),
    (1, 9, 'plan_to_watch', NULL, '2025-06-15', 'Everyone is talking about it'),
    (2, 2, 'watched', 4, '2025-05-20', 'Great remake'),
    (2, 5, 'watched', 5, '2025-05-25', 'Beautiful animation and music'),
    (3, 4, 'watched', 5, '2025-04-12', 'Stunning visuals'),
    (3, 10, 'watched', 5, '2025-04-20', 'Emotional and epic'),
    (4, 7, 'plan_to_watch', NULL, '2025-06-05', 'Heard great things'),
    (4, 6, 'watching', NULL, '2025-06-08', 'So good so far'),
    (5, 8, 'watched', 4, '2025-05-30', 'Surprisingly heartwarming');