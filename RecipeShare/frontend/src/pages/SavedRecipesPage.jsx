import React from "react";
import { Link } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";

export default function SavedRecipesPage({ recipes, currentUser, onLike, onSave }) {
  const currentUsername = currentUser ? currentUser.username : "demo";

  const savedRecipes = recipes.filter(
    (r) => Array.isArray(r.savedBy) && r.savedBy.includes(currentUsername)
  );

  return (
    <div className="container">
      <div className="section-header">
        <div>
          <h1 className="section-title">💖 Your Saved Cookbook</h1>
          <p className="section-subtitle">
            Bookmarked recipes you plan to cook and love
          </p>
        </div>
        <div className="count-badge">{savedRecipes.length} saved</div>
      </div>

      {savedRecipes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 1rem", background: "white", borderRadius: "16px", border: "2px dashed #e2e8f0", maxWidth: "540px", margin: "2rem auto" }}>
          <div style={{ fontSize: "3.5rem" }}>🔖</div>
          <h3 style={{ marginTop: "1rem", fontSize: "1.3rem" }}>Your cookbook is empty</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Tap the heart or save icon on any recipe to keep it in your personal cookbook!
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
            Explore Delicious Recipes 🍳
          </Link>
        </div>
      ) : (
        <div className="recipes-grid">
          {savedRecipes.map((recipe) => {
            const id = recipe._id || recipe.id;
            return (
              <RecipeCard
                key={id}
                recipe={recipe}
                isSaved={true}
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
