MiniProject - Shuttle Bus Management

เพิ่ม Dashboard ระบบรถรับส่ง
- Route: /dashboard
- รายงาน 3: พฤติกรรมผู้ใช้
- รายงาน 6: การมอบหมายงานคนขับ
- รายงาน 7: จำนวนรอบตามรถ/ประเภทรถ
- Dashboard ดึงข้อมูลจาก Oracle tables DASH_USERS, DASH_DRIVERS, DASH_VEHICLES, DASH_TRIPS, DASH_BOOKINGS
- สิทธิ์ Dashboard ใช้ /dashboard ใน SCREENS + POSITION_PERMISSIONS

ติดตั้ง:
1. client: npm install
2. server: npm install
3. ถ้าฐานข้อมูลเดิมมี DASH_* แล้ว ให้รัน database_dashboard_patch.sql ใน SQL Developer
4. npm run dev (client)
5. npm start (server)

หมายเหตุ: Dashboard ใช้ข้อมูลใน DASH_* ตาม SQL Dashboard ที่ผู้ใช้รันไว้ หากต้องการให้ Dashboard คำนวณจากตารางระบบหลัก เช่น SCHEDULES/EMPLOYEES/VEHICLES โดยตรง ต้องเปลี่ยน query ของ /api/dashboard
