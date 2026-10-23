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
    { label: "🥗 Fresh Salad", url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80" },
    { label: "🍕 Crispy Pizza", url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80" },
    { label: "🍝 Rich Pasta", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80" },
    { label: "🍰 Berry Cake", url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80" }
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
      addToast("Photo uploaded successfully!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Image upload failed", "error");
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
      author: author.trim() || "Chef",
      imageUrl: imageUrl.trim() || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80",
      ingredients,
      steps
    };

    try {
      setSubmitting(true);
      const res = await api.post("/recipes", payload);
      addToast("Recipe published successfully! 🍳", "success");
      if (onRecipeCreated) onRecipeCreated(res.data);
      navigate(`/recipe/${res.data._id || res.data.id}`);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create recipe", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem", fontWeight: 600, color: "var(--primary)" }}>
        ← Back to Recipes
      </Link>

      <div className="form-card">
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: "0.4rem" }}>
          Share a New Recipe
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.8rem" }}>
          Fill in the ingredients and steps to share your dish with the community.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label>Recipe Title *</label>
            <input
              type="text"
              placeholder="e.g. Crispy Garlic Parmesan Fries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Time & Author */}
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
                placeholder="Your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          {/* Image Choice */}
          <div className="form-group">
            <label>Recipe Dish Image</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
              <button
                type="button"
                className={`chip ${imageTab === "url" ? "active" : ""}`}
                style={{ padding: "0.3rem 0.8rem", fontSize: "0.82rem" }}
                onClick={() => setImageTab("url")}
              >
                Image URL
              </button>
              <button
                type="button"
                className={`chip ${imageTab === "upload" ? "active" : ""}`}
                style={{ padding: "0.3rem 0.8rem", fontSize: "0.82rem" }}
                onClick={() => setImageTab("upload")}
              >
                Upload File
              </button>
            </div>

            {imageTab === "url" ? (
              <div>
                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <span>Quick Presets:</span>
                  {sampleImages.map((s, i) => (
                    <a
                      key={i}
                      href="javascript:void(0)"
                      onClick={() => setImageUrl(s.url)}
                      style={{ color: "var(--primary)", fontWeight: 600 }}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="file-drop">
                <input type="file" accept="image/*" onChange={handleFileUpload} />
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  {uploading ? "⏳ Uploading photo..." : "📸 Click or drag dish photo to upload"}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  JPG, PNG, or WEBP up to 5MB
                </div>
              </div>
            )}

            {/* Preview */}
            {imageUrl && (
              <div style={{ marginTop: "0.75rem", display: "inline-block", position: "relative" }}>
                <img
                  src={imageUrl.startsWith("/") ? `http://localhost:5000${imageUrl}` : imageUrl}
                  alt="Preview"
                  style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: 4, padding: "2px 6px", fontSize: "0.7rem", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div className="form-group">
            <label>Ingredients Array (1 per line) *</label>
            <span className="hint">Enter each ingredient on a new line</span>
            <textarea
              rows="4"
              placeholder="4 large potatoes, cut into fries&#10;2 tbsp olive oil&#10;3 cloves garlic, minced&#10;1/2 cup parmesan cheese grated"
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              required
            />
          </div>

          {/* Steps */}
          <div className="form-group">
            <label>Steps Array (1 step per line) *</label>
            <span className="hint">Enter each preparation or cooking step on a new line</span>
            <textarea
              rows="4"
              placeholder="Soak cut potatoes in cold water for 30 minutes.&#10;Pat dry and toss with olive oil and garlic.&#10;Bake at 220°C for 25 minutes until crispy.&#10;Toss with parmesan and serve warm."
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.85rem", marginTop: "1.5rem" }}>
            <Link to="/" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Publishing..." : "Publish Recipe 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
