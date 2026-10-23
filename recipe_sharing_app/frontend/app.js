/**
 * TasteShare - Frontend Client Logic
 * Clean, modern, and simple implementation
 */

// Auto-detect API base URL (works seamlessly whether running on port 5000 or via Live Server)
const API_BASE = window.location.origin.includes(":5000") ? "" : "http://localhost:5000";

// App State
let allRecipes = [];
let currentFilter = "all";
let activeTagSearch = "";
let currentDetailRecipe = null;
let currentUser = null;

// Initialize app on page load
document.addEventListener("DOMContentLoaded", () => {
  loadStoredUser();
  setupSearchInput();
  fetchRecipes();
});

// -------------------------------------------------------------
// Authentication State Management
// -------------------------------------------------------------
function loadStoredUser() {
  const saved = localStorage.getItem("tasteshare_user");
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
    } catch (e) {
      currentUser = null;
    }
  }
  renderAuthNav();
}

function renderAuthNav() {
  const container = document.getElementById("auth-section");
  if (!container) return;

  if (currentUser) {
    const initial = (currentUser.name || currentUser.username || "U")[0].toUpperCase();
    container.innerHTML = `
      <div class="user-nav-pill">
        <div class="user-avatar">${initial}</div>
        <span>${escapeHtml(currentUser.name || currentUser.username)}</span>
        <span class="logout-link" onclick="logout()" title="Sign out">Logout</span>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="btn btn-outline" onclick="openAuthModal('login')">
        <span>👤</span>
        <span>Sign In</span>
      </button>
    `;
  }
  updateSavedBadge();
}

function openAuthModal(mode = "login") {
  switchAuthMode(mode);
  openModal("auth-modal");
}

