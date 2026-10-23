import React, { useState } from "react";
import RecipeCard from "../components/RecipeCard";

export default function HomePage({
  recipes,
  loading,
  searchQuery,
  currentUser,
  onLike,
  onSave
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTag, setSelectedTag] = useState("");

  const currentUsername = currentUser ? currentUser.username : "demo";

  const filteredRecipes = recipes.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (r.title || "").toLowerCase().includes(q);
      const matchAuthor = (r.author || "").toLowerCase().includes(q);
      const matchIng = Array.isArray(r.ingredients) && r.ingredients.some((ing) => ing.toLowerCase().includes(q));
      if (!matchTitle && !matchAuthor && !matchIng) return false;
    }

    if (selectedTag) {
      const tag = selectedTag.toLowerCase();
      const matchTitle = (r.title || "").toLowerCase().includes(tag);
      const matchIng = Array.isArray(r.ingredients) && r.ingredients.some((ing) => ing.toLowerCase().includes(tag));
      if (!matchTitle && !matchIng) return false;
    }

    if (activeFilter === "quick") {
      return Number(r.cookingTime) <= 25;
    }
    if (activeFilter === "my-recipes") {
      if (currentUser) {
        return (
          (r.author || "").toLowerCase() === currentUser.username.toLowerCase() ||
          (r.author || "").toLowerCase() === (currentUser.name || "").toLowerCase()
        );
      }
      return (r.author || "").toLowerCase().includes("subash");
    }

    return true;
  });

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setSelectedTag("");
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setActiveFilter("all");
  };

  return (
    <div className="container">
      <div style={{ marginBottom: "15px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "4px" }}>Recipe Sharing Application</h2>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>Browse, search, and manage community recipes.</p>
      </div>

      {/* Filter Buttons */}
      <div className="filter-bar">
        <button
          className={`filter-btn ${activeFilter === "all" && !selectedTag ? "active" : ""}`}
          onClick={() => handleFilterClick("all")}
        >
          All Recipes
        </button>
        <button
          className={`filter-btn ${activeFilter === "quick" ? "active" : ""}`}
          onClick={() => handleFilterClick("quick")}
        >
          Quick (under 25 mins)
        </button>
        <button
          className={`filter-btn ${activeFilter === "my-recipes" ? "active" : ""}`}
          onClick={() => handleFilterClick("my-recipes")}
        >
          My Recipes
        </button>
        <button
          className={`filter-btn ${selectedTag === "garlic" ? "active" : ""}`}
          onClick={() => handleTagClick("garlic")}
        >
          Garlic
        </button>
        <button
          className={`filter-btn ${selectedTag === "cheese" ? "active" : ""}`}
          onClick={() => handleTagClick("cheese")}
        >
          Cheese
        </button>
        <button
          className={`filter-btn ${selectedTag === "pasta" ? "active" : ""}`}
          onClick={() => handleTagClick("pasta")}
        >
          Pasta
        </button>
      </div>

      <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "10px" }}>
        Showing {filteredRecipes.length} recipe{filteredRecipes.length === 1 ? "" : "s"}
      </div>

      {loading ? (
        <div className="empty-box">Loading recipes from database...</div>
      ) : filteredRecipes.length === 0 ? (
        <div className="empty-box">
          <p>No recipes found matching your query.</p>
          <button
            className="btn btn-sm"
            style={{ marginTop: "10px" }}
            onClick={() => {
              setActiveFilter("all");
              setSelectedTag("");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="recipes-grid">
          {filteredRecipes.map((recipe) => {
            const id = recipe._id || recipe.id;
            const isSaved = Array.isArray(recipe.savedBy) && recipe.savedBy.includes(currentUsername);
            return (
              <RecipeCard
                key={id}
                recipe={recipe}
                isSaved={isSaved}
                onLike={onLike}
                onSave={onSave}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
