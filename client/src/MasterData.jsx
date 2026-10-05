import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import api from "./api";

const configs = {
  departments: { title: "Department Management", api: "/departments", id: "DEPT_ID", name: "DEPT_NAME", label: "ชื่อแผนก" },
  positions: { title: "Position Management", api: "/positions", id: "POSITION_ID", name: "POSITION_NAME", label: "ชื่อตำแหน่ง" },
  stops: { title: "Stop Management", api: "/stops", id: "STOP_ID", name: "STOP_NAME", label: "ชื่อจุดจอด" },
  "vehicle-types": { title: "Vehicle Type Management", api: "/vehicle-types", id: "VEHICLE_TYPE_ID", name: "TYPE_NAME", label: "ชื่อประเภทรถ", seats: true },
};

export default function MasterData({ type }) {
  const cfg = configs[type];
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [seats, setSeats] = useState("");
  const [editId, setEditId] = useState(null);

  async function load() {
    try { const r = await api.get(cfg.api); setRows(r.data); }
    catch (e) { Swal.fire("Error", e.response?.data?.message || e.message, "error"); }
  }
  useEffect(() => { load(); }, [type]);

  function openModal(row = null) {
    setEditId(row ? row[cfg.id] : null);
    setName(row ? row[cfg.name] : "");
    setSeats(row ? row.SEATS : "");
    Modal.getOrCreateInstance(document.getElementById("masterModal")).show();
  }
  function closeModal() { Modal.getInstance(document.getElementById("masterModal"))?.hide(); }

  async function save(e) {
    e.preventDefault();
    try {
      const payload = cfg.seats ? { name, seats: Number(seats) } : { name };
      if (editId) await api.put(`${cfg.api}/${editId}`, payload);
      else await api.post(cfg.api, payload);
      closeModal(); setName(""); setSeats(""); setEditId(null); await load();
      Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 900, showConfirmButton: false });
    } catch (e) { Swal.fire("ไม่สามารถบันทึกได้", e.response?.data?.message || e.message, "error"); }
  }
  async function remove(id) {
    const r = await Swal.fire({ title: "ลบข้อมูล?", icon: "warning", showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก", confirmButtonColor: "#d33" });
    if (!r.isConfirmed) return;
    try { await api.delete(`${cfg.api}/${id}`); await load(); Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 800, showConfirmButton: false }); }
    catch (e) { Swal.fire("ลบไม่ได้", e.response?.data?.message || e.message, "error"); }
  }

  return <div className="container py-4">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div><h2 className="mb-1">{cfg.title}</h2></div>
      <button className="btn btn-primary" onClick={() => openModal()}>+ เพิ่มข้อมูล</button>
    </div>
    <div className="card border-0 shadow-sm"><div className="card-body">
      <div className="table-responsive"><table className="table table-hover align-middle">
        <thead className="table-light"><tr><th>ID</th><th>{cfg.label}</th>{cfg.seats && <th>ที่นั่ง</th>}<th className="text-center">จัดการ</th></tr></thead>
        <tbody>{rows.length ? rows.map(r => <tr key={r[cfg.id]}><td>{r[cfg.id]}</td><td>{r[cfg.name]}</td>{cfg.seats && <td>{r.SEATS}</td>}<td className="text-center"><button className="btn btn-warning btn-sm me-2" onClick={() => openModal(r)}>แก้ไข</button><button className="btn btn-danger btn-sm" onClick={() => remove(r[cfg.id])}>ลบ</button></td></tr>) : <tr><td colSpan={cfg.seats ? 4 : 3} className="text-center text-muted py-4">ยังไม่มีข้อมูล</td></tr>}</tbody>
      </table></div>
    </div></div>
    <div className="modal fade" id="masterModal" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={save}>
            <div className="modal-header"><h5>{editId ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}</h5><button type="button" className="btn-close" data-bs-dismiss="modal" /></div>
            <div className="modal-body"><label className="form-label">{cfg.label}</label><input className="form-control mb-3" value={name} onChange={e => setName(e.target.value)} required autoFocus />{cfg.seats && <><label className="form-label">จำนวนที่นั่ง</label><input type="number" min="1" className="form-control" value={seats} onChange={e => setSeats(e.target.value)} required /></>}</div>
            <div className="modal-footer"><button type="button" className="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button><button className="btn btn-primary">บันทึก</button></div>
          </form>
        </div>
      </div>
    </div>
  </div>;
}