function switchAuthMode(mode) {
  const tabLogin = document.getElementById("auth-tab-login");
  const tabRegister = document.getElementById("auth-tab-register");
  const groupName = document.getElementById("group-name");
  const submitBtn = document.getElementById("auth-submit-btn");

  if (mode === "register") {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    groupName.style.display = "block";
    submitBtn.textContent = "Create Account";
    submitBtn.dataset.mode = "register";
  } else {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    groupName.style.display = "none";
    submitBtn.textContent = "Sign In";
    submitBtn.dataset.mode = "login";
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const mode = document.getElementById("auth-submit-btn").dataset.mode || "login";
  const username = document.getElementById("auth-username").value.trim();
  const password = document.getElementById("auth-password").value.trim();
  const name = document.getElementById("auth-name").value.trim();

  const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
  const payload = mode === "register" ? { username, password, name } : { username, password };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Authentication failed");
    }

    currentUser = data.user;
    localStorage.setItem("tasteshare_user", JSON.stringify(currentUser));
    closeModal("auth-modal");
    renderAuthNav();
    showToast(data.message || `Welcome, ${currentUser.name || currentUser.username}!`, "success");
    applyFilters();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function loginDemoUser() {
  document.getElementById("auth-username").value = "demo";
  document.getElementById("auth-password").value = "password123";
  switchAuthMode("login");
  document.getElementById("auth-form").dispatchEvent(new Event("submit"));
}

function logout() {
  currentUser = null;
  localStorage.removeItem("tasteshare_user");
  renderAuthNav();
  showToast("You have been signed out.", "info");
  applyFilters();
}

// -------------------------------------------------------------
// Data Fetching and Rendering
// -------------------------------------------------------------
async function fetchRecipes(search = "") {
  try {
    const url = search ? `${API_BASE}/api/recipes?search=${encodeURIComponent(search)}` : `${API_BASE}/api/recipes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Could not load recipes from server");
    const data = await res.json();

    allRecipes = Array.isArray(data) ? data : data.recipes || [];
    applyFilters();
    updateSavedBadge();
  } catch (err) {
    console.error("Fetch recipes error:", err);
    showToast("Error loading recipes. Please check server.", "error");
  }
}

function applyFilters() {
  const searchVal = document.getElementById("search-input").value.trim().toLowerCase();
  let filtered = [...allRecipes];

  // Search input filter
  if (searchVal) {
    filtered = filtered.filter((r) => {
      const matchTitle = (r.title || "").toLowerCase().includes(searchVal);
      const matchAuthor = (r.author || "").toLowerCase().includes(searchVal);
      const matchIng = Array.isArray(r.ingredients) && r.ingredients.some((ing) => ing.toLowerCase().includes(searchVal));
      return matchTitle || matchAuthor || matchIng;
    });
  }

  // Tag filter
  if (activeTagSearch) {
    const tag = activeTagSearch.toLowerCase();
    filtered = filtered.filter((r) => {
      return (
        (r.title || "").toLowerCase().includes(tag) ||
        (Array.isArray(r.ingredients) && r.ingredients.some((ing) => ing.toLowerCase().includes(tag)))
      );
    });
  }

  // Tab filter
  const currentUsername = currentUser ? currentUser.username : "demo_user";
  if (currentFilter === "saved") {
    filtered = filtered.filter((r) => Array.isArray(r.savedBy) && r.savedBy.includes(currentUsername));
  } else if (currentFilter === "my-recipes") {
    if (currentUser) {
      filtered = filtered.filter((r) => (r.author || "").toLowerCase() === currentUser.username.toLowerCase() || (r.author || "").toLowerCase() === (currentUser.name || "").toLowerCase());
    } else {
      filtered = filtered.filter((r) => (r.author || "").toLowerCase().includes("subash") || (r.author || "").toLowerCase().includes("demo"));
    }
  } else if (currentFilter === "quick") {
    filtered = filtered.filter((r) => Number(r.cookingTime) <= 25);
  }

  renderRecipeGrid(filtered);
  updateFilterHeaders(filtered.length);
}

function renderRecipeGrid(recipes) {
  const grid = document.getElementById("recipes-grid");
  const empty = document.getElementById("empty-state");
  const countBadge = document.getElementById("recipe-count");

  countBadge.textContent = `${recipes.length} recipe${recipes.length === 1 ? "" : "s"}`;

  if (recipes.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  const currentUsername = currentUser ? currentUser.username : "demo_user";

  grid.innerHTML = recipes
    .map((recipe) => {
      const id = recipe._id || recipe.id;
      const isSaved = Array.isArray(recipe.savedBy) && recipe.savedBy.includes(currentUsername);
      const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
      const tags = ingredients.slice(0, 3);
      const extraTagsCount = ingredients.length - 3;

      const defaultImg = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80";
      const imgSrc = recipe.imageUrl ? (recipe.imageUrl.startsWith("/") ? `${API_BASE}${recipe.imageUrl}` : recipe.imageUrl) : defaultImg;

      return `
        <div class="recipe-card" onclick="openRecipeDetails('${id}')">
          <div class="card-img-wrapper">
            <img class="card-img" src="${imgSrc}" alt="${escapeHtml(recipe.title)}" loading="lazy" onerror="this.src='${defaultImg}'">
            <div class="card-time-badge">⏱️ ${recipe.cookingTime || 15} min</div>
            <button class="card-save-btn ${isSaved ? "saved" : ""}" 
                    title="${isSaved ? "Saved in cookbook" : "Save to cookbook"}" 
                    onclick="handleSave('${id}', event)">
              ${isSaved ? "💖" : "🤍"}
            </button>
          </div>
          <div class="card-content">
            <span class="card-author">By ${escapeHtml(recipe.author || "Chef")}</span>
            <h3 class="card-title">${escapeHtml(recipe.title)}</h3>
            <div class="card-ingredients-tags">
              ${tags.map((tag) => `<span class="ingredient-tag">${escapeHtml(tag.split(",")[0].trim())}</span>`).join("")}
              ${extraTagsCount > 0 ? `<span class="ingredient-tag">+${extraTagsCount} more</span>` : ""}
            </div>
            <div class="card-footer">
              <button class="card-like-btn" onclick="handleLike('${id}', event)" title="Like this recipe">
                <span>❤️</span>
                <span id="like-count-${id}">${recipe.likes || 0}</span>
              </button>
              <span class="card-view-link">View Recipe ➔</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function updateFilterHeaders(count) {
  const title = document.getElementById("feed-title");
  const subtitle = document.getElementById("feed-subtitle");

  if (currentFilter === "saved") {
    title.textContent = "Your Saved Cookbook";
    subtitle.textContent = "Recipes you've bookmarked to cook later";
  } else if (currentFilter === "my-recipes") {
    title.textContent = "My Published Recipes";
    subtitle.textContent = "Dishes shared by you";
  } else if (currentFilter === "quick") {
    title.textContent = "Quick & Easy Recipes";
    subtitle.textContent = "Delicious meals ready in 25 minutes or less";
  } else if (activeTagSearch) {
    title.textContent = `Recipes with "${activeTagSearch}"`;
    subtitle.textContent = "Filtered by key ingredient";
  } else {
    title.textContent = "All Community Recipes";
    subtitle.textContent = "Explore trending dishes from home cooks & chefs";
  }
}

function updateSavedBadge() {
  const currentUsername = currentUser ? currentUser.username : "demo_user";
  const savedCount = allRecipes.filter((r) => Array.isArray(r.savedBy) && r.savedBy.includes(currentUsername)).length;
  const badge = document.getElementById("saved-badge");
  if (badge) badge.textContent = savedCount;
}

// -------------------------------------------------------------
// Interactive Search & Filters
// -------------------------------------------------------------
function setupSearchInput() {
  const input = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-search-btn");

  let debounceTimer;
  input.addEventListener("input", () => {
    const val = input.value.trim();
    clearBtn.style.display = val ? "flex" : "none";
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      activeTagSearch = "";
      clearChipActiveState();
      applyFilters();
    }, 250);
  });
}

function clearSearch() {
  const input = document.getElementById("search-input");
  input.value = "";
  document.getElementById("clear-search-btn").style.display = "none";
  activeTagSearch = "";
  applyFilters();
}

function setFilter(filterType, element) {
  currentFilter = filterType;
  activeTagSearch = "";
  clearChipActiveState();
  if (element) element.classList.add("active");
  applyFilters();
}

function searchByTag(tag, element) {
  activeTagSearch = tag;
  currentFilter = "all";
  clearChipActiveState();
  if (element) element.classList.add("active");
  applyFilters();
}

function clearChipActiveState() {
  document.querySelectorAll(".filter-chips .chip").forEach((c) => c.classList.remove("active"));
}

function resetFilters() {
  currentFilter = "all";
  activeTagSearch = "";
  document.getElementById("search-input").value = "";
  document.getElementById("clear-search-btn").style.display = "none";
  clearChipActiveState();
  const allChip = document.querySelector('.filter-chips .chip[data-filter="all"]');
  if (allChip) allChip.classList.add("active");
  applyFilters();
}

// -------------------------------------------------------------
// Recipe Details Modal
// -------------------------------------------------------------
async function openRecipeDetails(id) {
  try {
    let recipe = allRecipes.find((r) => (r._id || r.id) === id);
    if (!recipe) {
      const res = await fetch(`${API_BASE}/api/recipes/${id}`);
      if (!res.ok) throw new Error("Recipe not found");
      recipe = await res.json();
    }
    currentDetailRecipe = recipe;

    const defaultImg = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80";
    const imgSrc = recipe.imageUrl ? (recipe.imageUrl.startsWith("/") ? `${API_BASE}${recipe.imageUrl}` : recipe.imageUrl) : defaultImg;

    document.getElementById("modal-detail-img").style.backgroundImage = `url('${imgSrc}')`;
    document.getElementById("modal-detail-time").textContent = `⏱️ ${recipe.cookingTime || 15} minutes`;
    document.getElementById("modal-detail-title").textContent = recipe.title;
    document.getElementById("modal-detail-author").textContent = recipe.author || "Chef";
    document.getElementById("modal-detail-likes").textContent = recipe.likes || 0;

    const currentUsername = currentUser ? currentUser.username : "demo_user";
    const isSaved = Array.isArray(recipe.savedBy) && recipe.savedBy.includes(currentUsername);
    const saveBtn = document.getElementById("modal-detail-save-btn");
    const saveText = document.getElementById("modal-detail-save-text");
    saveBtn.className = `btn btn-outline save-btn-lg ${isSaved ? "saved" : ""}`;
    saveText.textContent = isSaved ? "Saved" : "Save";

    // Ingredients checklist
    const ingList = document.getElementById("modal-detail-ingredients");
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    ingList.innerHTML = ingredients
      .map(
        (ing, idx) => `
        <li class="ingredient-item" onclick="toggleIngredientItem(this)">
          <input type="checkbox" id="ing-check-${idx}" pointer-events="none">
          <span>${escapeHtml(ing)}</span>
        </li>
      `
      )
      .join("");

    // Steps list
    const stepsList = document.getElementById("modal-detail-steps");
    const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
    stepsList.innerHTML = steps
      .map(
        (step, idx) => `
        <li class="instruction-step">
          <div class="step-number">${idx + 1}</div>
          <div class="step-text">${escapeHtml(step)}</div>
        </li>
      `
      )
      .join("");

    // Owner controls (show if logged in user is author or demo mode)
    const ownerControls = document.getElementById("modal-owner-controls");
    const isOwner = currentUser && (
      (recipe.author || "").toLowerCase() === currentUser.username.toLowerCase() ||
      (recipe.author || "").toLowerCase() === (currentUser.name || "").toLowerCase() ||
      currentUser.username === "demo"
    );
    ownerControls.style.display = isOwner ? "flex" : "none";

    openModal("detail-modal");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function toggleIngredientItem(el) {
  el.classList.toggle("checked");
  const cb = el.querySelector('input[type="checkbox"]');
  if (cb) cb.checked = el.classList.contains("checked");
}

// -------------------------------------------------------------
// Like and Save Operations
// -------------------------------------------------------------
async function handleLike(id, event) {
  if (event) event.stopPropagation();

  try {
    const res = await fetch(`${API_BASE}/api/recipes/${id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser ? currentUser.username : "guest" })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to like recipe");

    // Update in allRecipes
    const recipe = allRecipes.find((r) => (r._id || r.id) === id);
    if (recipe) recipe.likes = data.likes;

    // Update UI
    const likeEl = document.getElementById(`like-count-${id}`);
    if (likeEl) likeEl.textContent = data.likes;

    if (currentDetailRecipe && (currentDetailRecipe._id || currentDetailRecipe.id) === id) {
      document.getElementById("modal-detail-likes").textContent = data.likes;
    }

    showToast("Liked recipe! ❤️", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function handleModalLike() {
  if (!currentDetailRecipe) return;
  const id = currentDetailRecipe._id || currentDetailRecipe.id;
  await handleLike(id, null);
}

async function handleSave(id, event) {
  if (event) event.stopPropagation();

  const username = currentUser ? currentUser.username : "demo_user";
  try {
    const res = await fetch(`${API_BASE}/api/recipes/${id}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to save recipe");

    // Update in allRecipes
    const recipe = allRecipes.find((r) => (r._id || r.id) === id);
    if (recipe) recipe.savedBy = data.savedBy;

    // Update Detail modal if open
    if (currentDetailRecipe && (currentDetailRecipe._id || currentDetailRecipe.id) === id) {
      currentDetailRecipe.savedBy = data.savedBy;
      const saveBtn = document.getElementById("modal-detail-save-btn");
      const saveText = document.getElementById("modal-detail-save-text");
      saveBtn.className = `btn btn-outline save-btn-lg ${data.isSaved ? "saved" : ""}`;
      saveText.textContent = data.isSaved ? "Saved" : "Save";
    }

    applyFilters();
    updateSavedBadge();
    showToast(data.message, "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function handleModalSave() {
  if (!currentDetailRecipe) return;
  const id = currentDetailRecipe._id || currentDetailRecipe.id;
  await handleSave(id, null);
}

// -------------------------------------------------------------
// Create / Edit Recipe Form
// -------------------------------------------------------------
function openCreateRecipeModal() {
  document.getElementById("form-modal-title").textContent = "Share a New Recipe";
  document.getElementById("form-submit-btn").textContent = "Publish Recipe";
  document.getElementById("form-recipe-id").value = "";
  document.getElementById("recipe-form").reset();
  removeImagePreview();

  // Prefill author
  if (currentUser) {
    document.getElementById("form-author").value = currentUser.name || currentUser.username;
  } else {
    document.getElementById("form-author").value = "Subash Chef";
  }

  openModal("form-modal");
}

function openEditCurrentRecipe() {
  if (!currentDetailRecipe) return;
  closeModal("detail-modal");

  document.getElementById("form-modal-title").textContent = "Edit Recipe";
  document.getElementById("form-submit-btn").textContent = "Save Changes";
  document.getElementById("form-recipe-id").value = currentDetailRecipe._id || currentDetailRecipe.id;

  document.getElementById("form-title").value = currentDetailRecipe.title || "";
  document.getElementById("form-cooking-time").value = currentDetailRecipe.cookingTime || 20;
  document.getElementById("form-author").value = currentDetailRecipe.author || "";

  const ingredients = Array.isArray(currentDetailRecipe.ingredients)
    ? currentDetailRecipe.ingredients.join("\n")
    : currentDetailRecipe.ingredients || "";
  document.getElementById("form-ingredients").value = ingredients;

  const steps = Array.isArray(currentDetailRecipe.steps)
    ? currentDetailRecipe.steps.join("\n")
    : currentDetailRecipe.steps || "";
  document.getElementById("form-steps").value = steps;

  if (currentDetailRecipe.imageUrl) {
    updateImagePreview(currentDetailRecipe.imageUrl);
  }

  openModal("form-modal");
}

async function handleRecipeFormSubmit(event) {
  event.preventDefault();
  const id = document.getElementById("form-recipe-id").value;
  const title = document.getElementById("form-title").value.trim();
  const cookingTime = Number(document.getElementById("form-cooking-time").value) || 15;
  const author = document.getElementById("form-author").value.trim() || (currentUser ? currentUser.name : "Chef");
  const imageUrl = document.getElementById("form-image-url").value.trim();
  const ingredientsRaw = document.getElementById("form-ingredients").value;
  const stepsRaw = document.getElementById("form-steps").value;

  const ingredients = ingredientsRaw.split("\n").map((s) => s.trim()).filter(Boolean);
  const steps = stepsRaw.split("\n").map((s) => s.trim()).filter(Boolean);

  if (ingredients.length === 0 || steps.length === 0) {
    showToast("Please provide at least 1 ingredient and 1 instruction step.", "error");
    return;
  }

  const payload = {
    title,
    cookingTime,
    author,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80",
    ingredients,
    steps
  };

  try {
    const isEdit = Boolean(id);
    const endpoint = isEdit ? `/api/recipes/${id}` : "/api/recipes";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (!res.ok) throw new Error(result.message || "Failed to save recipe");

    closeModal("form-modal");
    showToast(isEdit ? "Recipe updated successfully! ✨" : "Recipe published to the community! 🍳", "success");
    await fetchRecipes();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteCurrentRecipe() {
  if (!currentDetailRecipe) return;
  const id = currentDetailRecipe._id || currentDetailRecipe.id;

  if (!confirm(`Are you sure you want to delete "${currentDetailRecipe.title}"?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/recipes/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete recipe");

    closeModal("detail-modal");
    showToast("Recipe deleted successfully.", "info");
    await fetchRecipes();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// -------------------------------------------------------------
// Image Tab & Upload Handlers
// -------------------------------------------------------------
function switchImageTab(tab) {
  const urlTab = document.getElementById("tab-url");
  const uploadTab = document.getElementById("tab-upload");
  const urlBox = document.getElementById("input-url-box");
  const uploadBox = document.getElementById("input-upload-box");

  if (tab === "upload") {
    uploadTab.classList.add("active");
    urlTab.classList.remove("active");
    uploadBox.style.display = "block";
    urlBox.style.display = "none";
  } else {
    urlTab.classList.add("active");
    uploadTab.classList.remove("active");
    urlBox.style.display = "block";
    uploadBox.style.display = "none";
  }
}

function setSampleImage(url) {
  document.getElementById("form-image-url").value = url;
  updateImagePreview(url);
}

function updateImagePreview(url) {
  const previewWrapper = document.getElementById("image-preview-wrapper");
  const previewImg = document.getElementById("form-image-preview");
  const inputUrl = document.getElementById("form-image-url");

  if (url) {
    inputUrl.value = url;
    previewImg.src = url.startsWith("/") ? `${API_BASE}${url}` : url;
    previewWrapper.style.display = "inline-block";
  } else {
    previewWrapper.style.display = "none";
  }
}

function removeImagePreview() {
  document.getElementById("form-image-url").value = "";
  document.getElementById("image-preview-wrapper").style.display = "none";
  document.getElementById("form-file-input").value = "";
}

async function handleFileUpload(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  const statusText = document.getElementById("upload-status-text");
  statusText.textContent = "⏳ Uploading photo...";

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to upload image");

    updateImagePreview(data.imageUrl);
    statusText.textContent = "✅ Image uploaded successfully!";
    showToast("Photo uploaded successfully!", "success");
  } catch (err) {
    statusText.textContent = "❌ Upload failed. Please try a valid image.";
    showToast(err.message, "error");
  }
}

// -------------------------------------------------------------
// Modal & Utility Helpers
// -------------------------------------------------------------
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function closeModalOnBackdrop(event, modalId) {
  if (event.target.id === modalId) {
    closeModal(modalId);
  }
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === "success" ? "✓" : type === "error" ? "⚠️" : "ℹ️"}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
