import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function CreateRecipePage({ currentUser, onRecipeCreated, addToast }) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [cookingTime, setCookingTime] = useState(20);
  const [author, setAuthor] = useState(currentUser?.name || currentUser?.username || "Subash Chef");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [imageTab, setImageTab] = useState("url");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const sampleImages = [
    { label: "Salad", url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80" },
    { label: "Pizza", url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80" },
    { label: "Pasta", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80" },
    { label: "Dessert", url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80" }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setImageUrl(res.data.imageUrl);
      addToast("Image uploaded successfully.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Image upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ingredients = ingredientsText.split("\n").map((s) => s.trim()).filter(Boolean);
    const steps = stepsText.split("\n").map((s) => s.trim()).filter(Boolean);

    if (ingredients.length === 0 || steps.length === 0) {
      addToast("Please provide at least 1 ingredient and 1 instruction step.", "error");
      return;
    }

    const payload = {
      title: title.trim(),
      cookingTime: Number(cookingTime) || 15,
      author: author.trim() || "Anonymous",
      imageUrl: imageUrl.trim() || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80",
      ingredients,
      steps
    };

    try {
      setSubmitting(true);
      const res = await api.post("/recipes", payload);
      addToast("Recipe created successfully.", "success");
      if (onRecipeCreated) onRecipeCreated(res.data);
      navigate(`/recipe/${res.data._id || res.data.id}`);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create recipe.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <Link to="/" className="btn btn-sm" style={{ marginBottom: "15px" }}>
        Back to Recipes
      </Link>

      <div className="form-box">
        <h2 className="form-title">Add New Recipe</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Recipe Title *</label>
            <input
              type="text"
              placeholder="e.g. Tomato Garlic Pasta"
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
              <label>Author Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Recipe Image</label>
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
              <button
                type="button"
                className={`filter-btn ${imageTab === "url" ? "active" : ""}`}
                onClick={() => setImageTab("url")}
              >
                Use Image URL
              </button>
              <button
                type="button"
                className={`filter-btn ${imageTab === "upload" ? "active" : ""}`}
                onClick={() => setImageTab("upload")}
              >
                Upload Image File
              </button>
            </div>

            {imageTab === "url" ? (
              <div>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "6px", fontSize: "0.8rem", color: "#666" }}>
                  <span>Quick samples:</span>
                  {sampleImages.map((s, i) => (
                    <a
                      key={i}
                      href="javascript:void(0)"
                      onClick={() => setImageUrl(s.url)}
                      style={{ color: "#0066cc" }}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <input type="file" accept="image/*" onChange={handleFileUpload} />
                <div className="help-text">
                  {uploading ? "Uploading image..." : "PNG, JPG up to 5MB"}
                </div>
              </div>
            )}

            {imageUrl && (
              <div style={{ marginTop: "10px" }}>
                <img
                  src={imageUrl.startsWith("/") ? `http://localhost:5000${imageUrl}` : imageUrl}
                  alt="Preview"
                  style={{ width: "120px", height: "80px", objectFit: "cover", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Ingredients (1 per line) *</label>
            <textarea
              rows="4"
              placeholder="1 cup flour&#10;2 eggs&#10;1/2 cup milk"
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              required
            />
            <div className="help-text">Type each ingredient on a new line</div>
          </div>

          <div className="form-group">
            <label>Cooking Steps (1 step per line) *</label>
            <textarea
              rows="4"
              placeholder="Mix dry ingredients.&#10;Add milk and eggs.&#10;Cook in pan for 5 minutes."
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              required
            />
            <div className="help-text">Type each step on a new line</div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
            <Link to="/" className="btn">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Create Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
