const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const RecipeModel = require("./models/Recipe");
const UserModel = require("./models/User");

const RECIPES_FILE = path.join(__dirname, "data", "recipes.json");
const USERS_FILE = path.join(__dirname, "data", "users.json");

let isMongoConnected = false;

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, "utf-8") || "[]");
  } catch (err) {
    console.error("Error reading file:", filePath, err.message);
    return [];
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing file:", filePath, err.message);
  }
}

async function initStorage() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log(" No MONGO_URI. Running with persistent local JSON database.");
    return;
  }

  try {
    console.log(" Connecting to MongoDB Atlas...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    isMongoConnected = true;
    console.log(" MongoDB Atlas connected successfully!");

    const count = await RecipeModel.countDocuments();
    if (count === 0) {
      const initial = readJson(RECIPES_FILE);
      if (initial.length > 0) {
        const cleanSeeds = initial.map(({ _id, ...rest }) => rest);
        await RecipeModel.insertMany(cleanSeeds);
        console.log(`Seeded ${cleanSeeds.length} recipes into MongoDB!`);
      }
    }
  } catch (err) {
    isMongoConnected = false;
    console.log(" MongoDB Atlas connection error (IP whitelist or offline).");
    console.log(" Fallback active: using local JSON storage seamlessly!");
  }
}

async function getAllRecipes(search, page = 1, limit = 50) {
  if (isMongoConnected) {
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { ingredients: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await RecipeModel.countDocuments(query);
    const recipes = await RecipeModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return { recipes, total, page: parseInt(page), pages: Math.ceil(total / limit) || 1 };
  } else {
    let recipes = readJson(RECIPES_FILE);

    if (search) {
      const q = search.toLowerCase();
      recipes = recipes.filter(
        (r) =>
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.author && r.author.toLowerCase().includes(q)) ||
          (Array.isArray(r.ingredients) && r.ingredients.some((ing) => ing.toLowerCase().includes(q)))
      );
    }

    const total = recipes.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginated = recipes.slice(skip, skip + parseInt(limit));

    return { recipes: paginated, total, page: parseInt(page), pages: Math.ceil(total / limit) || 1 };
  }
}

async function getRecipeById(id) {
  if (isMongoConnected) {
    return await RecipeModel.findById(id);
  } else {
    const recipes = readJson(RECIPES_FILE);
    return recipes.find((r) => r._id === id || r.id === id) || null;
  }
}

