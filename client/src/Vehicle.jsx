import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import api from "./api";

const empty = { licensePlate: "", status: "ACTIVE", vehicleTypeId: "" };

export default function Vehicle() {
  const [rows, setRows] = useState([]);
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  async function load() {
    try {
      const [v, t] = await Promise.all([
        api.get("/vehicles"),
        api.get("/vehicle-types"),
      ]);
      setRows(v.data);
      setTypes(t.data);
    } catch (e) {
      Swal.fire("Error", e.response?.data?.message || e.message, "error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function open(row = null) {
    setEditId(row?.VEHICLE_ID || null);
    setForm(
      row
        ? {
            licensePlate: row.LICENSE_PLATE,
            status: row.STATUS,
            vehicleTypeId: row.VEHICLE_TYPE_ID,
          }
        : empty
    );
    Modal.getOrCreateInstance(document.getElementById("vehicleModal")).show();
  }

  function close() {
    Modal.getInstance(document.getElementById("vehicleModal"))?.hide();
  }

  async function save(e) {
    e.preventDefault();
    try {
      if (editId) await api.put(`/vehicles/${editId}`, form);
      else await api.post("/vehicles", form);
      close();
      await load();
      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        timer: 900,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire("บันทึกไม่ได้", e.response?.data?.message || e.message, "error");
    }
  }

  async function remove(id) {
    const r = await Swal.fire({
      title: "ลบรถ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
    });
    if (!r.isConfirmed) return;
    try {
      await api.delete(`/vehicles/${id}`);
      load();
    } catch (e) {
      Swal.fire("ลบไม่ได้", e.response?.data?.message || e.message, "error");
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Vehicle Management</h2>
        </div>
        <button className="btn btn-primary" onClick={() => open()}>
          + เพิ่มรถ
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>ทะเบียน</th>
                <th>ประเภท</th>
                <th>ที่นั่ง</th>
                <th>สถานะ</th>
                <th className="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((v) => (
                  <tr key={v.VEHICLE_ID}>
                    <td>{v.VEHICLE_ID}</td>
                    <td>{v.LICENSE_PLATE}</td>
                    <td>{v.TYPE_NAME}</td>
                    <td>{v.SEATS}</td>
                    <td>
                      <span
                        className={`badge ${
                          v.STATUS === "ACTIVE"
                            ? "text-bg-success"
                            : v.STATUS === "MAINTENANCE"
                            ? "text-bg-warning"
                            : "text-bg-secondary"
                        }`}
                      >
                        {v.STATUS}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => open(v)}
                      >
                        แก้ไข
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(v.VEHICLE_ID)}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    ยังไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POP-UP MODAL */}
      <div className="modal fade" id="vehicleModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={save}>
              <div className="modal-header">
                <h5>{editId ? "แก้ไขรถ" : "เพิ่มรถ"}</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                />
              </div>
              <div className="modal-body">
                <label className="form-label">ทะเบียนรถ</label>
                <input
                  className="form-control mb-3"
                  value={form.licensePlate}
                  onChange={(e) =>
                    setForm({ ...form, licensePlate: e.target.value })
                  }
                  required
                />
                <label className="form-label">ประเภทรถ</label>
                <select
                  className="form-select mb-3"
                  value={form.vehicleTypeId}
                  onChange={(e) =>
                    setForm({ ...form, vehicleTypeId: e.target.value })
                  }
                  required
                >
                  <option value="">เลือกประเภท</option>
                  {types.map((t) => (
                    <option key={t.VEHICLE_TYPE_ID} value={t.VEHICLE_TYPE_ID}>
                      {t.TYPE_NAME}
                    </option>
                  ))}
                </select>
                <label className="form-label">สถานะ</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  ยกเลิก
                </button>
                <button className="btn btn-primary">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}