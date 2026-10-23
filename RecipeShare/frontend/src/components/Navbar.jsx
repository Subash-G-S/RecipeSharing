import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ searchQuery, setSearchQuery, currentUser, onLogout, savedCount }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <header class="navbar">
      <div className="nav-inner">
        {/* Brand */}
        <Link to="/" className="brand" onClick={clearSearch}>
          <span className="brand-icon">🍳</span>
          <div>
            <div className="brand-name">RecipeShare</div>
            <div className="brand-tag">Taste Community</div>
          </div>
        </Link>

        {/* Live Search */}
        <div className="nav-search">
          <span className="nav-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by ingredient (e.g. garlic, chicken, cheese)..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button className="nav-search-clear" onClick={clearSearch} title="Clear">
              ✕
            </button>
          )}
        </div>

        {/* Nav Links & Actions */}
        <div className="nav-actions">
          <Link
            to="/saved"
            className={`nav-link-btn ${location.pathname === "/saved" ? "active" : ""}`}
            title="Saved Recipes"
          >
            <span>💖</span>
            <span>Saved</span>
            {savedCount > 0 && <span className="badge-counter">{savedCount}</span>}
          </Link>

          <Link to="/create" className="btn btn-primary">
            <span>➕</span>
            <span>New Recipe</span>
          </Link>

          {currentUser ? (
            <div className="user-nav-pill">
              <div className="user-avatar">
                {(currentUser.name || currentUser.username || "U")[0].toUpperCase()}
              </div>
              <span>{currentUser.name || currentUser.username}</span>
              <button className="logout-btn" onClick={onLogout} title="Logout">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline">
              <span>👤</span>
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
