import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card, COLORS, DateRange, ReportHeader, Stat, useDashboardData } from "./DashboardShared";
import "./Dashboard.css";

export default function DashboardReport7() {
  const { from, to, setFrom, setTo, report, loading } = useDashboardData();

  const total = useMemo(() => report.vehicles.reduce((sum, v) => sum + Number(v.count || 0), 0), [report.vehicles]);
  const groups = useMemo(() => {
    const map = {};
    report.vehicles.forEach((v) => {
      const key = `${v.type} ${v.seats} ที่นั่ง`;
      if (!map[key]) map[key] = { name: key, type: v.type, count: 0, cars: [] };
      map[key].count += Number(v.count || 0);
      map[key].cars.push(v);
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [report.vehicles]);

  return (
    <div className="dashboard-page">
      <ReportHeader number="7" title="จำนวนการมอบหมายงานให้รถแต่ละประเภท" loading={loading} />
      <DateRange from={from} to={to} setFrom={setFrom} setTo={setTo} />

      <div className="dashboard-stats">
        <Stat label="รวมรอบทั้งหมด" value={total} color={COLORS.total} />
        {groups.map((g) => <Stat key={g.name} label={g.name} value={g.count} color={COLORS.types[g.type] || COLORS.total} />)}
      </div>

      <div className="dashboard-grid-2">
        <Card title="รายละเอียดแต่ละคัน (จัดกลุ่มตามประเภท)">
          <div className="dashboard-table-wrap"><table><thead><tr><th>ประเภท</th><th>รถ (ทะเบียน)</th><th className="num">จำนวนรอบ</th></tr></thead><tbody>
            {groups.map((g) => g.cars.map((v, index) => <tr key={`${g.name}-${v.id}`}><td>{index === 0 ? g.name : ""}</td><td>{v.plate}</td><td className="num">{v.count}</td></tr>))}
            {!groups.length && <tr><td colSpan="3" className="empty">ไม่มีข้อมูลในช่วงวันที่ที่เลือก</td></tr>}
          </tbody><tfoot><tr><td colSpan="2">รวมทั้งหมด</td><td className="num">{total}</td></tr></tfoot></table></div>
        </Card>
        <Card title="จำนวนรอบแยกตามทะเบียนรถ">
          <ResponsiveContainer width="100%" height={280}><BarChart data={report.vehicles}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="plate" interval={0} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" name="จำนวนรอบ">{report.vehicles.map((v) => <Cell key={v.id} fill={COLORS.types[v.type] || COLORS.total} />)}</Bar></BarChart></ResponsiveContainer>
        </Card>
      </div>

      <Card title="สัดส่วนการใช้รถตามประเภท">
        <ResponsiveContainer width="100%" height={330}><PieChart><Pie data={groups} dataKey="count" nameKey="name" outerRadius={110} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>{groups.map((g) => <Cell key={g.name} fill={COLORS.types[g.type] || COLORS.total} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
      </Card>
    </div>
  );
}
