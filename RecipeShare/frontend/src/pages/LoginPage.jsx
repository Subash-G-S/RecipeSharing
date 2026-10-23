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
      addToast(res.data.message || (mode === "login" ? "Login successful! Welcome to the portal." : "Account created!"), "success");
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
    <div style={{ minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div className="form-card" style={{ maxWidth: "440px", width: "100%", margin: 0, padding: "2.5rem 2rem", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.12)" }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🍳</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.9rem", color: "var(--text-main)", marginBottom: "0.25rem" }}>
            RecipeShare Portal
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            {mode === "login"
              ? "🔒 Authentication Required. Enter your database credentials to access the portal."
              : "✨ Create a new user account in the database to enter."}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div style={{ background: "#fef2f2", border: "1px solid #f87171", color: "#b91c1c", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab switch */}
        <div style={{ display: "flex", borderBottom: "2px solid var(--border-color)", marginBottom: "1.5rem" }}>
          <button
            type="button"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              padding: "0.75rem",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
              color: mode === "login" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: mode === "login" ? "2.5px solid var(--primary)" : "2.5px solid transparent",
              marginBottom: "-2px",
              transition: "all 0.2s ease"
            }}
            onClick={() => {
              setMode("login");
              setErrorMessage("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              padding: "0.75rem",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
              color: mode === "register" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: mode === "register" ? "2.5px solid var(--primary)" : "2.5px solid transparent",
              marginBottom: "-2px",
              transition: "all 0.2s ease"
            }}
            onClick={() => {
              setMode("register");
              setErrorMessage("");
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                placeholder="e.g. Subash"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label>Database Username *</label>
            <input
              type="text"
              placeholder="e.g. demo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Database Password *</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: "1rem", padding: "0.75rem" }}
          >
            {loading ? "Verifying Credentials..." : mode === "login" ? "Login to Portal ➔" : "Create Account & Enter ➔"}
          </button>
        </form>

        {/* Database Credentials Hint Box */}
        <div style={{ marginTop: "1.75rem", padding: "0.85rem", background: "var(--bg-alt)", borderRadius: "10px", border: "1px solid var(--border-color)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
            <span style={{ fontWeight: 700, color: "var(--text-main)" }}>🔑 Default DB Credentials:</span>
            <button
              type="button"
              onClick={handleDemoFill}
              style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontSize: "0.78rem", textDecoration: "underline" }}
            >
              Auto-Fill
            </button>
          </div>
          <div>Username: <strong style={{ color: "var(--text-main)" }}>demo</strong></div>
          <div>Password: <strong style={{ color: "var(--text-main)" }}>password123</strong></div>
        </div>

      </div>
    </div>
  );
}
