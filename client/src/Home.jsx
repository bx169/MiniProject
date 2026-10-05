import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

// 1. หน้า Home สำหรับผู้ใช้ที่ "ยังไม่ได้เข้าสู่ระบบ" (Guest)

function HomeGuest() {
  const navigate = useNavigate();

  return (
    <div className="home-guest-wrapper d-flex flex-column justify-content-between">
      <div className="container d-flex justify-content-center align-items-center my-auto py-4">
        <div className="hero-card d-flex flex-column flex-md-row">

          {/* ฝั่งซ้าย (สีน้ำเงินเข้ม) */}
          <div className="hero-left col-md-6 p-4 p-lg-5 d-flex flex-column justify-content-between">
            <div>
              <span className="badge-custom px-3 py-1 mb-3 d-inline-block">
                บริการรถรับส่ง MUT
              </span>
              <h2 className="hero-title mb-3">
                เดินทางสะดวก<br />ตรงเวลา ทุกเที่ยว
              </h2>
              <p className="hero-subtitle mb-4">
                ตรวจสอบเที่ยวรถและเลือกที่นั่งได้ง่ายในไม่กี่ขั้นตอน
              </p>
            </div>

            {/* Bus Graphic */}
            <div className="position-relative pt-3">
              <div className="bus-card-mock p-3 shadow-sm">
                <div className="row g-2 mb-3">
                  <div className="col-4"><div className="bus-window"></div></div>
                  <div className="col-4"><div className="bus-window"></div></div>
                  <div className="col-4"><div className="bus-window"></div></div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="bus-code">SHUTTLE • SH-001</span>
                  <div className="d-flex gap-1">
                    <span className="dot-yellow"></span>
                    <span className="dot-yellow"></span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-around px-4 position-relative" style={{ marginTop: "-10px" }}>
                <div className="bus-wheel"></div>
                <div className="bus-wheel"></div>
              </div>
            </div>
          </div>

          {/* ฝั่งขวา (สีขาว) */}
          <div className="hero-right col-md-6 p-4 p-lg-5 d-flex flex-column justify-content-center">
            <div className="mb-4">
              <div className="icon-welcome-box d-flex align-items-center justify-content-center mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d6fb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="13" rx="2"></rect>
                  <path d="M4 11h16"></path>
                  <path d="M6 19v2"></path>
                  <path d="M18 19v2"></path>
                  <circle cx="7.5" cy="16.5" r="1.5"></circle>
                  <circle cx="16.5" cy="16.5" r="1.5"></circle>
                </svg>
              </div>
              <h2 className="welcome-title mb-2">ยินดีต้อนรับ</h2>
              <p className="welcome-desc">
                เข้าสู่ระบบเพื่อดูเที่ยวรถ จองที่นั่ง และจัดการการเดินทางของคุณ
              </p>
            </div>

            <div className="mt-3">
              <button
                onClick={() => navigate("/login")}
                className="btn btn-login-main w-100 d-flex align-items-center justify-content-center gap-2 mb-3"
              >
                <span>เข้าสู่ระบบ</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


// 2. หน้า Home สำหรับผู้ใช้ที่ "เข้าสู่ระบบแล้ว" (Dashboard ตามโค้ดเดิมของคุณ)

function HomeDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");

  const menus = [
    { path: "/employee", title: "จัดการพนักงาน", icon: "👥", text: "เพิ่มและแก้ไขพนักงาน" },
    { path: "/departments", title: "จัดการแผนก", icon: "🏢", text: "เพิ่มและแก้ไขแผนก" },
    { path: "/positions", title: "จัดการตำแหน่ง", icon: "💼", text: "เพิ่มและแก้ไขตำแหน่ง" },
    { path: "/permission", title: "จัดการสิทธิ์", icon: "🔐", text: "กำหนดสิทธิ์ตาม Position" },
    { path: "/stops", title: "จัดการจุดจอด", icon: "📍", text: "เพิ่มและแก้ไขจุดจอด" },
    { path: "/routes", title: "จัดการเส้นทาง", icon: "🛣️", text: "สร้างเส้นทางและกำหนดจุดจอด" },
    { path: "/vehicle-types", title: "ประเภทรถ", icon: "🚐", text: "กำหนดประเภทและจำนวนที่นั่ง" },
    { path: "/vehicles", title: "จัดการรถ", icon: "🚌", text: "ทะเบียนและสถานะรถ" },
    { path: "/schedules", title: "จัดการตารางเดินรถ", icon: "🚌", text: "กำหนดเวลา คนขับ และรถ" },
    { path: "/dashboard", title: "แดชบอร์ด", icon: "📊", text: "ภาพรวมของระบบ" },
  ];

  const isAdmin = user?.positionName === 'Admin' || user?.position_name === 'Admin';
  const visibleMenus = menus.filter((m) => isAdmin || permissions.includes(m.path));

  return (
    <div className="container py-4">
      <div className="p-4 mb-4 text-white rounded-4 shadow-sm" style={{ background: "linear-gradient(135deg, #123059 0%, #1d6fb8 100%)" }}>
        <h2 className="fw-bold mb-1">ยินดีต้อนรับคุณ {user.empname || user.username || "ผู้ใช้งาน"} 👋</h2>
        <p className="mb-0 text-white-50">{user.deptName || "แผนก"} | {user.positionName || "ตำแหน่ง"}</p>
      </div>

      <h4 className="fw-bold text-dark mb-3">เมนูระบบ</h4>

      <div className="row g-2">
        {visibleMenus.map((menu) => (
          <div
            key={menu.path}
            style={{ flex: "0 0 20%", maxWidth: "20%" }}
            className="col-12 col-sm-6 col-md-4"
          >
            <div
              className="card h-100 shadow-sm border-0 rounded-4 dashboard-card"
              style={{ cursor: "pointer", transition: "all 0.2s ease" }}
              onClick={() => navigate(menu.path)}
            >
              <div className="card-body p-3">
                <div className="mb-2" style={{ fontSize: 24 }}>{menu.icon}</div>
                <h6 className="fw-bold text-dark mb-1">{menu.title}</h6>
                <p className="text-muted small mb-0" style={{ fontSize: "0.75rem" }}>{menu.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleMenus.length === 0 && (
        <div className="alert alert-warning mt-3 rounded-3">
          Position นี้ยังไม่มีสิทธิ์ใช้งานเมนูใด
        </div>
      )}
    </div>
  );
}


// 3. Main Component (เช็กการล็อกอินแบบปลอดภัย)

export default function Home() {
  const getUser = () => {
    try {
      const item = localStorage.getItem("user");
      if (!item || item === "undefined") return null;
      return JSON.parse(item);
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  };

  const user = getUser();

  return user && typeof user === "object" && Object.keys(user).length > 0 ? (
    <HomeDashboard />
  ) : (
    <HomeGuest />
  );
}