async function createRecipe(data) {
  let ingredients = data.ingredients;
  if (typeof ingredients === "string") {
    ingredients = ingredients.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  let steps = data.steps;
  if (typeof steps === "string") {
    steps = steps.split("\n").map((s) => s.trim()).filter(Boolean);
  }

  const payload = {
    title: data.title,
    ingredients: ingredients || [],
    steps: steps || [],
    cookingTime: Number(data.cookingTime) || 15,
    imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80",
    author: data.author || "Chef",
    likes: 0,
    savedBy: []
  };

  if (isMongoConnected) {
    const doc = new RecipeModel(payload);
    return await doc.save();
  } else {
    const recipes = readJson(RECIPES_FILE);
    const newDoc = {
      _id: "rec_" + Date.now(),
      ...payload,
      createdAt: new Date().toISOString()
    };
    recipes.unshift(newDoc);
    writeJson(RECIPES_FILE, recipes);
    return newDoc;
  }
}

async function updateRecipe(id, data) {
  let ingredients = data.ingredients;
  if (typeof ingredients === "string") {
    ingredients = ingredients.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  let steps = data.steps;
  if (typeof steps === "string") {
    steps = steps.split("\n").map((s) => s.trim()).filter(Boolean);
  }

  const updateFields = {
    ...(data.title && { title: data.title }),
    ...(ingredients && { ingredients }),
    ...(steps && { steps }),
    ...(data.cookingTime && { cookingTime: Number(data.cookingTime) }),
    ...(data.imageUrl && { imageUrl: data.imageUrl }),
    ...(data.author && { author: data.author })
  };

  if (isMongoConnected) {
    return await RecipeModel.findByIdAndUpdate(id, updateFields, { new: true });
  } else {
    const recipes = readJson(RECIPES_FILE);
    const idx = recipes.findIndex((r) => r._id === id || r.id === id);
    if (idx === -1) return null;

    recipes[idx] = { ...recipes[idx], ...updateFields };
    writeJson(RECIPES_FILE, recipes);
    return recipes[idx];
  }
}

async function deleteRecipe(id) {
  if (isMongoConnected) {
    return await RecipeModel.findByIdAndDelete(id);
  } else {
    let recipes = readJson(RECIPES_FILE);
    const originalLen = recipes.length;
    recipes = recipes.filter((r) => r._id !== id && r.id !== id);
    writeJson(RECIPES_FILE, recipes);
    return recipes.length < originalLen;
  }
}

async function likeRecipe(id, username = "anonymous") {
  if (isMongoConnected) {
    const recipe = await RecipeModel.findById(id);
    if (!recipe) return null;
    recipe.likes = (recipe.likes || 0) + 1;
    await recipe.save();
    return recipe;
  } else {
    const recipes = readJson(RECIPES_FILE);
    const recipe = recipes.find((r) => r._id === id || r.id === id);
    if (!recipe) return null;
    recipe.likes = (recipe.likes || 0) + 1;
    writeJson(RECIPES_FILE, recipes);
    return recipe;
  }
}

async function saveRecipe(id, username = "demo") {
  if (isMongoConnected) {
    const recipe = await RecipeModel.findById(id);
    if (!recipe) return null;

    if (!recipe.savedBy) recipe.savedBy = [];
    const idx = recipe.savedBy.indexOf(username);
    let isSaved = false;

    if (idx === -1) {
      recipe.savedBy.push(username);
      isSaved = true;
    } else {
      recipe.savedBy.splice(idx, 1);
      isSaved = false;
    }

    await recipe.save();
    return { recipe, isSaved };
  } else {
    const recipes = readJson(RECIPES_FILE);
    const recipe = recipes.find((r) => r._id === id || r.id === id);
    if (!recipe) return null;

    if (!recipe.savedBy) recipe.savedBy = [];
    const idx = recipe.savedBy.indexOf(username);
    let isSaved = false;

    if (idx === -1) {
      recipe.savedBy.push(username);
      isSaved = true;
    } else {
      recipe.savedBy.splice(idx, 1);
      isSaved = false;
    }

    writeJson(RECIPES_FILE, recipes);
    return { recipe, isSaved };
  }
}

async function registerUser({ username, password, name }) {
  if (!username || !password) {
    throw new Error("Username and password are required");
  }

  if (isMongoConnected) {
    const existing = await UserModel.findOne({ username });
    if (existing) throw new Error("Username is already taken");

    const user = new UserModel({ username, password, name: name || username });
    const saved = await user.save();
    return { id: saved._id, username: saved.username, name: saved.name };
  } else {
    const users = readJson(USERS_FILE);
    const existing = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (existing) throw new Error("Username is already taken");

    const newUser = {
      id: "usr_" + Date.now(),
      username,
      password,
      name: name || username
    };
    users.push(newUser);
    writeJson(USERS_FILE, users);
    return { id: newUser.id, username: newUser.username, name: newUser.name };
  }
}

async function loginUser({ username, password }) {
  if (!username || !password) {
    throw new Error("Username and password are required");
  }

  if (isMongoConnected) {
    const user = await UserModel.findOne({ username });
    if (!user || user.password !== password) {
      throw new Error("Invalid username or password");
    }
    return { id: user._id, username: user.username, name: user.name };
  } else {
    const users = readJson(USERS_FILE);
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!user) throw new Error("Invalid username or password");
    return { id: user.id, username: user.username, name: user.name };
  }
}

module.exports = {
  initStorage,
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  likeRecipe,
  saveRecipe,
  registerUser,
  loginUser
};
