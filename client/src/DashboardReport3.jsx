import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import {
  Card, COLORS, DateRange, ReportHeader, Stat, useDashboardData,
} from "./DashboardShared";
import "./Dashboard.css";

export default function DashboardReport3() {
  const { from, to, setFrom, setTo, report, loading } = useDashboardData();

  const totals = useMemo(() => report.users.reduce(
    (s, r) => ({
      total: s.total + Number(r.total || 0),
      checkedIn: s.checkedIn + Number(r.checkedIn || 0),
      cancelled: s.cancelled + Number(r.cancelled || 0),
      noShow: s.noShow + Number(r.noShow || 0),
    }),
    { total: 0, checkedIn: 0, cancelled: 0, noShow: 0 }
  ), [report.users]);

  const pie = [
    { name: "ขึ้นรถจริง", value: totals.checkedIn, color: COLORS.checkedIn },
    { name: "ยกเลิก", value: totals.cancelled, color: COLORS.cancelled },
    { name: "No Show", value: totals.noShow, color: COLORS.noShow },
  ].filter((x) => x.value > 0);

  return (
    <div className="dashboard-page">
      <ReportHeader number="3" title="พฤติกรรมของผู้ใช้" loading={loading} />
      <DateRange from={from} to={to} setFrom={setFrom} setTo={setTo} />

      <div className="dashboard-stats">
        <Stat label="การจองทั้งหมด" value={totals.total} color={COLORS.total} />
        <Stat label="ขึ้นรถจริง" value={totals.checkedIn} color={COLORS.checkedIn} />
        <Stat label="ยกเลิก" value={totals.cancelled} color={COLORS.cancelled} />
        <Stat label="No Show" value={totals.noShow} color={COLORS.noShow} />
      </div>

      <Card title="ตารางสรุปรายผู้ใช้">
        <div className="dashboard-table-wrap">
          <table>
            <thead><tr><th>ผู้ใช้</th><th className="num">การจองทั้งหมด</th><th className="num">ขึ้นรถจริง</th><th className="num">ยกเลิก</th><th className="num">No Show</th></tr></thead>
            <tbody>
              {report.users.map((r) => (
                <tr key={r.name}><td>{r.name}</td><td className="num">{r.total}</td><td className="num">{r.checkedIn}</td><td className="num">{r.cancelled}</td><td className="num">{r.noShow}</td></tr>
              ))}
              {!report.users.length && <tr><td colSpan="5" className="empty">ไม่มีข้อมูลในช่วงวันที่ที่เลือก</td></tr>}
            </tbody>
            <tfoot><tr><td>รวมทั้งหมด</td><td className="num">{totals.total}</td><td className="num">{totals.checkedIn}</td><td className="num">{totals.cancelled}</td><td className="num">{totals.noShow}</td></tr></tfoot>
          </table>
        </div>
      </Card>

      <div className="dashboard-grid-2">
        <Card title="พฤติกรรมผู้ใช้ (จำนวนครั้ง)">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={report.users}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={75} /><YAxis allowDecimals={false} /><Tooltip /><Legend verticalAlign="top" /><Bar dataKey="total" name="การจองทั้งหมด" fill={COLORS.total} /><Bar dataKey="checkedIn" name="ขึ้นรถจริง" fill={COLORS.checkedIn} /><Bar dataKey="cancelled" name="ยกเลิก" fill={COLORS.cancelled} /><Bar dataKey="noShow" name="No Show" fill={COLORS.noShow} /></BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="สัดส่วนสถานะการจอง">
          <ResponsiveContainer width="100%" height={340}>
            <PieChart><Pie data={pie} dataKey="value" nameKey="name" outerRadius={110} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>{pie.map((p) => <Cell key={p.name} fill={p.color} />)}</Pie><Tooltip /><Legend /></PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
