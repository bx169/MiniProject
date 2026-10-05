import { Link } from "react-router-dom";
import "./Dashboard.css";

const reports = [
  { path: "/dashboard/report3", number: "3", title: "พฤติกรรมของผู้ใช้", icon: "👥", text: "ดูการจอง การขึ้นรถจริง การยกเลิก และ No Show" },
  { path: "/dashboard/report6", number: "6", title: "การมอบหมายงานให้คนขับรถ", icon: "👨‍✈️", text: "ดูจำนวนรอบงานของคนขับ แยกก่อนและหลัง 17:00" },
  { path: "/dashboard/report7", number: "7", title: "จำนวนการมอบหมายงานให้รถแต่ละประเภท", icon: "🚌", text: "ดูการใช้รถ แยกตามทะเบียนและประเภทรถ" },
];

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <h1>Dashboard ระบบรถรับส่ง</h1>
        </div>
      </div>

      <div className="dashboard-report-cards">
        {reports.map((report) => (
          <Link key={report.path} to={report.path} className="dashboard-report-card">
            <div className="dashboard-report-icon">{report.icon}</div>
            <div>
              <div className="dashboard-report-number">รายงานที่ {report.number}</div>
              <h3>{report.title}</h3>
              <p>{report.text}</p>
            </div>
            <span className="dashboard-report-arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
