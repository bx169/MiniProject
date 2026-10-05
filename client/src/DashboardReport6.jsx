import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, COLORS, DateRange, ReportHeader, Stat, useDashboardData } from "./DashboardShared";
import "./Dashboard.css";

export default function DashboardReport6() {
  const { from, to, setFrom, setTo, report, loading } = useDashboardData();

  const totals = useMemo(() => report.drivers.reduce(
    (s, r) => ({
      total: s.total + Number(r.total || 0),
      before: s.before + Number(r.before || 0),
      after: s.after + Number(r.after || 0),
    }),
    { total: 0, before: 0, after: 0 }
  ), [report.drivers]);

  return (
    <div className="dashboard-page">
      <ReportHeader number="6" title="การมอบหมายงานให้คนขับรถ" loading={loading} />
      <DateRange from={from} to={to} setFrom={setFrom} setTo={setTo} />

      <div className="dashboard-stats dashboard-stats-3">
        <Stat label="รวมรอบทั้งหมด" value={totals.total} color={COLORS.total} />
        <Stat label="ก่อน 17:00" value={totals.before} color={COLORS.before} />
        <Stat label="หลัง 17:00" value={totals.after} color={COLORS.after} />
      </div>

      <div className="dashboard-grid-2">
        <Card title="ตารางการแบ่งงาน">
          <div className="dashboard-table-wrap"><table><thead><tr><th>คนขับ</th><th className="num">รวม</th><th className="num">ก่อน 17:00</th><th className="num">หลัง 17:00</th></tr></thead><tbody>{report.drivers.map((r) => <tr key={r.name}><td>{r.name}</td><td className="num">{r.total}</td><td className="num">{r.before}</td><td className="num">{r.after}</td></tr>)}{!report.drivers.length && <tr><td colSpan="4" className="empty">ไม่มีข้อมูลในช่วงวันที่ที่เลือก</td></tr>}</tbody><tfoot><tr><td>รวมทั้งหมด</td><td className="num">{totals.total}</td><td className="num">{totals.before}</td><td className="num">{totals.after}</td></tr></tfoot></table></div>
        </Card>
        <Card title="จำนวนรอบงานก่อน/หลัง 17:00">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={report.drivers}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={75} /><YAxis allowDecimals={false} /><Tooltip /><Legend verticalAlign="top" /><Bar dataKey="before" name="ก่อน 17:00" stackId="a" fill={COLORS.before} /><Bar dataKey="after" name="หลัง 17:00" stackId="a" fill={COLORS.after} /></BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
