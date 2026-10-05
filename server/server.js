const express = require("express");
const cors = require("cors");
const oracledb = require("oracledb");
const { getConnection } = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

async function closeConnection(connection) {
    if (connection) {
        try {
            await connection.close();
        } catch (err) {
            console.error("Close connection error:", err.message);
        }
    }
}

async function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
    }

    let connection;

    try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "mini-project-secret"
        );

        connection = await getConnection();

        // อ่านตำแหน่งปัจจุบันจาก Oracle ทุกครั้ง เพื่อให้ถ้ามีการเปลี่ยนตำแหน่ง
        // หรือเปลี่ยนสิทธิ์แล้ว มีผลทันทีโดยไม่ต้อง Logout/Login
        const employeeResult = await connection.execute(
            `SELECT
               e.EMP_ID,
               e.EMP_NAME,
               e.EMP_SURNAME,
               e.EMP_EMAIL,
               e.DEPT_ID,
               d.DEPT_NAME,
               e.POSITION_ID,
               p.POSITION_NAME
             FROM EMPLOYEES e
             LEFT JOIN DEPARTMENTS d ON d.DEPT_ID = e.DEPT_ID
             LEFT JOIN POSITIONS p ON p.POSITION_ID = e.POSITION_ID
             WHERE e.EMP_ID = :empId`,
            { empId: decoded.empId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (employeeResult.rows.length === 0) {
            return res.status(401).json({ message: "ไม่พบผู้ใช้งาน" });
        }

        const employee = employeeResult.rows[0];

        const permissionResult = await connection.execute(
            `SELECT s.SCREEN_PATH
             FROM POSITION_PERMISSIONS pp
             JOIN SCREENS s ON s.SCREEN_ID = pp.SCREEN_ID
             WHERE pp.POSITION_ID = :positionId
               AND pp.CAN_ACCESS = 'Y'
               AND s.SCREEN_PATH <> '/screens'
             ORDER BY s.SCREEN_ID`,
            { positionId: employee.POSITION_ID },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const permissions = permissionResult.rows.map(
            (row) => row.SCREEN_PATH
        );

        req.user = {
            empId: employee.EMP_ID,
            empname: `${employee.EMP_NAME || ""} ${employee.EMP_SURNAME || ""}`.trim(),
            empemail: employee.EMP_EMAIL,
            deptId: employee.DEPT_ID,
            deptName: employee.DEPT_NAME,
            positionId: employee.POSITION_ID,
            positionName: employee.POSITION_NAME,
            permissions,
        };

        next();
    } catch (error) {
        console.error("AUTH ERROR:", error.message);

        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่",
            });
        }

        return res.status(500).json({
            message: "ไม่สามารถตรวจสอบสิทธิ์ผู้ใช้งานได้",
        });
    } finally {
        await closeConnection(connection);
    }
}

function requirePermission(path) {
    return (req, res, next) => {
        if (!req.user?.permissions?.includes(path)) {
            return res.status(403).json({
                message: "ไม่มีสิทธิ์เข้าใช้งานหน้านี้",
            });
        }
        next();
    };
}

app.get("/", (req, res) => {
    res.json({ message: "Mini Project API is running" });
});

app.get("/api/me", auth, async (req, res) => {
    res.json({
        user: {
            empId: req.user.empId,
            empname: req.user.empname,
            empemail: req.user.empemail,
            deptId: req.user.deptId,
            deptName: req.user.deptName,
            positionId: req.user.positionId,
            positionName: req.user.positionName,
        },
        permissions: req.user.permissions,
    });
});

// LOGIN

app.post("/api/login", async (req, res) => {
    let connection;

    try {
        const { empemail, emppassword } = req.body;

        if (!empemail || !emppassword) {
            return res.status(400).json({
                message: "กรุณากรอก Email และ Password",
            });
        }

        connection = await getConnection();

        const result = await connection.execute(
            `SELECT
         e.EMP_ID AS EMPID,
         e.EMP_NAME AS EMPNAME,
         e.EMP_SURNAME AS EMPSURNAME,
         e.EMP_EMAIL AS EMPEMAIL,
         e.EMP_PASSWORD AS EMPPASSWORD,
         e.DEPT_ID,
         e.POSITION_ID,
         p.POSITION_NAME,
         d.DEPT_NAME
       FROM EMPLOYEES e
       LEFT JOIN POSITIONS p ON p.POSITION_ID = e.POSITION_ID
       LEFT JOIN DEPARTMENTS d ON d.DEPT_ID = e.DEPT_ID
       WHERE e.EMP_EMAIL = :empemail`,
            { empemail },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
            });
        }

        const employee = result.rows[0];

        const passwordOk = await bcrypt.compare(
            emppassword,
            employee.EMPPASSWORD
        );

        if (!passwordOk) {
            return res.status(401).json({
                message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
            });
        }

        const permissionResult = await connection.execute(
            `SELECT s.SCREEN_PATH
       FROM POSITION_PERMISSIONS pp
       JOIN SCREENS s ON s.SCREEN_ID = pp.SCREEN_ID
       WHERE pp.POSITION_ID = :positionId
         AND pp.CAN_ACCESS = 'Y'
         AND s.SCREEN_PATH <> '/screens'
       ORDER BY s.SCREEN_ID`,
            { positionId: employee.POSITION_ID },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const permissions = permissionResult.rows.map(
            (row) => row.SCREEN_PATH
        );

        const user = {
            empId: employee.EMPID,
            empname: `${employee.EMPNAME} ${employee.EMPSURNAME}`.trim(),
            empemail: employee.EMPEMAIL,
            deptId: employee.DEPT_ID,
            deptName: employee.DEPT_NAME,
            positionId: employee.POSITION_ID,
            positionName: employee.POSITION_NAME,
        };

        const token = jwt.sign(
            {
                empId: employee.EMPID,
                positionId: employee.POSITION_ID,
                permissions,
            },
            process.env.JWT_SECRET || "mini-project-secret",
            { expiresIn: "8h" }
        );

        res.json({ user, permissions, token });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({
            message: "Login failed",
            error: error.message,
        });
    } finally {
        await closeConnection(connection);
    }
});

