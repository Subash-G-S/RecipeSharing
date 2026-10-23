# 🍳 TasteShare — Simple Recipe Sharing Web App

A clean, modern, beginner-friendly recipe sharing platform built with **Node.js, Express, and Vanilla HTML/CSS/JavaScript**.

---

## 🌟 Features Implemented

1. **Browse Recipes**: Beautiful grid showcasing recipes with dish photos, cooking times, author tags, and key ingredients.
2. **Search by Ingredient or Title**: Live search bar (e.g. `garlic`, `cheese`, `chicken`) and quick category chips.
3. **Interactive Recipe Details**:
   - High-resolution dish preview
   - **Interactive Ingredients Checklist**: Check off items while cooking
   - Step-by-step instructions
4. **Likes & Saved Recipes (Cookbook)**:
   - One-click Like button with instant counter update
   - Bookmark / Save recipes to your personal cookbook
   - Dedicated "Saved Cookbook" filter tab
5. **Publish & Edit Recipes**:
   - Create new recipes with title, cooking time, ingredients array, and steps array
   - Support for Image URLs or direct image uploads via **Multer** (`/api/upload`)
6. **Easy Authentication**:
   - Register new user (`/api/auth/register`)
   - Login existing user (`/api/auth/login`)
   - **⚡ 1-Click Instant Demo Login** for quick testing

---

## 🚀 How to Run the App

### 1. Open Terminal and go to backend:
```bash
cd backend
```

### 2. Start the Server:
```bash
npm start
```
*(or `npm run dev` with nodemon)*

### 3. Open in Browser:
Go to **[http://localhost:5000](http://localhost:5000)**!

> 💡 **Zero Setup Required**: The app connects automatically to MongoDB Atlas if reachable. If MongoDB Atlas is offline or IP is restricted, it seamlessly uses persistent local JSON storage (`data/recipes.json` and `data/users.json`). It will never crash or fail on launch!

---

## 📡 REST API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/recipes?search=` | Browse all recipes or search by ingredient/title |
| `POST` | `/api/recipes` | Create a new recipe |
| `GET` | `/api/recipes/:id` | Get details of a single recipe |
| `PUT` | `/api/recipes/:id` | Update an existing recipe |
| `DELETE` | `/api/recipes/:id` | Delete a recipe |
| `POST` | `/api/recipes/:id/like` | Like a recipe |
| `POST` | `/api/recipes/:id/save` | Save or bookmark recipe for a user |
| `POST` | `/api/upload` | Upload dish image (via Multer) |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login user |

---

## 🔑 Demo Account Credentials
- **Username**: `demo`
- **Password**: `password123`
*(Or click the **⚡ Instant Demo Login** button in the sign-in modal)*
