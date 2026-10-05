import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import api from "./api";
import "./Home.css";

const emptyForm = {
  empname: "",
  empsurname: "",
  empemail: "",
  emppassword: "",
  deptId: "",
  positionId: "",
};

export default function Employee() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  
  // 1. เพิ่ม State สำหรับเก็บคำค้นหา
  const [searchTerm, setSearchTerm] = useState("");

  async function load() {
    try {
      const [emp, dept, pos] = await Promise.all([
        api.get("/employees"),
        api.get("/departments"),
        api.get("/positions"),
      ]);
      setEmployees(emp.data);
      setDepartments(dept.data);
      setPositions(pos.data);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || error.message, "error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openModal() {
    const modalElement = document.getElementById("employeeModal");
    if (modalElement) {
      const modal = Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }

  function closeModal() {
    const modalElement = document.getElementById("employeeModal");
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  function handleAdd() {
    reset();
    openModal();
  }

  function edit(emp) {
    setEditId(emp.EMPID);
    setForm({
      empname: emp.EMPNAME || "",
      empsurname: emp.EMPSURNAME || "",
      empemail: emp.EMPEMAIL || "",
      emppassword: "",
      deptId: emp.DEPT_ID || "",
      positionId: emp.POSITION_ID || "",
    });
    openModal();
  }

  function reset() {
    setEditId(null);
    setForm(emptyForm);
  }

  async function save(e) {
    e.preventDefault();

    try {
      if (editId) {
        await api.put(`/employees/${editId}`, form);
      } else {
        await api.post("/employees", form);
      }

      closeModal();
      reset();

      await Swal.fire({
        icon: "success",
        title: editId ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });

      load();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || error.message, "error");
    }
  }

  async function remove(id) {
    const result = await Swal.fire({
      title: "ลบพนักงาน?",
      text: `คุณต้องการลบพนักงานรหัส ${id} ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/employees/${id}`);
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

  // 2. ฟังก์ชันกรองพนักงานตามคำค้นหา (ID, ชื่อ, นามสกุล, อีเมล, แผนก, ตำแหน่ง)
  const filteredEmployees = employees.filter((e) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      e.EMPID?.toString().toLowerCase().includes(term) ||
      e.EMPNAME?.toLowerCase().includes(term) ||
      e.EMPSURNAME?.toLowerCase().includes(term) ||
      e.EMPEMAIL?.toLowerCase().includes(term) ||
      e.DEPT_NAME?.toLowerCase().includes(term) ||
      e.POSITION_NAME?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container py-4">
      {/* Header & ปุ่มเปิด Add Modal */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Employee Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + เพิ่มพนักงาน
        </button>
      </div>

      {/* ตารางแสดงข้อมูล Employee List */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title m-0">รายการพนักงาน</h5>
            
            {/* 3. เพิ่มช่อง Input ค้นหา */}
            <div style={{ width: "300px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="ค้นหา (รหัส, ชื่อ, แผนก, ตำแหน่ง)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>ชื่อ</th>
                  <th>นามสกุล</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th className="text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {/* 4. เปลี่ยนมา Map ตัวแปร filteredEmployees */}
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-3">
                      {searchTerm ? "ไม่พบข้อมูลพนักงานที่ตรงกับการค้นหา" : "ไม่มีข้อมูลพนักงาน"}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((e) => (
                    <tr key={e.EMPID}>
                      <td>{e.EMPID}</td>
                      <td>{e.EMPNAME}</td>
                      <td>{e.EMPSURNAME}</td>
                      <td>{e.EMPEMAIL}</td>
                      <td>{e.DEPT_NAME}</td>
                      <td>{e.POSITION_NAME}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => edit(e)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => remove(e.EMPID)}
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

      {/* POP-UP MODAL (สำหรับ Add และ Edit) */}
      <div
        className="modal fade"
        id="employeeModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editId ? `แก้ไขข้อมูลพนักงาน (${editId})` : "เพิ่มพนักงานใหม่"}
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
                    <label className="form-label">ชื่อ</label>
                    <input
                      className="form-control"
                      name="empname"
                      value={form.empname}
                      onChange={change}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">นามสกุล</label>
                    <input
                      className="form-control"
                      name="empsurname"
                      value={form.empsurname}
                      onChange={change}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="empemail"
                      value={form.empemail}
                      onChange={change}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Password {editId && "(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)"}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="emppassword"
                      value={form.emppassword}
                      onChange={change}
                      required={!editId}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      name="deptId"
                      value={form.deptId}
                      onChange={change}
                      required
                    >
                      <option value="">เลือกแผนก</option>
                      {departments.map((d) => (
                        <option key={d.DEPT_ID} value={d.DEPT_ID}>
                          {d.DEPT_NAME}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Position</label>
                    <select
                      className="form-select"
                      name="positionId"
                      value={form.positionId}
                      onChange={change}
                      required
                    >
                      <option value="">เลือกตำแหน่ง</option>
                      {positions.map((p) => (
                        <option key={p.POSITION_ID} value={p.POSITION_ID}>
                          {p.POSITION_NAME}
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
                  {editId ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}