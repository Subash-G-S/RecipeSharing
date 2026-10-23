import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import api from "./api";

import Navbar from "./components/Navbar";
import Toast from "./components/Toast";

import HomePage from "./pages/HomePage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import CreateRecipePage from "./pages/CreateRecipePage";
import EditRecipePage from "./pages/EditRecipePage";
import SavedRecipesPage from "./pages/SavedRecipesPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState([]);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("recipeshare_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    if (currentUser) {
      fetchRecipes();
    }
  }, [currentUser]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/recipes");
      const list = Array.isArray(res.data) ? res.data : res.data.recipes || [];
      setRecipes(list);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      addToast("Failed to connect to backend API", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const username = currentUser ? currentUser.username : "guest";
      const res = await api.post(`/recipes/${id}/like`, { username });
      setRecipes((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, likes: res.data.likes } : r))
      );
      addToast("Recipe liked.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to like recipe", "error");
    }
  };
  const handleSave = async (id) => {
    if (!currentUser) return;
    try {
      const res = await api.post(`/recipes/${id}/save`, { username: currentUser.username });
      setRecipes((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, savedBy: res.data.savedBy } : r))
      );
      addToast(res.data.message, "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save recipe", "error");
    }
  };

  const handleRecipeCreated = (newRecipe) => {
    setRecipes((prev) => [newRecipe, ...prev]);
  };

  const handleRecipeUpdated = (updated) => {
    const targetId = updated._id || updated.id;
    setRecipes((prev) =>
      prev.map((r) => ((r._id || r.id) === targetId ? updated : r))
    );
  };

  const handleDeleteRecipe = (deletedId) => {
    setRecipes((prev) => prev.filter((r) => (r._id || r.id) !== deletedId));
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem("recipeshare_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("recipeshare_user");
    setRecipes([]);
    addToast("Logged out.", "info");
  };

  if (!currentUser) {
    return (
      <div className="app-container">
        <header className="navbar">
          <div className="nav-inner" style={{ justifyContent: "center" }}>
            <span className="brand-title">RecipeShare - Login Portal</span>
          </div>
        </header>

        <main className="main-content">
          <LoginPage onLoginSuccess={handleLoginSuccess} addToast={addToast} />
        </main>

        <Toast toasts={toasts} />
      </div>
    );
  }

  const savedCount = recipes.filter(
    (r) => Array.isArray(r.savedBy) && r.savedBy.includes(currentUser.username)
  ).length;

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onLogout={handleLogout}
          savedCount={savedCount}
        />

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  recipes={recipes}
                  loading={loading}
                  searchQuery={searchQuery}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onSave={handleSave}
                />
              }
            />
            <Route
              path="/recipe/:id"
              element={
                <RecipeDetailPage
                  currentUser={currentUser}
                  onLike={handleLike}
                  onSave={handleSave}
                  addToast={addToast}
                  onDeleteRecipe={handleDeleteRecipe}
                />
              }
            />
            <Route
              path="/create"
              element={
                <CreateRecipePage
                  currentUser={currentUser}
                  onRecipeCreated={handleRecipeCreated}
                  addToast={addToast}
                />
              }
            />
            <Route
              path="/edit/:id"
              element={
                <EditRecipePage
                  addToast={addToast}
                  onRecipeUpdated={handleRecipeUpdated}
                />
              }
            />
            <Route
              path="/saved"
              element={
                <SavedRecipesPage
                  recipes={recipes}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onSave={handleSave}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Toast toasts={toasts} />
      </div>
    </BrowserRouter>
  );
}
