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
    <header className="navbar">
      <div className="nav-inner">
        <Link to="/" className="brand-title" onClick={clearSearch}>
          RecipeShare
        </Link>

        <div className="nav-search">
          <input
            type="text"
            placeholder="Search by ingredient or title..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button className="btn btn-sm" onClick={clearSearch}>
              Clear
            </button>
          )}
        </div>

        <div className="nav-actions">
          <Link to="/" className="btn btn-sm">
            Home
          </Link>

          <Link to="/saved" className="btn btn-sm">
            Saved ({savedCount})
          </Link>

          <Link to="/create" className="btn btn-sm btn-primary">
            Add Recipe
          </Link>

          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="user-badge">{currentUser.name || currentUser.username}</span>
              <button className="btn btn-sm" onClick={onLogout}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
