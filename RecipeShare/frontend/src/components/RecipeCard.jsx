import React from "react";
import { Link } from "react-router-dom";
import { resolveImageUrl } from "../api";

export default function RecipeCard({ recipe, isSaved, onLike, onSave }) {
  const id = recipe._id || recipe.id;
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const tags = ingredients.slice(0, 3);
  const extraCount = ingredients.length - 3;

  return (
    <div className="recipe-card">
      <div className="card-img-wrapper">
        <img
          className="card-img"
          src={resolveImageUrl(recipe.imageUrl)}
          alt={recipe.title}
          loading="lazy"
        />
        <div className="card-time-badge">⏱️ {recipe.cookingTime || 15} min</div>
        <button
          className={`card-save-btn ${isSaved ? "saved" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onSave(id);
          }}
          title={isSaved ? "Saved in cookbook" : "Save to cookbook"}
        >
          {isSaved ? "💖" : "🤍"}
        </button>
      </div>

      <div className="card-content">
        <span className="card-author">By {recipe.author || "Chef"}</span>
        <h3 className="card-title">{recipe.title}</h3>

        <div className="card-tags">
          {tags.map((tag, idx) => (
            <span key={idx} className="card-tag">
              {tag.split(",")[0].trim()}
            </span>
          ))}
          {extraCount > 0 && <span className="card-tag">+{extraCount} more</span>}
        </div>

        <div className="card-footer">
          <button
            className="card-like-btn"
            onClick={(e) => {
              e.stopPropagation();
              onLike(id);
            }}
            title="Like recipe"
          >
            <span>❤️</span>
            <span>{recipe.likes || 0}</span>
          </button>

          <Link to={`/recipe/${id}`} className="card-link">
            View Recipe ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
