import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import api from "./api";
import "./Home.css";

const emptyForm = {
  routeId: "",
  scheduleTime: "",
  empId: "",
  vehicleId: "",
};

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  async function load() {
    try {
      const [scheduleRes, routeRes, driverRes, vehicleRes] = await Promise.all([
        api.get("/schedules"),
        api.get("/routes"),
        api.get("/drivers"),
        api.get("/vehicles"),
      ]);

      setSchedules(scheduleRes.data);
      setRoutes(routeRes.data);
      setDrivers(driverRes.data);
      setVehicles(vehicleRes.data);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || error.message, "error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ฟังก์ชันควบคุม Modal
  function openModal() {
    const modalElement = document.getElementById("scheduleModal");
    if (modalElement) {
      const modal = Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }

  function closeModal() {
    const modalElement = document.getElementById("scheduleModal");
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  function reset() {
    setEditId(null);
    setForm(emptyForm);
  }

  function handleAdd() {
    reset();
    openModal();
  }

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function edit(item) {
    setEditId(item.SCHEDULE_ID);
    setForm({
      routeId: item.ROUTE_ID,
      scheduleTime: item.SCHEDULE_TIME,
      empId: item.EMP_ID,
      vehicleId: item.VEHICLE_ID,
    });
    openModal();
  }

  async function save(e) {
    e.preventDefault();

    try {
      if (editId) {
        await api.put(`/schedules/${editId}`, form);
      } else {
        await api.post("/schedules", form);
      }

      closeModal();
      reset();

      await Swal.fire({
        icon: "success",
        title: editId ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ",
        timer: 1000,
        showConfirmButton: false,
      });

      load();
    } catch (error) {
      Swal.fire(
        "ไม่สามารถบันทึกได้",
        error.response?.data?.message || error.message,
        "error"
      );
    }
  }

  async function remove(id) {
    const result = await Swal.fire({
      title: "ลบตาราง?",
      text: `ต้องการลบตารางเดินรถ ID: ${id} ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/schedules/${id}`);
      load();
      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || error.message, "error");
    }
  }

  return (
    <div className="container py-4">
      {/* Header & ปุ่มเปิด Add Modal */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Schedule Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + เพิ่มตารางเดินรถ
        </button>
      </div>

      {/* ตารางแสดงข้อมูล Schedule List */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">รายการตารางเดินรถ</h5>

          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>เส้นทาง</th>
                  <th>เวลา</th>
                  <th>คนขับ</th>
                  <th>รถ</th>
                  <th className="text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-3">
                      ยังไม่มีข้อมูลตารางเดินรถ
                    </td>
                  </tr>
                ) : (
                  schedules.map((s) => (
                    <tr key={s.SCHEDULE_ID}>
                      <td>{s.ROUTE_NAME}</td>
                      <td>{s.SCHEDULE_TIME}</td>
                      <td>
                        {s.EMPNAME} {s.EMPSURNAME}
                      </td>
                      <td>
                        {s.LICENSE_PLATE} ({s.VEHICLE_TYPE})
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => edit(s)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => remove(s.SCHEDULE_ID)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* POP-UP MODAL (สำหรับ Add และ Edit Schedule) */}
      <div
        className="modal fade"
        id="scheduleModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editId ? `แก้ไขตารางเดินรถ (${editId})` : "เพิ่มตารางเดินรถใหม่"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={reset}
              ></button>
            </div>

            <form onSubmit={save}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">เส้นทาง</label>
                    <select
                      className="form-select"
                      name="routeId"
                      value={form.routeId}
                      onChange={change}
                      required
                    >
                      <option value="">เลือกเส้นทาง</option>
                      {routes.map((r) => (
                        <option key={r.routeId} value={r.routeId}>
                          {r.routeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">เวลา</label>
                    <input
                      type="time"
                      className="form-control"
                      name="scheduleTime"
                      value={form.scheduleTime}
                      onChange={change}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">คนขับ</label>
                    <select
                      className="form-select"
                      name="empId"
                      value={form.empId}
                      onChange={change}
                      required
                    >
                      <option value="">เลือกคนขับ</option>
                      {drivers.map((d) => (
                        <option key={d.EMPID} value={d.EMPID}>
                          {d.EMPNAME} {d.EMPSURNAME} ({d.EMPID})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">รถ</label>
                    <select
                      className="form-select"
                      name="vehicleId"
                      value={form.vehicleId}
                      onChange={change}
                      required
                    >
                      <option value="">เลือกรถ</option>
                      {vehicles.map((v) => (
                        <option key={v.VEHICLE_ID} value={v.VEHICLE_ID}>
                          {v.LICENSE_PLATE} - {v.VEHICLE_TYPE}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={reset}
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  {editId ? "บันทึกการแก้ไข" : "บันทึกตาราง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}