import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import api from "./api";
import "./Home.css";

export default function Permission() {
  const [positions, setPositions] = useState([]);
  const [positionId, setPositionId] = useState("");
  const [screens, setScreens] = useState([]);

  // ดึงข้อมูลตำแหน่ง
  useEffect(() => {
    api
      .get("/positions")
      .then((res) => {
        setPositions(res.data);
        if (res.data.length) setPositionId(String(res.data[0].POSITION_ID));
      })
      .catch((error) =>
        Swal.fire("Error", error.response?.data?.message || error.message, "error")
      );
  }, []);

  // ดึงรายการสิทธิ์เมื่อเปลี่ยนตำแหน่ง
  useEffect(() => {
    if (!positionId) return;
    api
      .get(`/permissions/${positionId}`)
      .then((res) => setScreens(res.data))
      .catch((error) =>
        Swal.fire("Error", error.response?.data?.message || error.message, "error")
      );
  }, [positionId]);

  // สลับค่า Y/N
  function toggle(screenId) {
    setScreens((old) =>
      old.map((s) =>
        s.SCREEN_ID === screenId
          ? { ...s, CAN_ACCESS: s.CAN_ACCESS === "Y" ? "N" : "Y" }
          : s
      )
    );
  }

  // เปิด/ปิด Modal
  function openConfirmModal() {
    const modalElement = document.getElementById("confirmSaveModal");
    if (modalElement) {
      const modal = Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }

  function closeConfirmModal() {
    const modalElement = document.getElementById("confirmSaveModal");
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  // หาชื่อตำแหน่งปัจจุบัน
  const currentPositionName =
    positions.find((p) => String(p.POSITION_ID) === String(positionId))
      ?.POSITION_NAME || "";

  // ฟังก์ชันบันทึกข้อมูลจริง (เรียกเมื่อกดตกลงใน Modal)
  async function confirmSave() {
    try {
      await api.put("/permissions", {
        positionId,
        permissions: screens.map((s) => ({
          screenId: s.SCREEN_ID,
          canAccess: s.CAN_ACCESS === "Y",
        })),
      });

      closeConfirmModal();

      // แจ้ง Sidebar / Navbar / ProtectedRoute ให้โหลดสิทธิ์ล่าสุดจาก Oracle ทันที
      window.dispatchEvent(new Event("permissionsUpdated"));

      await Swal.fire({
        icon: "success",
        title: "บันทึกสิทธิ์สำเร็จ",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error) {
      closeConfirmModal();
      Swal.fire("Error", error.response?.data?.message || error.message, "error");
    }
  }

  return (
    <div className="container py-4">
      <h2>Permission Management</h2>

      <div className="card p-4 shadow-sm">
        <label className="fw-bold mb-2">Position</label>
        <select
          className="form-select mb-4"
          value={positionId}
          onChange={(e) => setPositionId(e.target.value)}
        >
          {positions.map((p) => (
            <option key={p.POSITION_ID} value={p.POSITION_ID}>
              {p.POSITION_NAME}
            </option>
          ))}
        </select>

        <h5 className="mb-3">สิทธิ์การเข้าใช้งาน</h5>

        <div className="mb-3">
          {screens.filter((screen) => screen.SCREEN_PATH !== '/screens').map((screen) => (
            <div className="form-check mb-2" key={screen.SCREEN_ID}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`screen-${screen.SCREEN_ID}`}
                checked={screen.CAN_ACCESS === "Y"}
                onChange={() => toggle(screen.SCREEN_ID)}
              />
              <label
                className="form-check-label ms-1"
                htmlFor={`screen-${screen.SCREEN_ID}`}
              >
                {screen.SCREEN_NAME} ({screen.SCREEN_PATH})
              </label>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-primary" onClick={openConfirmModal}>
            บันทึกสิทธิ์
          </button>
        </div>
      </div>

      {/* POP-UP MODAL (ยืนยันการบันทึกสิทธิ์) */}
      <div
        className="modal fade"
        id="confirmSaveModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">ยืนยันการบันทึกสิทธิ์</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              คุณต้องการบันทึกการเปลี่ยนแปลงสิทธิ์ของตำแหน่ง{" "}
              <strong className="text-primary">{currentPositionName}</strong>{" "}
              ใช่หรือไม่?
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmSave}
              >
                ยืนยันบันทึก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}