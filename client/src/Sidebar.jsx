import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";
import "./Sidebar.css";

export default function Sidebar() {
  const loc = useLocation();
  const [perms, setPerms] = useState(() => {
    try { return JSON.parse(localStorage.getItem("permissions") || "[]"); }
    catch { return []; }
  });

  const isPersonnelPath = [
    "/employee",
    "/departments",
    "/positions",
    "/permission",
  ].includes(loc.pathname);

  const isSystemPath = [
    "/stops",
    "/routes",
    "/vehicle-types",
    "/vehicles",
    "/schedules",
  ].includes(loc.pathname);

  const [openPersonnel, setOpenPersonnel] = useState(isPersonnelPath);
  const [openSystem, setOpenSystem] = useState(isSystemPath);

  useEffect(() => {
    if (isPersonnelPath) setOpenPersonnel(true);
    if (isSystemPath) setOpenSystem(true);
  }, [isPersonnelPath, isSystemPath]);

  useEffect(() => {
    let alive = true;

    const refreshPermissions = async () => {
      try {
        const res = await api.get("/me");
        const next = res.data.permissions || [];
        localStorage.setItem("permissions", JSON.stringify(next));
        localStorage.setItem("user", JSON.stringify(res.data.user || null));
        window.dispatchEvent(new Event("userUpdated"));
        if (alive) setPerms(next);
      } catch (error) {
        if (alive && error.response?.status !== 401) {
          try { setPerms(JSON.parse(localStorage.getItem("permissions") || "[]")); }
          catch { setPerms([]); }
        }
      }
    };

    refreshPermissions();
    window.addEventListener("permissionsUpdated", refreshPermissions);

    return () => {
      alive = false;
      window.removeEventListener("permissionsUpdated", refreshPermissions);
    };
  }, []);

  const canAccess = (path) => perms.includes(path);
  const dashboardActive = loc.pathname.startsWith("/dashboard");

  const personnelItems = [
    ["/employee", "พนักงาน"],
    ["/departments", "แผนก"],
    ["/positions", "ตำแหน่ง"],
    ["/permission", "สิทธิ์การใช้งาน"],
  ].filter(([path]) => canAccess(path));

  const systemItems = [
    ["/stops", "จุดจอด"],
    ["/routes", "เส้นทาง"],
    ["/vehicle-types", "ประเภทรถ"],
    ["/vehicles", "รถรับส่ง"],
    ["/schedules", "ตารางเดินรถ"],
  ].filter(([path]) => canAccess(path));

  const renderItems = (items) => (
    <div className="side-submenu">
      {items.map(([path, icon, label]) => {
        const active = loc.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`side-link side-sub-link ${active ? "active" : ""}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className="sidebar">
      <nav>
        {/* Home */}
        <div className="side-group">
          <Link
            to="/home"
            className={`side-link side-main-link ${loc.pathname === "/home" ? "active" : ""}`}
          >
            <span>Home</span>
          </Link>
        </div>

        {/* Personnel */}
        {personnelItems.length > 0 && (
          <div className="side-group">
            <button
              type="button"
              className={`side-section-button ${openPersonnel || isPersonnelPath ? "open" : ""}`}
              onClick={() => setOpenPersonnel(v => !v)}
            >
              <span className="side-section-left">
                <span>ข้อมูลบุคลากร</span>
              </span>
              <span className="side-chevron">{openPersonnel ? "⌃" : "⌄"}</span>
            </button>

            {openPersonnel && renderItems(personnelItems)}
          </div>
        )}

        {/* System */}
        {systemItems.length > 0 && (
          <div className="side-group">
            <button
              type="button"
              className={`side-section-button ${openSystem || isSystemPath ? "open" : ""}`}
              onClick={() => setOpenSystem(v => !v)}
            >
              <span className="side-section-left">
                <span>ข้อมูลระบบ</span>
              </span>
              <span className="side-chevron">{openSystem ? "⌃" : "⌄"}</span>
            </button>

            {openSystem && renderItems(systemItems)}
          </div>
        )}

        {/* Dashboard */}
        {canAccess("/dashboard") && (
          <div className="side-group">
            <Link
              to="/dashboard"
              className={`side-link side-main-link ${dashboardActive ? "active" : ""}`}
            >
              <span>Dashboard</span>
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