// DEPARTMENTS / POSITIONS

app.get("/api/departments", auth, requirePermission("/departments"), async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT DEPT_ID, DEPT_NAME
       FROM DEPARTMENTS
       ORDER BY DEPT_ID`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: "Cannot get departments",
            error: error.message,
        });
    } finally {
        await closeConnection(connection);
    }
});

app.get("/api/positions", auth, requirePermission("/positions"), async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT POSITION_ID, POSITION_NAME
       FROM POSITIONS
       ORDER BY POSITION_ID`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: "Cannot get positions",
            error: error.message,
        });
    } finally {
        await closeConnection(connection);
    }
});


// MASTER DATA MANAGEMENT

async function nextId(connection, table, column) {
    const allowed = {
        DEPARTMENTS: 'DEPT_ID', POSITIONS: 'POSITION_ID', SCREENS: 'SCREEN_ID',
        STOPS: 'STOP_ID', VEHICLE_TYPES: 'VEHICLE_TYPE_ID'
    };
    if (!allowed[table] || allowed[table] !== column) throw new Error("Invalid master table");
    const result = await connection.execute(`SELECT NVL(MAX(${column}),0)+1 AS NEXT_ID FROM ${table}`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result.rows[0].NEXT_ID;
}

function masterRoutes(table, path, idColumn, nameColumn, permissionPath = path) {
    app.get(path, auth, requirePermission(permissionPath), async (req, res) => {
        let connection;
        try {
            connection = await getConnection();
            const result = await connection.execute(`SELECT ${idColumn}, ${nameColumn} FROM ${table} ORDER BY ${idColumn}`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
            res.json(result.rows);
        } catch (error) { res.status(500).json({ message: "Cannot get data", error: error.message }); }
        finally { await closeConnection(connection); }
    });

    app.post(path, auth, requirePermission(permissionPath), async (req, res) => {
        let connection;
        try {
            const value = req.body.name?.trim();
            if (!value) return res.status(400).json({ message: "กรุณากรอกชื่อ" });
            connection = await getConnection();
            const id = await nextId(connection, table, idColumn);
            await connection.execute(`INSERT INTO ${table} (${idColumn}, ${nameColumn}) VALUES (:id, :value)`, { id, value }, { autoCommit: true });
            res.status(201).json({ message: "เพิ่มข้อมูลสำเร็จ", id });
        } catch (error) { res.status(500).json({ message: "Cannot create data", error: error.message }); }
        finally { await closeConnection(connection); }
    });

    app.put(`${path}/:id`, auth, requirePermission(permissionPath), async (req, res) => {
        let connection;
        try {
            const value = req.body.name?.trim();
            if (!value) return res.status(400).json({ message: "กรุณากรอกชื่อ" });
            connection = await getConnection();
            await connection.execute(`UPDATE ${table} SET ${nameColumn}=:value WHERE ${idColumn}=:id`, { id: req.params.id, value }, { autoCommit: true });
            res.json({ message: "แก้ไขข้อมูลสำเร็จ" });
        } catch (error) { res.status(500).json({ message: "Cannot update data", error: error.message }); }
        finally { await closeConnection(connection); }
    });

    app.delete(`${path}/:id`, auth, requirePermission(permissionPath), async (req, res) => {
        let connection;
        try {
            connection = await getConnection();
            await connection.execute(`DELETE FROM ${table} WHERE ${idColumn}=:id`, { id: req.params.id }, { autoCommit: true });
            res.json({ message: "ลบข้อมูลสำเร็จ" });
        } catch (error) { res.status(500).json({ message: "Cannot delete data", error: error.message }); }
        finally { await closeConnection(connection); }
    });
}

masterRoutes("DEPARTMENTS", "/api/departments", "DEPT_ID", "DEPT_NAME", "/departments");
masterRoutes("POSITIONS", "/api/positions", "POSITION_ID", "POSITION_NAME", "/positions");
masterRoutes("STOPS", "/api/stops", "STOP_ID", "STOP_NAME", "/stops");

// Vehicle Types ต้องรับทั้งชื่อประเภทและจำนวนที่นั่ง
app.get("/api/vehicle-types", auth, requirePermission("/vehicle-types"), async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT VEHICLE_TYPE_ID, TYPE_NAME, SEATS FROM VEHICLE_TYPES ORDER BY VEHICLE_TYPE_ID`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Cannot get vehicle types", error: error.message });
    } finally {
        await closeConnection(connection);
    }
});

app.post("/api/vehicle-types", auth, requirePermission("/vehicle-types"), async (req, res) => {
    let connection;
    try {
        const typeName = req.body.name?.trim();
        const seats = Number(req.body.seats);
        if (!typeName || !seats || seats <= 0) {
            return res.status(400).json({ message: "กรุณากรอกชื่อประเภทและจำนวนที่นั่งให้ถูกต้อง" });
        }
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT NVL(MAX(VEHICLE_TYPE_ID),0)+1 AS NEXT_ID FROM VEHICLE_TYPES`, [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const id = result.rows[0].NEXT_ID;
        await connection.execute(
            `INSERT INTO VEHICLE_TYPES (VEHICLE_TYPE_ID, TYPE_NAME, SEATS) VALUES (:id, :typeName, :seats)`,
            { id, typeName, seats }, { autoCommit: true }
        );
        res.status(201).json({ message: "เพิ่มประเภทรถสำเร็จ", id });
    } catch (error) {
        res.status(500).json({ message: "Cannot create vehicle type", error: error.message });
    } finally {
        await closeConnection(connection);
    }
});

app.put("/api/vehicle-types/:id", auth, requirePermission("/vehicle-types"), async (req, res) => {
    let connection;
    try {
        const typeName = req.body.name?.trim();
        const seats = Number(req.body.seats);
        if (!typeName || !seats || seats <= 0) {
            return res.status(400).json({ message: "กรุณากรอกชื่อประเภทและจำนวนที่นั่งให้ถูกต้อง" });
        }
        connection = await getConnection();
        await connection.execute(
            `UPDATE VEHICLE_TYPES SET TYPE_NAME=:typeName, SEATS=:seats WHERE VEHICLE_TYPE_ID=:id`,
            { id: req.params.id, typeName, seats }, { autoCommit: true }
        );
        res.json({ message: "แก้ไขประเภทรถสำเร็จ" });
    } catch (error) {
        res.status(500).json({ message: "Cannot update vehicle type", error: error.message });
    } finally {
        await closeConnection(connection);
    }
});

app.delete("/api/vehicle-types/:id", auth, requirePermission("/vehicle-types"), async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        await connection.execute(`DELETE FROM VEHICLE_TYPES WHERE VEHICLE_TYPE_ID=:id`, { id: req.params.id }, { autoCommit: true });
        res.json({ message: "ลบประเภทรถสำเร็จ" });
    } catch (error) {
        res.status(500).json({ message: "Cannot delete vehicle type", error: error.message });
    } finally {
        await closeConnection(connection);
    }
});

