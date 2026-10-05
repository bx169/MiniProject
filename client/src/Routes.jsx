import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import api from "./api";
import "./Home.css";

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeName, setRouteName] = useState("");
  const [routeStops, setRouteStops] = useState([]);
  const [editId, setEditId] = useState(null);

  async function load() {
    try {
      const [routeRes, stopRes] = await Promise.all([
        api.get("/routes"),
        api.get("/stops"),
      ]);
      setRoutes(routeRes.data);
      setStops(stopRes.data);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || error.message, "error");
    }
  }

  useEffect(() => { load(); }, []);

  // ฟังก์ชันควบคุม Modal
  function openModal() {
    const modalElement = document.getElementById("routeModal");
    if (modalElement) {
      const modal = Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }

  function closeModal() {
    const modalElement = document.getElementById("routeModal");
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  function reset() {
    setEditId(null);
    setRouteName("");
    setRouteStops([]);
  }

  function handleAdd() {
    reset();
    openModal();
  }

  // ดึงข้อมูล Route มาใส่ Form เพื่อทำการแก้ไข
  function handleEdit(route) {
    setEditId(route.routeId);
    setRouteName(route.routeName);
    
    // แปลงโครงสร้าง stops จาก backend ให้เข้ากับ State routeStops
    const loadedStops = route.stops.map((s) => ({
      stopId: s.STOP_ID,
      minutes: s.MINUTES_FROM_PREVIOUS || 0
    }));
    
    setRouteStops(loadedStops);
    openModal();
  }

  function addStop() {
    setRouteStops([...routeStops, {
      stopId: "",
      minutes: routeStops.length === 0 ? 0 : 1
    }]);
  }

  function changeStop(index, field, value) {
    setRouteStops((old) => old.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  }

  function removeStop(index) {
    setRouteStops((old) => old.filter((_, i) => i !== index));
  }

  async function save(e) {
    e.preventDefault();

    if (routeStops.length < 2) {
      return Swal.fire("ข้อมูลไม่ครบ", "เส้นทาง ต้องมีอย่างน้อย 2 จุดจอด", "warning");
    }

    if (routeStops.some((s) => !s.stopId)) {
      return Swal.fire("ข้อมูลไม่ครบ", "กรุณาเลือกจุดจอดทุกจุด", "warning");
    }

    const formattedStops = routeStops.map((item, index) => ({
      stopId: Number(item.stopId),
      minutes: index === 0 ? 0 : Number(item.minutes) || 0
    }));

    const payload = {
      routeName,
      stops: formattedStops
    };

    try {
      if (editId) {
        await api.put(`/routes/${editId}`, payload);
      } else {
        await api.post("/routes", payload);
      }

      closeModal();
      reset();

      await Swal.fire({
        icon: "success",
        title: editId ? "แก้ไขเส้นทางสำเร็จ" : "เพิ่มเส้นทางสำเร็จ",
        timer: 1000,
        showConfirmButton: false,
      });

      load();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data || error.message;
      Swal.fire("Error", typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg, "error");
    }
  }

  async function removeRoute(id) {
    const result = await Swal.fire({
      title: "ลบ Route?",
      text: `ต้องการลบเส้นทาง ID: ${id} ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/routes/${id}`);
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Route Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + เพิ่มเส้นทางใหม่
        </button>
      </div>

      {/* รายการเส้นทาง */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">รายการเส้นทาง</h5>

          {routes.length === 0 ? (
            <div className="text-center text-muted py-4">ไม่มีข้อมูลเส้นทาง</div>
          ) : (
            routes.map((route) => (
              <div className="border rounded p-3 mb-3 bg-white" key={route.routeId}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1 text-primary">{route.routeName}</h5>
                    <div className="text-muted">
                      รวมเวลา <strong>{route.totalMinutes}</strong> นาที
                    </div>
                  </div>

                  <div>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(route)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeRoute(route.routeId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <ol className="mt-3 mb-0">
                  {route.stops.map((stop) => (
                    <li key={`${route.routeId}-${stop.STOP_ORDER}`}>
                      {stop.STOP_NAME}
                      {stop.STOP_ORDER > 1 && ` — ${stop.MINUTES_FROM_PREVIOUS} นาที`}
                    </li>
                  ))}
                </ol>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pop-up Modal (สร้าง / แก้ไข เส้นทาง) */}
      <div
        className="modal fade"
        id="routeModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editId ? `แก้ไขเส้นทาง (${routeName})` : "เพิ่มเส้นทางใหม่"}
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
                <div className="mb-3">
                  <label className="form-label fw-bold">ชื่อเส้นทาง</label>
                  <input
                    className="form-control"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="เช่น เส้นทางที่ 1"
                    required
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0 fw-bold">จุดจอด</h6>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={addStop}
                  >
                    + เพิ่มจุดจอด
                  </button>
                </div>

                {routeStops.length === 0 ? (
                  <div className="p-3 text-center text-muted border rounded bg-light">
                    ยังไม่มีจุดจอด กรุณากดปุ่ม "+ เพิ่มจุดจอด"
                  </div>
                ) : (
                  routeStops.map((item, index) => (
                    <div className="row g-2 mb-2 align-items-center" key={index}>
                      <div className="col-md-6">
                        <select
                          className="form-select"
                          value={item.stopId}
                          onChange={(e) => changeStop(index, "stopId", e.target.value)}
                          required
                        >
                          <option value="">เลือกจุดจอด</option>
                          {stops.map((stop) => (
                            <option key={stop.STOP_ID} value={stop.STOP_ID}>
                              {index + 1}. {stop.STOP_NAME}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          value={item.minutes}
                          disabled={index === 0}
                          onChange={(e) => changeStop(index, "minutes", e.target.value)}
                          placeholder={index === 0 ? "จุดเริ่มต้น (0 นาที)" : "นาทีจากจุดก่อนหน้า"}
                        />
                      </div>

                      <div className="col-md-2">
                        <button
                          type="button"
                          className="btn btn-danger w-100"
                          onClick={() => removeStop(index)}
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
                  {editId ? "บันทึกการแก้ไข" : "บันทึกเส้นทาง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}