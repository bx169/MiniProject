import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "./api";

export const COLORS = {
  total: "#2563eb",
  checkedIn: "#16a34a",
  cancelled: "#dc2626",
  noShow: "#f59e0b",
  before: "#2563eb",
  after: "#7c3aed",
  types: {
    "รถตู้": "#2563eb",
    "รถบัส": "#16a34a",
    "รถมินิบัส": "#f59e0b",
  },
};

export const defaultFrom = "2025-04-01";
export const defaultTo = "2025-04-30";

export function DateRange({ from, to, setFrom, setTo }) {
  return (
    <div className="dashboard-filters">
      <label>
        ตั้งแต่วันที่
        <input
          type="date"
          value={from}
          max={to}
          onChange={(e) => e.target.value && setFrom(e.target.value)}
        />
      </label>
      <label>
        ถึงวันที่
        <input
          type="date"
          value={to}
          min={from}
          onChange={(e) => e.target.value && setTo(e.target.value)}
        />
      </label>
    </div>
  );
}

export function Card({ title, children }) {
  return (
    <section className="dashboard-card">
      {title && <h3>{title}</h3>}
      {children}
    </section>
  );
}

export function Stat({ label, value, color }) {
  return (
    <div className="dashboard-stat" style={{ borderTopColor: color }}>
      <div className="dashboard-stat-value">{value}</div>
      <div className="dashboard-stat-label">{label}</div>
    </div>
  );
}

export function useDashboardData() {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [report, setReport] = useState({ users: [], drivers: [], vehicles: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/dashboard", { params: { from, to } });
        if (alive) setReport(res.data);
      } catch (error) {
        if (alive) {
          Swal.fire(
            "ไม่สามารถโหลดข้อมูลรายงาน",
            error.response?.data?.message || error.message,
            "error"
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [from, to]);

  return { from, to, setFrom, setTo, report, loading };
}

export function ReportHeader({ number, title, loading }) {
  return (
    <div className="dashboard-heading">
      <div>
        <h1>รายงานที่ {number}: {title}</h1>
        <p>Dashboard ระบบรถรับส่ง</p>
      </div>
      {loading && <span className="dashboard-loading">กำลังโหลด...</span>}
    </div>
  );
}
