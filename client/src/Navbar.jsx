import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });

  const loadUser = async () => {
    try {
      const res = await api.get("/me");
      const nextUser = res.data.user || null;
      setUser(nextUser);
      localStorage.setItem("user", JSON.stringify(nextUser));
      localStorage.setItem("permissions", JSON.stringify(res.data.permissions || []));
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("permissions");
        navigate("/login", { replace: true });
      }
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("userUpdated", loadUser);
    window.addEventListener("permissionsUpdated", loadUser);

    return () => {
      window.removeEventListener("userUpdated", loadUser);
      window.removeEventListener("permissionsUpdated", loadUser);
    };
  }, []);

  const displayName =
    user?.empname ||
    user?.fullName ||
    [user?.empName, user?.empSurname].filter(Boolean).join(" ") ||
    user?.empemail ||
    "ผู้ใช้งาน";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    navigate("/", { replace: true });
  };

  return (
    <nav className="top-navbar">
      <Link to="/home" className="navbar-brand-custom">
        🚌 <span>Shuttle Bus</span>
      </Link>

      <div className="navbar-user-area">
        <div className="navbar-user-info">
          <div className="navbar-avatar"></div>
          <div>
            <div className="navbar-user-name">{displayName}</div>
            <div className="navbar-user-position">
              {user?.positionName || user?.deptName || user?.empemail || ""}
            </div>
          </div>
        </div>

        <button className="btn-logout-custom" onClick={logout}>
          ออกจากระบบ
        </button>
      </div>
    </nav>
  );
}
