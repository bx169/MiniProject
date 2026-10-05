import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "./api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await api.post("/login", {
        empemail: email,
        emppassword: password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem(
        "permissions",
        JSON.stringify(response.data.permissions)
      );

      await Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        timer: 1000,
        showConfirmButton: false,
      });

      navigate("/home");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: error.response?.data?.message || "ไม่สามารถเชื่อมต่อ Server ได้",
      });
    }
  }

  return (
    <div className="login-container d-flex justify-content-center align-items-center vh-100">
      <div className="login-card card border-0 p-4 shadow">
        <h2 className="text-center fw-bold mb-4">Shuttle Bus System</h2>

        <form onSubmit={handleLogin}>
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
}
