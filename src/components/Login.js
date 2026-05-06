import { useState } from "react";

export default function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (password === "swami123") {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card card">
        <div className="login-logo">🥛</div>
        <h1 className="login-title">Swami Dairy</h1>
        <div className="login-subtitle">दूध व्यवसाय Manager</div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label style={{ textAlign: "left" }}>Master Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..." 
              className={error ? "input-error" : ""}
              autoFocus
            />
            {error && <div className="error-text">Incorrect password</div>}
          </div>
          <button type="submit" className="btn-primary" style={{ width: "100%", marginBottom: 0 }}>
            Unlock System
          </button>
        </form>
      </div>
    </div>
  );
}
