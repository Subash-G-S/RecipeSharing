
const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  ingredients: {
    type: [String],
    required: true
  },

  steps: {
    type: [String],
    required: true
  },

  cookingTime: {
    type: Number,
    required: true
  },

  imageUrl: {
    type: String,
    default: ""
  },

  author: {
    type: String,
    default: "Anonymous"
  },

  likes: {
    type: Number,
    default: 0
  },

  savedBy: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model("Recipe", recipeSchema);
