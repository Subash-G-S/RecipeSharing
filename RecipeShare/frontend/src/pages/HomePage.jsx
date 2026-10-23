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

  // Filter recipes
  const filteredRecipes = recipes.filter((r) => {
    // Search query matching
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (r.title || "").toLowerCase().includes(q);
      const matchAuthor = (r.author || "").toLowerCase().includes(q);
      const matchIng = Array.isArray(r.ingredients) && r.ingredients.some((ing) => ing.toLowerCase().includes(q));
      if (!matchTitle && !matchAuthor && !matchIng) return false;
    }

    // Selected ingredient tag
    if (selectedTag) {
      const tag = selectedTag.toLowerCase();
      const matchTitle = (r.title || "").toLowerCase().includes(tag);
      const matchIng = Array.isArray(r.ingredients) && r.ingredients.some((ing) => ing.toLowerCase().includes(tag));
      if (!matchTitle && !matchIng) return false;
    }

    // Tab filter
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

  const handleChipClick = (filter) => {
    setActiveFilter(filter);
    setSelectedTag("");
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setActiveFilter("all");
  };

  return (
    <div>
      {/* Hero Header */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-pill">✨ Handcrafted Flavors & Community Recipes</span>
          <h1 className="hero-title">
            Cook, Share & Discover <br />
            <span className="highlight">Everyday Masterpieces</span>
          </h1>
          <p className="hero-subtitle">
            Browse wholesome recipes, search by ingredients in your fridge, like your favorites, and save
            recipes to your personal cookbook.
          </p>
        </div>

        {/* Filter Chips Bar */}
        <div className="filter-chips-container">
          <button
            className={`chip ${activeFilter === "all" && !selectedTag ? "active" : ""}`}
            onClick={() => handleChipClick("all")}
          >
            🍽️ All Recipes
          </button>
          <button
            className={`chip ${activeFilter === "quick" ? "active" : ""}`}
            onClick={() => handleChipClick("quick")}
          >
            ⚡ Under 25 Mins
          </button>
          <button
            className={`chip ${activeFilter === "my-recipes" ? "active" : ""}`}
            onClick={() => handleChipClick("my-recipes")}
          >
            👨‍🍳 My Recipes
          </button>
          <button
            className={`chip ${selectedTag === "garlic" ? "active" : ""}`}
            onClick={() => handleTagClick("garlic")}
          >
            🧄 Garlic
          </button>
          <button
            className={`chip ${selectedTag === "cheese" ? "active" : ""}`}
            onClick={() => handleTagClick("cheese")}
          >
            🧀 Cheese
          </button>
          <button
            className={`chip ${selectedTag === "pasta" ? "active" : ""}`}
            onClick={() => handleTagClick("pasta")}
          >
            🍝 Pasta
          </button>
        </div>
      </section>

      {/* Main Grid */}
      <main className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : selectedTag
                ? `Recipes featuring "${selectedTag}"`
                : activeFilter === "quick"
                ? "Quick & Easy Recipes"
                : activeFilter === "my-recipes"
                ? "My Published Recipes"
                : "Explore Community Recipes"}
            </h2>
            <p className="section-subtitle">
              Showing {filteredRecipes.length} delicious recipe{filteredRecipes.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <p style={{ fontSize: "1.2rem", color: "var(--text-muted)" }}>🍳 Loading fresh recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", background: "white", borderRadius: "16px", border: "2px dashed #e2e8f0" }}>
            <div style={{ fontSize: "3rem" }}>🥣</div>
            <h3 style={{ marginTop: "1rem" }}>No recipes found</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Try searching for a different ingredient or publish your own recipe!
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: "1.5rem" }}
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
      </main>
    </div>
  );
}
