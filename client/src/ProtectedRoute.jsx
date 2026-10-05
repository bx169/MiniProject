import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "./api";

function readSession() {
  const token = localStorage.getItem("token");
  let permissions = [];

  try {
    permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
  } catch {
    permissions = [];
  }

  return { token, permissions };
}

export default function ProtectedRoute({ children, path }) {
  const [session, setSession] = useState(readSession);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;

    const refresh = async () => {
      const current = readSession();

      if (!current.token) {
        if (alive) {
          setSession(current);
          setChecking(false);
        }
        return;
      }

      try {
        const res = await api.get("/me");
        const permissions = res.data.permissions || [];

        localStorage.setItem("permissions", JSON.stringify(permissions));
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (alive) {
          setSession({ token: current.token, permissions });
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("permissions");

          if (alive) {
            setSession({ token: null, permissions: [] });
          }
        } else if (alive) {
          setSession(current);
        }
      } finally {
        if (alive) setChecking(false);
      }
    };

    refresh();
    window.addEventListener("permissionsUpdated", refresh);
    window.addEventListener("userUpdated", refresh);

    return () => {
      alive = false;
      window.removeEventListener("permissionsUpdated", refresh);
      window.removeEventListener("userUpdated", refresh);
    };
  }, []);

  if (checking) return null;

  if (!session.token) {
    return <Navigate to="/login" replace />;
  }

  if (path && !session.permissions.includes(path)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
