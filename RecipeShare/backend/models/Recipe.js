const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    ingredients: {
      type: [String],
      required: true,
      validate: [(val) => val.length > 0, "At least one ingredient is required"]
    },
    steps: {
      type: [String],
      required: true,
      validate: [(val) => val.length > 0, "At least one instruction step is required"]
    },
    cookingTime: {
      type: Number,
      required: true,
      min: 1
    },
    imageUrl: {
      type: String,
      default: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80"
    },
    author: {
      type: String,
      default: "Anonymous Chef"
    },
    likes: {
      type: Number,
      default: 0
    },
    savedBy: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);
