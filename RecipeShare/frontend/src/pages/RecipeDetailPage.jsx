import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { resolveImageUrl } from "../api";

export default function RecipeDetailPage({ currentUser, onLike, onSave, addToast, onDeleteRecipe }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    fetchRecipeDetail();
  }, [id]);

  const fetchRecipeDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/recipes/${id}`);
      setRecipe(res.data);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to load recipe details", "error");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleLikeClick = async () => {
    if (!recipe) return;
    await onLike(id);
    // Refresh local likes count
    setRecipe((prev) => (prev ? { ...prev, likes: (prev.likes || 0) + 1 } : prev));
  };

  const handleSaveClick = async () => {
    if (!recipe) return;
    const currentUsername = currentUser ? currentUser.username : "demo";
    await onSave(id);

    setRecipe((prev) => {
      if (!prev) return prev;
      const savedBy = prev.savedBy ? [...prev.savedBy] : [];
      const idx = savedBy.indexOf(currentUsername);
      if (idx === -1) {
        savedBy.push(currentUsername);
      } else {
        savedBy.splice(idx, 1);
      }
      return { ...prev, savedBy };
    });
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      return;
    }
    try {
      await api.delete(`/recipes/${id}`);
      addToast("Recipe deleted successfully.", "info");
      if (onDeleteRecipe) onDeleteRecipe(id);
      navigate("/");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete recipe", "error");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "5rem 0" }}>
        <p style={{ fontSize: "1.2rem", color: "var(--text-muted)" }}>🍳 Loading recipe details...</p>
      </div>
    );
  }

  if (!recipe) return null;

  const currentUsername = currentUser ? currentUser.username : "demo";
  const isSaved = Array.isArray(recipe.savedBy) && recipe.savedBy.includes(currentUsername);
  const isOwner =
    currentUser &&
    ((recipe.author || "").toLowerCase() === currentUser.username.toLowerCase() ||
      (recipe.author || "").toLowerCase() === (currentUser.name || "").toLowerCase() ||
      currentUser.username === "demo");

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];

  return (
    <div className="detail-container">
      <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem", fontWeight: 600, color: "var(--primary)" }}>
        ← Back to All Recipes
      </Link>

      <div className="detail-card">
        {/* Cover Image */}
        <div
          className="detail-hero-img"
          style={{ backgroundImage: `url('${resolveImageUrl(recipe.imageUrl)}')` }}
        >
          <div className="card-time-badge" style={{ fontSize: "0.9rem", padding: "0.4rem 1rem", bottom: "16px", left: "20px", top: "auto" }}>
            ⏱️ {recipe.cookingTime || 15} minutes
          </div>
        </div>

        <div className="detail-body">
          {/* Header row */}
          <div className="detail-header-row">
            <div>
              <h1 className="detail-main-title">{recipe.title}</h1>
              <div className="detail-meta">
                Created with passion by <strong>{recipe.author || "Chef"}</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <button className="btn btn-outline" onClick={handleLikeClick} title="Like recipe">
                <span>❤️</span>
                <span>{recipe.likes || 0}</span>
              </button>

              <button
                className={`btn btn-outline ${isSaved ? "card-save-btn saved" : ""}`}
                onClick={handleSaveClick}
                style={{ borderRadius: "var(--radius-full)" }}
              >
                <span>{isSaved ? "💖 Saved" : "🤍 Save"}</span>
              </button>
            </div>
          </div>

          {/* Grid: Ingredients & Steps */}
          <div className="detail-grid">
            {/* Ingredients Checklist */}
            <div>
              <h3 className="box-heading">🛒 Ingredients Needed</h3>
              <p className="box-subheading">Check off ingredients as you prepare them:</p>
              <ul className="checklist">
                {ingredients.map((ing, idx) => (
                  <li
                    key={idx}
                    className={`checklist-item ${checkedItems[idx] ? "checked" : ""}`}
                    onClick={() => toggleCheck(idx)}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(checkedItems[idx])}
                      readOnly
                      style={{ cursor: "pointer" }}
                    />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preparation Steps */}
            <div>
              <h3 className="box-heading">📋 Step-by-Step Instructions</h3>
              <ol className="steps-list">
                {steps.map((step, idx) => (
                  <li key={idx} className="step-card">
                    <div className="step-badge">{idx + 1}</div>
                    <div style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>{step}</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Recipe Management for Author */}
          {isOwner && (
            <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-muted)" }}>
                Author Actions:
              </span>
              <Link to={`/edit/${id}`} className="btn btn-sm btn-secondary">
                ✏️ Edit Recipe
              </Link>
              <button className="btn btn-sm btn-delete" onClick={handleDelete}>
                🗑️ Delete Recipe
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
