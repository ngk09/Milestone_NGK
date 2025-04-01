"use client"; // Ensure this is a client component

import { useState, useEffect } from "react";

// Temporarily hardcode the key
const API_KEY = "747e3777";
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

export default function MovieSearch() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState("");
    const [favorites, setFavorites] = useState([]);
    const [theme, setTheme] = useState("light");
    const [isMounted, setIsMounted] = useState(false); // Track whether the component is mounted
    const [showFavorites, setShowFavorites] = useState(false); // Track if the favorite movies list should be shown

    // Fetch movies based on search query
    const fetchMovies = async (searchQuery) => {
        if (!searchQuery) return;
        setError(""); // Clear previous errors

        try {
            const response = await fetch(`${API_URL}&s=${searchQuery}`);
            const data = await response.json();

            if (data.Response === "True") {
                setMovies(data.Search);
            } else {
                setMovies([]);
                setError(data.Error);
            }
        } catch (err) {
            setError("Failed to fetch data");
        }
    };

    // Handle theme toggle (Dark/Light Mode)
    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);

        // Apply the theme to the body and update the component styles
        if (newTheme === "dark") {
            document.body.style.backgroundColor = "#141414"; // Dark background
            document.body.style.color = "#fff"; // White text for dark mode
        } else {
            document.body.style.backgroundColor = "#fff"; // Light background
            document.body.style.color = "#333"; // Dark text for light mode
        }
    };

    // Add movie to favorites
    const handleAddToFavorites = (movie) => {
        setFavorites((prevFavorites) => {
            // Check if the movie is already in favorites
            if (!prevFavorites.some((fav) => fav.imdbID === movie.imdbID)) {
                return [...prevFavorites, movie];
            }
            return prevFavorites;
        });
    };

    // Toggle favorite movies display
    const toggleFavorites = () => {
        setShowFavorites((prevState) => !prevState);
    };

    useEffect(() => {
        // Set initial theme on mount
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);

        // Set the body background and text color based on the theme
        if (savedTheme === "dark") {
            document.body.style.backgroundColor = "#141414";
            document.body.style.color = "#fff";
        } else {
            document.body.style.backgroundColor = "#fff";
            document.body.style.color = "#333";
        }

        // Indicate that the component has mounted to avoid SSR mismatch
        setIsMounted(true);
    }, []);

    // Only render the component after it is mounted to avoid hydration mismatch
    if (!isMounted) {
        return null; // Return nothing until after mount
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Welcome to NGK Movie Recommender</h1>
            <p style={styles.subheading}>Search for movies below:</p>

            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search for a movie..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={styles.input}
                />
                <button onClick={() => fetchMovies(query)} style={styles.button}>
                    Search
                </button>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.moviesContainer}>
                {movies.map((movie) => (
                    <div
                        key={`${movie.imdbID}-${movie.Title}`} // Ensures key is unique
                        style={styles.movieCard}
                    >
                        <img
                            src={movie.Poster}
                            alt={movie.Title}
                            style={styles.image}
                        />
                        <h3 style={styles.movieTitle}>
                            {movie.Title} ({movie.Year})
                        </h3>

                        <button
                            onClick={() => handleAddToFavorites(movie)}
                            style={styles.favoriteButton}
                        >
                            Add to Favorites
                        </button>

                        <textarea
                            placeholder="Add your review"
                            onBlur={(e) =>
                                handleAddReview(movie.imdbID, e.target.value)
                            }
                            style={styles.textarea}
                        />
                    </div>
                ))}
            </div>

            <button onClick={toggleTheme} style={styles.themeToggleButton}>
                Switch Theme {theme === "light" ? "Dark" : "Light"} Mode
            </button>

            {/* Show Favorites Button */}
            <button onClick={toggleFavorites} style={styles.favoriteMoviesButton}>
                {showFavorites ? "Hide" : "Show"} Favorite Movies
            </button>

            {/* Show Favorite Movies */}
            {showFavorites && (
                <div style={styles.favoritesContainer}>
                    {favorites.length === 0 ? (
                        <p>No favorite movies added yet.</p>
                    ) : (
                        favorites.map((movie) => (
                            <div
                                key={`${movie.imdbID}-${movie.Title}`} // Ensures key is unique
                                style={styles.favoriteCard} // Smaller favorite card
                            >
                                <img
                                    src={movie.Poster}
                                    alt={movie.Title}
                                    style={styles.image}
                                />
                                <h3 style={styles.movieTitle}>
                                    {movie.Title} ({movie.Year})
                                </h3>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        fontFamily: "'Helvetica Neue', sans-serif",
        textAlign: "center",
        margin: "0",
        minHeight: "100vh",
    },
    heading: {
        fontSize: "48px",
        color: "#1e90ff", // Blue font for the heading
        fontWeight: "bold",
        marginTop: "40px",
    },
    subheading: {
        fontSize: "20px",
        color: "#aaa",
        marginBottom: "20px",
    },
    searchContainer: {
        marginBottom: "40px",
    },
    input: {
        padding: "12px 20px",
        fontSize: "18px",
        width: "320px",
        borderRadius: "5px",
        border: "1px solid #444",
        marginRight: "15px",
        backgroundColor: "#333",
        color: "#fff",
    },
    button: {
        padding: "12px 25px",
        fontSize: "18px",
        backgroundColor: "#ff6600",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
    error: {
        color: "red",
        fontSize: "14px",
        marginTop: "10px",
    },
    moviesContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "20px",
        padding: "0 20px",
        marginTop: "40px",
    },
    movieCard: {
        position: "relative",
        backgroundColor: "#222",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        cursor: "pointer",
        transition: "transform 0.3s ease", // Fixed transition property
    },
    image: {
        width: "100%",
        height: "auto",
        objectFit: "cover",
        borderRadius: "8px",
    },
    movieTitle: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#fff",
        marginTop: "15px",
    },
    favoriteButton: {
        position: "absolute",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        padding: "8px 15px",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        zIndex: 10,
    },
    textarea: {
        width: "100%",
        padding: "10px",
        marginTop: "10px",
        borderRadius: "5px",
        border: "1px solid #444",
        backgroundColor: "#333",
        color: "#fff",
        fontSize: "14px",
    },
    themeToggleButton: {
        padding: "12px 25px",
        marginTop: "30px",
        backgroundColor: "#333",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    favoriteMoviesButton: {
        padding: "12px 25px",
        marginTop: "30px",
        backgroundColor: "#0066cc",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    favoritesContainer: {
        marginTop: "40px",
        padding: "0 20px",
    },
    favoriteCard: {
        position: "relative",
        backgroundColor: "#222",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        cursor: "pointer",
        transition: "transform 0.3s ease", // Fixed transition property
    },
};