// Screens มีข้อมูลเพิ่ม 2 ช่อง จึงทำ CRUD แยก
app.get("/api/screens", auth, requirePermission("/screens"), async (req,res)=>{
    let connection; try { connection=await getConnection();
        const r=await connection.execute(`SELECT SCREEN_ID, SCREEN_NAME, SCREEN_PATH FROM SCREENS ORDER BY SCREEN_ID`,[],{outFormat:oracledb.OUT_FORMAT_OBJECT}); res.json(r.rows);
    } catch(e){res.status(500).json({message:"Cannot get screens",error:e.message});} finally{await closeConnection(connection);}
});
app.post("/api/screens", auth, requirePermission("/screens"), async (req,res)=>{
    let connection; try { const {name,path}=req.body; if(!name||!path)return res.status(400).json({message:"กรุณากรอกชื่อและ URL"}); connection=await getConnection(); const id=await nextId(connection,"SCREENS","SCREEN_ID"); await connection.execute(`INSERT INTO SCREENS (SCREEN_ID,SCREEN_NAME,SCREEN_PATH) VALUES (:id,:name,:path)`,{id,name,path},{autoCommit:true}); res.status(201).json({message:"เพิ่มหน้าจอสำเร็จ",id}); } catch(e){res.status(500).json({message:"Cannot create screen",error:e.message});} finally{await closeConnection(connection);}
});
app.put("/api/screens/:id", auth, requirePermission("/screens"), async (req,res)=>{
    let connection; try { const {name,path}=req.body; connection=await getConnection(); await connection.execute(`UPDATE SCREENS SET SCREEN_NAME=:name,SCREEN_PATH=:path WHERE SCREEN_ID=:id`,{id:req.params.id,name,path},{autoCommit:true}); res.json({message:"แก้ไขหน้าจอสำเร็จ"}); } catch(e){res.status(500).json({message:"Cannot update screen",error:e.message});} finally{await closeConnection(connection);}
});
app.delete("/api/screens/:id", auth, requirePermission("/screens"), async (req,res)=>{
    let connection; try { connection=await getConnection(); await connection.execute(`DELETE FROM SCREENS WHERE SCREEN_ID=:id`,{id:req.params.id},{autoCommit:true}); res.json({message:"ลบหน้าจอสำเร็จ"}); } catch(e){res.status(500).json({message:"Cannot delete screen",error:e.message});} finally{await closeConnection(connection);}
});


// EMPLOYEE MANAGEMENT

