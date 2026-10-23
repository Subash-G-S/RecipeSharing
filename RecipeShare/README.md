# 🍳 RecipeShare — Full-Stack Recipe Platform

A full-stack recipe sharing platform built with **React (Vite), React Router, Axios, Node.js, Express, Multer, and MongoDB**.

---

## 📅 One-Week Plan Implementation (CUBRICS Roadmap)

This project strictly follows the **Suggested One-Week Plan CUBRICS**:

| Day | Task | Status | Implementation Details |
|---|---|---|---|
| **Day 1** | **Features, Schemas & REST Contract** | ✅ Completed | Designed MongoDB Mongoose schemas for `Recipe` and `User`. Defined REST API contract for browsing, searching, creating, editing, liking, and saving recipes. |
| **Day 2** | **Express Server & JSON APIs** | ✅ Completed | Built Express server with CORS, JSON body parser, Multer image upload handling, robust MongoDB connection with seamless local JSON fallback, and complete REST endpoints. |
| **Day 3** | **React Setup, Pages & API Integration** | ✅ Completed | Initialized React with Vite, configured React Router DOM, created Axios instance, and designed core pages (`HomePage`, `RecipeDetailPage`, `CreateRecipePage`, `SavedRecipesPage`, `LoginPage`). |
| **Day 4** | **CRUD Flows & Validation** | ✅ Completed | Implemented full Create, Read, Update, Delete flows, interactive ingredients checklist, like/save toggle states, image upload preview, and toast alerts. |
| **Day 5** | **Testing, Documentation & Packaging** | ✅ Completed | End-to-end browser and API testing, verified zero console errors, documented screenshots at every step. |

---

## 📸 Step-by-Step Execution Screenshots

Every milestone step has been captured and archived in the [`screenshots/`](./screenshots/) directory:

1. **Step 1: Backend API Running & Health Check**
   - 🖼️ [`screenshots/step1_backend_running.png`](./screenshots/step1_backend_running.png)
   - *Shows the Express server running on port 5000 with online health status response.*

2. **Step 2: React Project Initialized**
   - 🖼️ [`screenshots/step2_react_initialized.png`](./screenshots/step2_react_initialized.png)
   - *Shows the initial Vite + React welcome page running on localhost.*

3. **Step 3: React Full Application Home Page**
   - 🖼️ [`screenshots/step3_react_homepage.png`](./screenshots/step3_react_homepage.png)
   - *Shows the modern culinary UI with recipe cards grid, cooking times, author tags, and filter bar.*

4. **Step 4: Dynamic Search & Filtering**
   - 🖼️ [`screenshots/step4_search_filter.png`](./screenshots/step4_search_filter.png)
   - *Demonstrates real-time search by ingredient (e.g. "garlic") filtering matching dishes.*

5. **Step 5: Recipe Detail Page with Interactive Checklist**
   - 🖼️ [`screenshots/step5_recipe_detail_checklist.png`](./screenshots/step5_recipe_detail_checklist.png)
   - *Shows the recipe detail view with interactive ingredient checkboxes and step-by-step cooking cards.*

6. **Step 6: Create Recipe Form with Image Upload**
   - 🖼️ [`screenshots/step6_create_recipe_form.png`](./screenshots/step6_create_recipe_form.png)
   - *Shows the publish recipe modal supporting image URLs or file uploads via Multer.*

7. **Step 7: Saved Recipes Cookbook**
   - 🖼️ [`screenshots/step7_saved_cookbook.png`](./screenshots/step7_saved_cookbook.png)
   - *Displays the personal bookmarked cookbook of recipes.*

8. **Step 8: Sign In & Registration Page**
   - 🖼️ [`screenshots/step8_login_page.png`](./screenshots/step8_login_page.png)
   - *Shows the clean authentication screen with 1-click instant demo login.*

9. **Step 9: Logged-in Home Page**
   - 🖼️ [`screenshots/step9_logged_in_homepage.png`](./screenshots/step9_logged_in_homepage.png)
   - *Shows the active user session with personalized chef avatar in the navigation bar.*

---

## 📡 REST API Endpoint Contract

| Method | Endpoint | Parameters / Body | Description |
|---|---|---|---|
| `GET` | `/api/recipes` | `?search=garlic&page=1&limit=50` | Search & browse recipes by title, author, or ingredient |
| `POST` | `/api/recipes` | `{ title, ingredients[], steps[], cookingTime, imageUrl, author }` | Create a new recipe |
| `GET` | `/api/recipes/:id` | Path parameter `:id` | Retrieve single recipe details |
| `PUT` | `/api/recipes/:id` | Path parameter `:id` + updated fields | Update existing recipe |
| `DELETE` | `/api/recipes/:id` | Path parameter `:id` | Delete recipe |
| `POST` | `/api/recipes/:id/like` | `{ username }` | Toggle / add like to recipe |
| `POST` | `/api/recipes/:id/save` | `{ username }` | Bookmark or remove recipe from saved cookbook |
| `POST` | `/api/upload` | `multipart/form-data` with `image` field | Upload dish image (Multer) |
| `POST` | `/api/auth/register` | `{ username, password, name }` | Register a new user |
| `POST` | `/api/auth/login` | `{ username, password }` | Authenticate existing user |
| `GET` | `/api/health` | None | Service health status |

---

## 🗄️ MongoDB Schemas

### 1. Recipe Schema (`models/Recipe.js`)
```javascript
{
  title: { type: String, required: true },
  ingredients: { type: [String], required: true },
  steps: { type: [String], required: true },
  cookingTime: { type: Number, required: true },
  imageUrl: { type: String, default: "..." },
  author: { type: String, default: "Anonymous Chef" },
  likes: { type: Number, default: 0 },
  savedBy: { type: [String], default: [] }
}
```

### 2. User Schema (`models/User.js`)
```javascript
{
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "Home Cook" }
}
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Start the Backend API:
```bash
cd RecipeShare/backend
npm install
npm start
```
*Backend runs on:* `http://localhost:5000`

### 2. Start the React Frontend:
```bash
cd RecipeShare/frontend
npm install
npm run dev
```
*Frontend runs on:* `http://localhost:5174` (or `http://localhost:5173`)

### 🔑 Demo Account
- **Username**: `demo`
- **Password**: `password123`
*(Or simply click the **⚡ Instant Demo Login** button in the Sign In view!)*
