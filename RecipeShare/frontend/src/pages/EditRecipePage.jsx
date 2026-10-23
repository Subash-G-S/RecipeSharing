import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function EditRecipePage({ addToast, onRecipeUpdated }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [cookingTime, setCookingTime] = useState(20);
  const [author, setAuthor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/recipes/${id}`);
      const r = res.data;
      setTitle(r.title || "");
      setCookingTime(r.cookingTime || 20);
      setAuthor(r.author || "");
      setImageUrl(r.imageUrl || "");
      setIngredientsText(Array.isArray(r.ingredients) ? r.ingredients.join("\n") : "");
      setStepsText(Array.isArray(r.steps) ? r.steps.join("\n") : "");
    } catch (err) {
      addToast(err.response?.data?.message || "Could not load recipe to edit", "error");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ingredients = ingredientsText.split("\n").map((s) => s.trim()).filter(Boolean);
    const steps = stepsText.split("\n").map((s) => s.trim()).filter(Boolean);

    if (ingredients.length === 0 || steps.length === 0) {
      addToast("Please provide at least 1 ingredient and 1 step.", "error");
      return;
    }

    const payload = {
      title: title.trim(),
      cookingTime: Number(cookingTime) || 15,
      author: author.trim(),
      imageUrl: imageUrl.trim(),
      ingredients,
      steps
    };

    try {
      setSaving(true);
      const res = await api.put(`/recipes/${id}`, payload);
      addToast("Recipe updated successfully! ✨", "success");
      if (onRecipeUpdated) onRecipeUpdated(res.data);
      navigate(`/recipe/${id}`);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update recipe", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "5rem 0" }}>
        <p style={{ fontSize: "1.2rem", color: "var(--text-muted)" }}>Loading recipe...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to={`/recipe/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem", fontWeight: 600, color: "var(--primary)" }}>
        ← Back to Recipe
      </Link>

      <div className="form-card">
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: "0.4rem" }}>
          Edit Recipe
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.8rem" }}>
          Update the recipe details and steps below.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Recipe Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cooking Time (minutes) *</label>
              <input
                type="number"
                min="1"
                max="480"
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Author / Chef Name</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Recipe Dish Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Ingredients (1 per line) *</label>
            <textarea
              rows="4"
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Steps (1 per line) *</label>
            <textarea
              rows="4"
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.85rem", marginTop: "1.5rem" }}>
            <Link to={`/recipe/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Changes ✨"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
