const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const storage = require("./storage");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// Configure Multer for image uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "recipe-" + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Image Upload Endpoint
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided." });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl, message: "Image uploaded successfully!" });
});

// -------------------------------------------------------------
// RECIPE ENDPOINTS (REST API)
// -------------------------------------------------------------

// 1. GET /api/recipes?search=&page=&limit= - Get all or search recipes
app.get("/api/recipes", async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const result = await storage.getAllRecipes(search, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. POST /api/recipes - Create a new recipe
app.post("/api/recipes", async (req, res) => {
  try {
    const { title, ingredients, steps, cookingTime, imageUrl, author } = req.body;
    if (!title || !ingredients || !steps) {
      return res.status(400).json({ message: "Title, ingredients, and steps are required." });
    }
    const newRecipe = await storage.createRecipe({
      title,
      ingredients,
      steps,
      cookingTime,
      imageUrl,
      author
    });
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3. GET /api/recipes/:id - Get a single recipe by ID
app.get("/api/recipes/:id", async (req, res) => {
  try {
    const recipe = await storage.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. PUT /api/recipes/:id - Update an existing recipe
app.put("/api/recipes/:id", async (req, res) => {
  try {
    const updatedRecipe = await storage.updateRecipe(req.params.id, req.body);
    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }
    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. DELETE /api/recipes/:id - Delete a recipe
app.delete("/api/recipes/:id", async (req, res) => {
  try {
    const success = await storage.deleteRecipe(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Recipe not found or already deleted." });
    }
    res.json({ message: "Recipe deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. POST /api/recipes/:id/like - Like a recipe
app.post("/api/recipes/:id/like", async (req, res) => {
  try {
    const { username } = req.body;
    const recipe = await storage.likeRecipe(req.params.id, username);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }
    res.json({ likes: recipe.likes, message: "Recipe liked!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 7. POST /api/recipes/:id/save - Save or bookmark a recipe for a user
app.post("/api/recipes/:id/save", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required to save recipe." });
    }
    const result = await storage.saveRecipe(req.params.id, username);
    if (!result) {
      return res.status(404).json({ message: "Recipe not found." });
    }
    res.json({
      isSaved: result.isSaved,
      savedBy: result.recipe.savedBy,
      message: result.isSaved ? "Recipe saved to your cookbook!" : "Recipe removed from saved."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -------------------------------------------------------------
// AUTH ENDPOINTS (EASY LOGIN & REGISTER)
// -------------------------------------------------------------

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const user = await storage.registerUser({ username, password, name });
    res.status(201).json({ message: "Account created successfully!", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await storage.loginUser({ username, password });
    res.json({ message: "Login successful!", user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Root API Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Recipe Sharing API" });
});

// Start Server and Database
storage.initStorage().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
