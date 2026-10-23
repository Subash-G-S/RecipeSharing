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
      <div style={{ marginBottom: "15px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "4px" }}>Saved Recipes</h2>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          Recipes you have bookmarked ({savedRecipes.length})
        </p>
      </div>

      {savedRecipes.length === 0 ? (
        <div className="empty-box">
          <p>You have not saved any recipes yet.</p>
          <Link to="/" className="btn btn-sm btn-primary" style={{ marginTop: "10px" }}>
            Browse Recipes
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
