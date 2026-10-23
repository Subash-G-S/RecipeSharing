import React, { useState } from "react";
import api from "../api";

export default function LoginPage({ onLoginSuccess, addToast }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
    const payload = mode === "register" ? { username, password, name } : { username, password };

    try {
      setLoading(true);
      const res = await api.post(endpoint, payload);
      addToast(res.data.message || (mode === "login" ? "Login successful." : "Account created."), "success");
      onLoginSuccess(res.data.user);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials. Access denied.";
      setErrorMessage(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setUsername("demo");
    setPassword("password123");
    setMode("login");
    setErrorMessage("");
  };

  return (
    <div className="container" style={{ maxWidth: "420px", marginTop: "50px" }}>
      <div className="form-box" style={{ margin: 0, maxWidth: "100%" }}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "8px", textAlign: "center" }}>
          RecipeShare Portal
        </h2>
        <p style={{ color: "#666", fontSize: "0.85rem", textAlign: "center", marginBottom: "20px" }}>
          {mode === "login"
            ? "Enter your database username and password to log in."
            : "Register a new user account in the database."}
        </p>

        {errorMessage && (
          <div className="alert alert-error">
            {errorMessage}
          </div>
        )}

        {/* Tab switch */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "15px" }}>
          <button
            type="button"
            className={`filter-btn ${mode === "login" ? "active" : ""}`}
            style={{ flex: 1 }}
            onClick={() => {
              setMode("login");
              setErrorMessage("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`filter-btn ${mode === "register" ? "active" : ""}`}
            style={{ flex: 1 }}
            onClick={() => {
              setMode("register");
              setErrorMessage("");
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Subash"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: "10px" }}
          >
            {loading ? "Checking credentials..." : mode === "login" ? "Sign In" : "Register Account"}
          </button>
        </form>

        <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #eee", fontSize: "0.85rem", color: "#666" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Default demo: <strong>demo / password123</strong></span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleDemoFill}
            >
              Fill Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
