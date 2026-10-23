import React from "react";
import { Link } from "react-router-dom";
import { resolveImageUrl } from "../api";

export default function RecipeCard({ recipe, isSaved, onLike, onSave }) {
  const id = recipe._id || recipe.id;
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

  return (
    <div className="recipe-card">
      <img
        className="card-image"
        src={resolveImageUrl(recipe.imageUrl)}
        alt={recipe.title}
        loading="lazy"
      />

      <div className="card-body">
        <h3 className="card-title">{recipe.title}</h3>
        <div className="card-meta">
          By {recipe.author || "Anonymous"} | Time: {recipe.cookingTime || 15} mins
        </div>

        <div className="card-ingredients">
          <strong>Ingredients:</strong>{" "}
          {ingredients.slice(0, 3).map((item) => item.split(",")[0].trim()).join(", ")}
          {ingredients.length > 3 ? "..." : ""}
        </div>

        <div className="card-actions">
          <button
            className="btn btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onLike(id);
            }}
          >
            Like ({recipe.likes || 0})
          </button>

          <button
            className={`btn btn-sm ${isSaved ? "btn-primary" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onSave(id);
            }}
          >
            {isSaved ? "Saved" : "Save"}
          </button>

          <Link to={`/recipe/${id}`} className="btn btn-sm btn-primary">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