async function generateEmpId(connection) {
    const buddhistYear = new Date().getFullYear() + 543;
    const yearCode = String(buddhistYear).slice(-2);

    const result = await connection.execute(
        `SELECT MAX(EMP_ID) AS MAXID
     FROM EMPLOYEES
     WHERE EMP_ID LIKE :prefix`,
        { prefix: `EMP${yearCode}%` },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    let runningNumber = 1;

    if (result.rows[0]?.MAXID) {
        const lastNumber = parseInt(
            String(result.rows[0].MAXID).substring(5),
            10
        );

        if (!Number.isNaN(lastNumber)) {
            runningNumber = lastNumber + 1;
        }
    }

    return `EMP${yearCode}${String(runningNumber).padStart(3, "0")}`;
}

app.get(
    "/api/employees",
    auth,
    requirePermission("/employee"),
    async (req, res) => {
        let connection;

        try {
            connection = await getConnection();

            const result = await connection.execute(
                `SELECT
           e.EMP_ID AS EMPID,
           e.EMP_NAME AS EMPNAME,
           e.EMP_SURNAME AS EMPSURNAME,
           e.EMP_EMAIL AS EMPEMAIL,
           e.DEPT_ID,
           d.DEPT_NAME,
           e.POSITION_ID,
           p.POSITION_NAME
         FROM EMPLOYEES e
         LEFT JOIN DEPARTMENTS d ON d.DEPT_ID = e.DEPT_ID
         LEFT JOIN POSITIONS p ON p.POSITION_ID = e.POSITION_ID
         ORDER BY e.EMP_ID`,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({
                message: "Cannot get employees",
                error: error.message,
            });
        } finally {
            await closeConnection(connection);
        }
    }
);

app.post(
    "/api/employees",
    auth,
    requirePermission("/employee"),
    async (req, res) => {
        let connection;

        try {
            const {
                empname,
                empsurname,
                empemail,
                emppassword,
                deptId,
                positionId,
            } = req.body;

            if (
                !empname ||
                !empsurname ||
                !empemail ||
                !emppassword ||
                !deptId ||
                !positionId
            ) {
                return res.status(400).json({
                    message: "กรุณากรอกข้อมูล Employee ให้ครบ",
                });
            }

            connection = await getConnection();

            const empId = await generateEmpId(connection);
            const hashedPassword = await bcrypt.hash(emppassword, 10);

            await connection.execute(
                `INSERT INTO EMPLOYEES
          (EMP_ID, EMP_NAME, EMP_SURNAME, EMP_EMAIL, EMP_PASSWORD,
           DEPT_ID, POSITION_ID)
         VALUES
          (:empId, :empname, :empsurname, :empemail, :emppassword,
           :deptId, :positionId)`,
                {
                    empId,
                    empname,
                    empsurname,
                    empemail,
                    emppassword: hashedPassword,
                    deptId,
                    positionId,
                },
                { autoCommit: true }
            );

            res.status(201).json({
                message: "เพิ่ม Employee สำเร็จ",
                empId,
            });
        } catch (error) {
            console.error("CREATE EMPLOYEE ERROR:", error);
            res.status(500).json({
                message: "Cannot create employee",
                error: error.message,
            });
        } finally {
            await closeConnection(connection);
        }
    }
);

app.put(
    "/api/employees/:id",
    auth,
    requirePermission("/employee"),
    async (req, res) => {
        let connection;

        try {
            const empId = req.params.id;

            const {
                empname,
                empsurname,
                empemail,
                emppassword,
                deptId,
                positionId,
            } = req.body;

            connection = await getConnection();

            if (emppassword && emppassword.trim() !== "") {
                const hashedPassword = await bcrypt.hash(emppassword, 10);

                await connection.execute(
                    `UPDATE EMPLOYEES
           SET EMP_NAME = :empname,
               EMP_SURNAME = :empsurname,
               EMP_EMAIL = :empemail,
               EMP_PASSWORD = :emppassword,
               DEPT_ID = :deptId,
               POSITION_ID = :positionId
           WHERE EMP_ID = :empId`,
                    {
                        empId,
                        empname,
                        empsurname,
                        empemail,
                        emppassword: hashedPassword,
                        deptId,
                        positionId,
                    },
                    { autoCommit: true }
                );
            } else {
                await connection.execute(
                    `UPDATE EMPLOYEES
           SET EMP_NAME = :empname,
               EMP_SURNAME = :empsurname,
               EMP_EMAIL = :empemail,
               DEPT_ID = :deptId,
               POSITION_ID = :positionId
           WHERE EMP_ID = :empId`,
                    {
                        empId,
                        empname,
                        empsurname,
                        empemail,
                        deptId,
                        positionId,
                    },
                    { autoCommit: true }
                );
            }

            res.json({ message: "แก้ไข Employee สำเร็จ" });
        } catch (error) {
            res.status(500).json({
                message: "Cannot update employee",
                error: error.message,
            });
        } finally {
            await closeConnection(connection);
        }
    }
);

app.delete(
    "/api/employees/:id",
    auth,
    requirePermission("/employee"),
    async (req, res) => {
        let connection;

        try {
            connection = await getConnection();

            await connection.execute(
                `DELETE FROM EMPLOYEES WHERE EMP_ID = :empId`,
                { empId: req.params.id },
                { autoCommit: true }
            );

            res.json({ message: "ลบ Employee สำเร็จ" });
        } catch (error) {
            res.status(500).json({
                message: "Cannot delete employee",
                error: error.message,
            });
        } finally {
            await closeConnection(connection);
        }
    }
);

// DYNAMIC PERMISSION MANAGEMENT

app.get(
    "/api/permissions/:positionId",
    auth,
    requirePermission("/permission"),
    async (req, res) => {
        let connection;

        try {
            connection = await getConnection();

            const result = await connection.execute(
                `SELECT
           s.SCREEN_ID,
           s.SCREEN_NAME,
           s.SCREEN_PATH,
           CASE
             WHEN pp.CAN_ACCESS = 'Y' THEN 'Y'
             ELSE 'N'
           END AS CAN_ACCESS
         FROM SCREENS s
         LEFT JOIN POSITION_PERMISSIONS pp
           ON pp.SCREEN_ID = s.SCREEN_ID
          AND pp.POSITION_ID = :positionId
         ORDER BY s.SCREEN_ID`,
                { positionId: req.params.positionId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({
                message: "Cannot get permissions",
                error: error.message,
            });
        } finally {
            await closeConnection(connection);
        }
    }
);

app.put(
    "/api/permissions",
    auth,
    requirePermission("/permission"),
    async (req, res) => {
        let connection;

        try {
            const { positionId, permissions } = req.body;

            if (!positionId || !Array.isArray(permissions)) {
                return res.status(400).json({
                    message: "ข้อมูลสิทธิ์ไม่ถูกต้อง",
                });
            }

            connection = await getConnection();

            for (const item of permissions) {
                await connection.execute(
                    `MERGE INTO POSITION_PERMISSIONS pp
           USING (
             SELECT :positionId AS POSITION_ID,
                    :screenId AS SCREEN_ID,
                    :canAccess AS CAN_ACCESS
             FROM dual
           ) src
           ON (
             pp.POSITION_ID = src.POSITION_ID
             AND pp.SCREEN_ID = src.SCREEN_ID
           )
           WHEN MATCHED THEN
             UPDATE SET pp.CAN_ACCESS = src.CAN_ACCESS
           WHEN NOT MATCHED THEN
             INSERT (POSITION_ID, SCREEN_ID, CAN_ACCESS)
             VALUES (src.POSITION_ID, src.SCREEN_ID, src.CAN_ACCESS)`,
                    {
                        positionId,
                        screenId: item.screenId,
                        canAccess: item.canAccess ? "Y" : "N",
                    }
                );
            }

            await connection.commit();

            res.json({ message: "บันทึกสิทธิ์สำเร็จ" });
        } catch (error) {
            if (connection) await connection.rollback();

            res.status(500).json({
                message: "Cannot update permissions",
                error: error.message,
            });
        } finally {
            await closeConnection(connection);
        }
    }
);

// DRIVERS

app.get(
    "/api/drivers",
    auth,
    requirePermission("/schedules"),
    async (req, res) => {
        let connection;

        try {
            connection = await getConnection();

            const result = await connection.execute(
                `SELECT
           e.EMP_ID AS EMPID,
           e.EMP_NAME AS EMPNAME,
           e.EMP_SURNAME AS EMPSURNAME
         FROM EMPLOYEES e
         JOIN POSITIONS p ON p.POSITION_ID = e.POSITION_ID
         WHERE p.POSITION_NAME = 'Driver'
         ORDER BY e.EMP_ID`,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({
                message: "Cannot get drivers",
                error: error.message,
            });
        } finally {
            await closeConnection(connection);
        }
    }
);

// STOPS

app.get("/api/stops", auth, async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT STOP_ID, STOP_NAME
       FROM STOPS
       ORDER BY STOP_ID`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            message: "Cannot get stops",
            error: error.message,
        });
    } finally {
        await closeConnection(connection);
    }
});

// ROUTES

app.get(
    "/api/routes",
    auth,
    requirePermission("/routes"),
    async (req, res) => {
        let connection;

        try {
            connection = await getConnection();

            const routeResult = await connection.execute(
                `SELECT ROUTE_ID, ROUTE_NAME
         FROM ROUTES
         ORDER BY ROUTE_ID`,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            const routes = [];

            for (const route of routeResult.rows) {
                const stopResult = await connection.execute(
                    `SELECT
             rs.STOP_ORDER,
             rs.STOP_ID,
             s.STOP_NAME,
             rs.MINUTES_FROM_PREVIOUS
           FROM ROUTE_STOPS rs
           JOIN STOPS s ON s.STOP_ID = rs.STOP_ID
           WHERE rs.ROUTE_ID = :routeId
           ORDER BY rs.STOP_ORDER`,
                    { routeId: route.ROUTE_ID },
                    { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );

                const totalMinutes = stopResult.rows.reduce(
                    (sum, row) => sum + Number(row.MINUTES_FROM_PREVIOUS || 0),
                    0
                );

                routes.push({
                    routeId: route.ROUTE_ID,
                    routeName: route.ROUTE_NAME,
                    totalMinutes,
                    stops: stopResult.rows,
                });
            }

            res.json(routes);
        } catch (error) {
            res.status(500).json({
                message: "Cannot get routes",
                error: error.message,
            });
        } finally {
            await closeConnection(connection);
        }
    }
);

app.post("/api/routes", auth, requirePermission("/routes"), async (req, res) => {
    let connection;
    try {
        const { routeName, stops } = req.body;

        if (!routeName || !Array.isArray(stops) || stops.length < 2) {
            return res.status(400).json({ message: "Route ต้องมีชื่อและอย่างน้อย 2 จุด" });
        }

        connection = await getConnection();

        // 1. หา ROUTE_ID ถัดไป
        const idResult = await connection.execute(
            `SELECT NVL(MAX(ROUTE_ID), 0) + 1 AS NEXT_ID FROM ROUTES`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const routeId = idResult.rows[0].NEXT_ID;

        // 2. Insert ลงตาราง ROUTES
        await connection.execute(
            `INSERT INTO ROUTES (ROUTE_ID, ROUTE_NAME) VALUES (:routeId, :routeName)`,
            { routeId, routeName }
        );

        // 3. Insert ลงตาราง ROUTE_STOPS
        for (let i = 0; i < stops.length; i++) {
            await connection.execute(
                `INSERT INTO ROUTE_STOPS
          (ROUTE_ID, STOP_ORDER, STOP_ID, MINUTES_FROM_PREVIOUS)
         VALUES
          (:routeId, :stopOrder, :stopId, :minutes)`,
                {
                    routeId,
                    stopOrder: i + 1,
                    stopId: Number(stops[i].stopId),
                    minutes: i === 0 ? 0 : Number(stops[i].minutes || 0),
                }
            );
        }

        await connection.commit();
        res.status(201).json({ message: "เพิ่ม Route สำเร็จ", routeId });
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ message: "Cannot create route", error: error.message });
    } finally {
        await closeConnection(connection);
    }
});

app.delete(
    "/api/routes/:id",
    auth,
    requirePermission("/routes"),
    async (req, res) => {
        let connection;

        try {
            connection = await getConnection();

            await connection.execute(
                `DELETE FROM ROUTES WHERE ROUTE_ID = :routeId`,
                { routeId: req.params.id },
                { autoCommit: true }
            );

            res.json({ message: "ลบ Route สำเร็จ" });
        } catch (error) {
            res.status(500).json({
                message: "Cannot delete route",
                error: error.message,
            });
        } finally {
            await closeConnection(connection);
        }
    }
);

// VEHICLES

app.get("/api/vehicles", auth, requirePermission("/vehicles"), async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT v.VEHICLE_ID, v.LICENSE_PLATE, v.STATUS,
                    v.VEHICLE_TYPE_ID, vt.TYPE_NAME, vt.SEATS
             FROM VEHICLES v
             JOIN VEHICLE_TYPES vt ON vt.VEHICLE_TYPE_ID = v.VEHICLE_TYPE_ID
             ORDER BY v.VEHICLE_ID`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Cannot get vehicles", error: error.message });
    } finally {
        await closeConnection(connection);
    }
});

app.post("/api/vehicles", auth, requirePermission("/vehicles"), async (req, res) => {
    let connection;
    try {
        const { licensePlate, status, vehicleTypeId } = req.body;
        if (!licensePlate || !status || !vehicleTypeId) {
            return res.status(400).json({ message: "กรุณากรอกข้อมูลรถให้ครบ" });
        }
        connection = await getConnection();
        const idResult = await connection.execute(
            `SELECT NVL(MAX(VEHICLE_ID), 0) + 1 AS NEXT_ID FROM VEHICLES`, [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const vehicleId = idResult.rows[0].NEXT_ID;
        await connection.execute(
            `INSERT INTO VEHICLES (VEHICLE_ID, LICENSE_PLATE, STATUS, VEHICLE_TYPE_ID)
             VALUES (:vehicleId, :licensePlate, :status, :vehicleTypeId)`,
            { vehicleId, licensePlate, status, vehicleTypeId }, { autoCommit: true }
        );
        res.status(201).json({ message: "เพิ่มรถสำเร็จ", vehicleId });
    } catch (error) {
        res.status(500).json({ message: "Cannot create vehicle", error: error.message });
    } finally { await closeConnection(connection); }
});

app.put("/api/vehicles/:id", auth, requirePermission("/vehicles"), async (req, res) => {
    let connection;
    try {
        const { licensePlate, status, vehicleTypeId } = req.body;
        connection = await getConnection();
        await connection.execute(
            `UPDATE VEHICLES SET LICENSE_PLATE=:licensePlate, STATUS=:status,
             VEHICLE_TYPE_ID=:vehicleTypeId WHERE VEHICLE_ID=:vehicleId`,
            { licensePlate, status, vehicleTypeId, vehicleId: req.params.id }, { autoCommit: true }
        );
        res.json({ message: "แก้ไขรถสำเร็จ" });
    } catch (error) {
        res.status(500).json({ message: "Cannot update vehicle", error: error.message });
    } finally { await closeConnection(connection); }
});

app.delete("/api/vehicles/:id", auth, requirePermission("/vehicles"), async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        await connection.execute(`DELETE FROM VEHICLES WHERE VEHICLE_ID=:vehicleId`, { vehicleId: req.params.id }, { autoCommit: true });
        res.json({ message: "ลบรถสำเร็จ" });
    } catch (error) {
        res.status(500).json({ message: "Cannot delete vehicle", error: error.message });
    } finally { await closeConnection(connection); }
});

// SCHEDULES
app.get(
    "/api/schedules",
    auth,
    requirePermission("/schedules"),
    async (req, res) => {
        let connection;

        try {
            connection = await getConnection();

            const result = await connection.execute(
                `SELECT
           s.SCHEDULE_ID,
           s.ROUTE_ID,
           r.ROUTE_NAME,
           s.SCHEDULE_TIME,
           s.EMP_ID,
           e.EMP_NAME AS EMPNAME,
           e.EMP_SURNAME AS EMPSURNAME,
           s.VEHICLE_ID,
           v.LICENSE_PLATE,
           vt.TYPE_NAME AS VEHICLE_TYPE
         FROM SCHEDULES s
         JOIN ROUTES r ON r.ROUTE_ID = s.ROUTE_ID
         JOIN EMPLOYEES e ON e.EMP_ID = s.EMP_ID
         JOIN VEHICLES v ON v.VEHICLE_ID = s.VEHICLE_ID
         JOIN VEHICLE_TYPES vt ON vt.VEHICLE_TYPE_ID = v.VEHICLE_TYPE_ID
         ORDER BY s.SCHEDULE_TIME, s.SCHEDULE_ID`,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({
                message: "Cannot get schedules",
                error: error.message,
            });
        } finally {
            await closeConnection(connection);
        }
    }
);

async function ensureDriver(connection, empId) {
    const result = await connection.execute(
        `SELECT COUNT(*) AS CNT
     FROM EMPLOYEES e
     JOIN POSITIONS p ON p.POSITION_ID = e.POSITION_ID
     WHERE e.EMP_ID = :empId
       AND p.POSITION_NAME = 'Driver'`,
        { empId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows[0].CNT > 0;
}

async function checkScheduleConflict(
    connection,
    { empId, vehicleId, scheduleTime, scheduleId = null }
) {
    const driverResult = await connection.execute(
        `SELECT COUNT(*) AS CNT
     FROM SCHEDULES
     WHERE EMP_ID = :empId
       AND SCHEDULE_TIME = :scheduleTime
       AND (:scheduleId IS NULL OR SCHEDULE_ID <> :scheduleId)`,
        { empId, scheduleTime, scheduleId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (driverResult.rows[0].CNT > 0) {
        return "คนขับคนนี้มีตารางในเวลาเดียวกันแล้ว";
    }

    const vehicleResult = await connection.execute(
        `SELECT COUNT(*) AS CNT
     FROM SCHEDULES
     WHERE VEHICLE_ID = :vehicleId
       AND SCHEDULE_TIME = :scheduleTime
       AND (:scheduleId IS NULL OR SCHEDULE_ID <> :scheduleId)`,
        { vehicleId, scheduleTime, scheduleId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (vehicleResult.rows[0].CNT > 0) {
        return "รถคันนี้มีตารางในเวลาเดียวกันแล้ว";
    }

    return null;
}

app.post("/api/schedules", auth, requirePermission("/schedules"), async (req, res) => {
    let connection;
    try {
        const { routeId, scheduleTime, empId, vehicleId } = req.body;

        connection = await getConnection();

        // รัน SCHEDULE_ID ถัดไป
        const idResult = await connection.execute(
            `SELECT NVL(MAX(SCHEDULE_ID), 0) + 1 AS NEXT_ID FROM SCHEDULES`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const scheduleId = idResult.rows[0].NEXT_ID;

        await connection.execute(
            `INSERT INTO SCHEDULES (SCHEDULE_ID, ROUTE_ID, SCHEDULE_TIME, EMP_ID, VEHICLE_ID)
       VALUES (:scheduleId, :routeId, :scheduleTime, :empId, :vehicleId)`,
            {
                scheduleId,
                routeId: Number(routeId),
                scheduleTime,
                empId, // VARCHAR2 เช่น 'EMP69002'
                vehicleId: Number(vehicleId),
            },
            { autoCommit: true }
        );

        res.status(201).json({ message: "เพิ่มตารางเดินรถสำเร็จ", scheduleId });
    } catch (error) {
        res.status(500).json({ message: "Cannot create schedule", error: error.message });
    } finally {
        await closeConnection(connection);
    }
});

app.put(
    "/api/schedules/:id",
    auth,
    requirePermission("/schedules"),
    async (req, res) => {
        let connection;

        try {
            const scheduleId = req.params.id;
            const { routeId, scheduleTime, empId, vehicleId } = req.body;

            connection = await getConnection();

            if (!(await ensureDriver(connection, empId))) {
                return res.status(400).json({
                    message: "พนักงานที่เลือกไม่ใช่คนขับรถ (Position ต้องเป็น Driver)",
                });
            }

            const conflict = await checkScheduleConflict(connection, {
                empId,
                vehicleId,
                scheduleTime,
                scheduleId,
            });

            if (conflict) {
                return res.status(409).json({ message: conflict });
            }

            await connection.execute(
                `UPDATE SCHEDULES
         SET ROUTE_ID = :routeId,
             SCHEDULE_TIME = :scheduleTime,
             EMP_ID = :empId,
             VEHICLE_ID = :vehicleId
         WHERE SCHEDULE_ID = :scheduleId`,
                {
                    routeId,
                    scheduleTime,
                    empId,
                    vehicleId,
                    scheduleId,
                },
                { autoCommit: true }
            );

            res.json({ message: "แก้ไขตารางเดินรถสำเร็จ" });
        } catch (error) {
            res.status(500).json({
                message: "Cannot update schedule",
                error: error.message,
            });
        } finally {
            await closeConnection(connection);
        }
    }
);

app.delete(
    "/api/schedules/:id",
    auth,
    requirePermission("/schedules"),
    async (req, res) => {
        let connection;

        try {
            connection = await getConnection();

            await connection.execute(
                `DELETE FROM SCHEDULES WHERE SCHEDULE_ID = :scheduleId`,
                { scheduleId: req.params.id },
                { autoCommit: true }
            );

            res.json({ message: "ลบตารางเดินรถสำเร็จ" });
        } catch (error) {
            res.status(500).json({
                message: "Cannot delete schedule",
                error: error.message,
            });
        } finally {
            await closeConnection(connection);
        }
    }
);

//DASHBOARD

app.get(
    "/api/dashboard",
    auth,
    requirePermission("/dashboard"),
    async (req, res) => {
        let connection;

        try {
            const { from, to } = req.query;

            if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
                return res.status(400).json({
                    message: "กรุณาระบุช่วงวันที่ในรูปแบบ YYYY-MM-DD",
                });
            }

            connection = await getConnection();
            const binds = { fromDate: from, toDate: to };
            const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };

            const usersResult = await connection.execute(
                `SELECT
                   u.FULL_NAME AS NAME,
                   COUNT(*) AS TOTAL,
                   SUM(CASE WHEN b.STATUS = 'checked_in' THEN 1 ELSE 0 END) AS CHECKED_IN,
                   SUM(CASE WHEN b.STATUS = 'cancelled' THEN 1 ELSE 0 END) AS CANCELLED,
                   SUM(CASE WHEN b.STATUS = 'no_show' THEN 1 ELSE 0 END) AS NO_SHOW
                 FROM DASH_BOOKINGS b
                 JOIN DASH_USERS u ON u.USER_ID = b.USER_ID
                 JOIN DASH_TRIPS t ON t.TRIP_ID = b.TRIP_ID
                 WHERE t.TRIP_DATE >= TO_DATE(:fromDate, 'YYYY-MM-DD')
                   AND t.TRIP_DATE < TO_DATE(:toDate, 'YYYY-MM-DD') + 1
                 GROUP BY u.USER_ID, u.FULL_NAME
                 ORDER BY COUNT(*) DESC, u.FULL_NAME`,
                binds,
                options
            );

            const driversResult = await connection.execute(
                `SELECT
                   d.FULL_NAME AS NAME,
                   COUNT(*) AS TOTAL,
                   SUM(CASE WHEN t.DEPART_TIME < '17:00' THEN 1 ELSE 0 END) AS BEFORE,
                   SUM(CASE WHEN t.DEPART_TIME >= '17:00' THEN 1 ELSE 0 END) AS AFTER
                 FROM DASH_TRIPS t
                 JOIN DASH_DRIVERS d ON d.DRIVER_ID = t.DRIVER_ID
                 WHERE t.TRIP_DATE >= TO_DATE(:fromDate, 'YYYY-MM-DD')
                   AND t.TRIP_DATE < TO_DATE(:toDate, 'YYYY-MM-DD') + 1
                 GROUP BY d.DRIVER_ID, d.FULL_NAME
                 ORDER BY COUNT(*) DESC, d.FULL_NAME`,
                binds,
                options
            );

            const vehiclesResult = await connection.execute(
                `SELECT
                   v.VEHICLE_ID AS ID,
                   v.PLATE_NO AS PLATE,
                   v.VEHICLE_TYPE AS TYPE,
                   v.SEAT_CAPACITY AS SEATS,
                   COUNT(t.TRIP_ID) AS COUNT
                 FROM DASH_TRIPS t
                 JOIN DASH_VEHICLES v ON v.VEHICLE_ID = t.VEHICLE_ID
                 WHERE t.TRIP_DATE >= TO_DATE(:fromDate, 'YYYY-MM-DD')
                   AND t.TRIP_DATE < TO_DATE(:toDate, 'YYYY-MM-DD') + 1
                 GROUP BY v.VEHICLE_ID, v.PLATE_NO, v.VEHICLE_TYPE, v.SEAT_CAPACITY
                 ORDER BY COUNT(t.TRIP_ID) DESC, v.PLATE_NO`,
                binds,
                options
            );

            res.json({
                users: usersResult.rows.map((r) => ({
                    name: r.NAME,
                    total: Number(r.TOTAL || 0),
                    checkedIn: Number(r.CHECKED_IN || 0),
                    cancelled: Number(r.CANCELLED || 0),
                    noShow: Number(r.NO_SHOW || 0),
                })),
                drivers: driversResult.rows.map((r) => ({
                    name: r.NAME,
                    total: Number(r.TOTAL || 0),
                    before: Number(r.BEFORE || 0),
                    after: Number(r.AFTER || 0),
                })),
                vehicles: vehiclesResult.rows.map((r) => ({
                    id: Number(r.ID),
                    plate: r.PLATE,
                    type: r.TYPE,
                    seats: Number(r.SEATS || 0),
                    count: Number(r.COUNT || 0),
                })),
            });
        } catch (error) {
            console.error("GET /api/dashboard error:", error);
            res.status(500).json({
                message: "Cannot get dashboard",
                error: error.message,
            });
        } finally {
            await closeConnection(connection);
        }
    }
);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});