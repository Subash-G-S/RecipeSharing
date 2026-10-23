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
      addToast(err.response?.data?.message || "Failed to load recipe", "error");
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
      <div className="container">
        <div className="empty-box">Loading recipe details...</div>
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
    <div className="container">
      <Link to="/" className="btn btn-sm" style={{ marginBottom: "15px" }}>
        Back to Recipes
      </Link>

      <div className="detail-box">
        <img
          className="detail-img"
          src={resolveImageUrl(recipe.imageUrl)}
          alt={recipe.title}
        />

        <h1 className="detail-title">{recipe.title}</h1>
        <div className="detail-info">
          Author: {recipe.author || "Anonymous"} | Cooking Time: {recipe.cookingTime || 15} minutes
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button className="btn btn-sm" onClick={handleLikeClick}>
            Like ({recipe.likes || 0})
          </button>

          <button
            className={`btn btn-sm ${isSaved ? "btn-primary" : ""}`}
            onClick={handleSaveClick}
          >
            {isSaved ? "Saved in Cookbook" : "Save to Cookbook"}
          </button>

          {isOwner && (
            <>
              <Link to={`/edit/${id}`} className="btn btn-sm">
                Edit Recipe
              </Link>
              <button className="btn btn-sm btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </>
          )}
        </div>

        <div className="section-box">
          <h3>Ingredients</h3>
          <p className="help-text" style={{ marginBottom: "8px" }}>
            Check items as you prepare them:
          </p>
          <ul className="checklist">
            {ingredients.map((ing, idx) => (
              <li
                key={idx}
                className={checkedItems[idx] ? "checked" : ""}
                onClick={() => toggleCheck(idx)}
                style={{ cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(checkedItems[idx])}
                  readOnly
                />
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="section-box">
          <h3>Cooking Instructions</h3>
          <ol className="steps-list">
            {steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
