require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const Recipe = require("./models/Recipe");
const User = require("./models/User");
async function seedAtlas() {
  try {
    console.log("Connecting to Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected!");
    const existingRecipes = await Recipe.countDocuments();
    if (existingRecipes === 0) {
      const recipes = JSON.parse(fs.readFileSync("./data/recipes.json", "utf-8"));
      const cleanR = recipes.map(({ _id, ...rest }) => rest);
      await Recipe.insertMany(cleanR);
      console.log(`Inserted ${cleanR.length} recipes into Atlas!`);
    } else {
      console.log(`Atlas already has ${existingRecipes} recipes.`);
    }
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
    for (const u of users) {
      const exists = await User.findOne({ username: u.username });
      if (!exists) {
        await User.create({ username: u.username, password: u.password, name: u.name });
        console.log(`Created user: ${u.username}`);
      }
    }
    console.log("ALL DATA SEEDED TO MONGODB ATLAS!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}
seedAtlas();
