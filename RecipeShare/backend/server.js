const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const storage = require("./storage");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure Cloudinary if credentials are provided in .env
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log("☁️ Cloudinary initialized for permanent cloud media storage!");
}

// Multer Storage Configuration:
// Uses in-memory buffer if Cloudinary is active (for direct streaming to cloud),
// or local disk storage as a reliable fallback.
const memoryStorage = multer.memoryStorage();
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `recipe-${unique}${ext}`);
  }
});

const upload = multer({
  storage: isCloudinaryConfigured ? memoryStorage : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Image Upload Endpoint (Cloudinary + Multer)
app.post("/api/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided." });
  }

  // 1. If Cloudinary is configured, stream directly to Cloudinary
  if (isCloudinaryConfigured) {
    try {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "recipeshare",
              resource_type: "image",
              transformation: [{ width: 1200, crop: "limit", quality: "auto" }]
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
      };

      const result = await uploadToCloudinary();
      return res.json({
        imageUrl: result.secure_url,
        message: "Image uploaded permanently to Cloudinary!"
      });
    } catch (err) {
      console.error("Cloudinary upload error:", err.message);
      return res.status(500).json({ message: "Cloudinary upload failed: " + err.message });
    }
  }

  // 2. Otherwise, use local disk upload
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl, message: "Image uploaded to local storage successfully!" });
});

// REST Endpoints
app.get("/api/recipes", async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const data = await storage.getAllRecipes(search, page, limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/recipes", async (req, res) => {
  try {
    const { title, ingredients, steps, cookingTime, imageUrl, author } = req.body;
    if (!title || !ingredients || !steps) {
      return res.status(400).json({ message: "Title, ingredients, and steps are required." });
    }
    const created = await storage.createRecipe({
      title,
      ingredients,
      steps,
      cookingTime,
      imageUrl,
      author
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/recipes/:id", async (req, res) => {
  try {
    const recipe = await storage.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/recipes/:id", async (req, res) => {
  try {
    const updated = await storage.updateRecipe(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Recipe not found." });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/recipes/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteRecipe(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Recipe not found or already removed." });
    }
    res.json({ message: "Recipe deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/recipes/:id/like", async (req, res) => {
  try {
    const { username } = req.body;
    const recipe = await storage.likeRecipe(req.params.id, username);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }
    res.json({ likes: recipe.likes, message: "Recipe liked!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/recipes/:id/save", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }
    const result = await storage.saveRecipe(req.params.id, username);
    if (!result) {
      return res.status(404).json({ message: "Recipe not found." });
    }
    res.json({
      isSaved: result.isSaved,
      savedBy: result.recipe.savedBy,
      message: result.isSaved ? "Saved to your cookbook!" : "Removed from cookbook."
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const user = await storage.registerUser({ username, password, name });
    res.status(201).json({ message: "User registered successfully!", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await storage.loginUser({ username, password });
    res.json({ message: "Login successful!", user });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "RecipeShare API",
    storage: isCloudinaryConfigured ? "Cloudinary CDN" : "Local Disk Storage",
    time: new Date().toISOString()
  });
});

storage.initStorage().then(() => {
  app.listen(PORT, () => {
    console.log(`RecipeShare Backend API running at http://localhost:${PORT}`);
  });
});
