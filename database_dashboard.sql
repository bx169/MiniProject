-- เพิ่ม table สำหรับทำ dashboard 

create table dash_users (
  user_id   number(10) primary key,
  full_name varchar2(100 char) not null
);
 
create table dash_drivers (
  driver_id number(10) primary key,
  full_name varchar2(100 char) not null
);
 
create table dash_vehicles (
  vehicle_id    number(10) primary key,
  plate_no      varchar2(20 char) not null unique,
  vehicle_type  varchar2(50 char) not null,
  seat_capacity number(3) not null
);
 
create table dash_trips (
  trip_id     number(10) primary key,
  trip_date   date not null,
  depart_time varchar2(5) not null,   -- รูปแบบ 'hh24:mi' เช่น '17:30'
  driver_id   number(10) not null references dash_drivers(driver_id),
  vehicle_id  number(10) not null references dash_vehicles(vehicle_id)
);
 
create table dash_bookings (
  booking_id number(10) primary key,
  user_id    number(10) not null references dash_users(user_id),
  trip_id    number(10) not null references dash_trips(trip_id),
  status     varchar2(20) not null
             constraint chk_dash_booking_status check (status in ('checked_in','cancelled','no_show'))
);
 
-- ผู้ใช้ 8 คน
insert into dash_users (user_id, full_name) values (1, 'สมชาย ใจดี');
insert into dash_users (user_id, full_name) values (2, 'สมหมาย ใจรัก');
insert into dash_users (user_id, full_name) values (3, 'สมควร ใจงาม');
insert into dash_users (user_id, full_name) values (4, 'อารีรัตน์ ศรีสุข');
insert into dash_users (user_id, full_name) values (5, 'วรพล เทพทอง');
insert into dash_users (user_id, full_name) values (6, 'นันทนา ใจตรง');
insert into dash_users (user_id, full_name) values (7, 'ปิยะ มั่นคง');
insert into dash_users (user_id, full_name) values (8, 'กมลา สุขสันต์');
 
-- คนขับ 7 คน
insert into dash_drivers (driver_id, full_name) values (1, 'สมชาย ใจดี');
insert into dash_drivers (driver_id, full_name) values (2, 'สมหมาย ใจรัก');
insert into dash_drivers (driver_id, full_name) values (3, 'สมควร ใจงาม');
insert into dash_drivers (driver_id, full_name) values (4, 'อารีรัตน์ ศรีสุข');
insert into dash_drivers (driver_id, full_name) values (5, 'วรพล เทพทอง');
insert into dash_drivers (driver_id, full_name) values (6, 'นันทนา ใจตรง');
insert into dash_drivers (driver_id, full_name) values (7, 'ปิยะ มั่นคง');
 
-- รถ 7 คัน
insert into dash_vehicles (vehicle_id, plate_no, vehicle_type, seat_capacity) values (1, 'สย 2591', 'รถตู้', 9);
insert into dash_vehicles (vehicle_id, plate_no, vehicle_type, seat_capacity) values (2, 'สย 2599', 'รถตู้', 9);
insert into dash_vehicles (vehicle_id, plate_no, vehicle_type, seat_capacity) values (3, 'ชย 7788', 'รถตู้', 9);
insert into dash_vehicles (vehicle_id, plate_no, vehicle_type, seat_capacity) values (4, 'บก 1130', 'รถบัส', 20);
insert into dash_vehicles (vehicle_id, plate_no, vehicle_type, seat_capacity) values (5, 'กข 4455', 'รถบัส', 20);
insert into dash_vehicles (vehicle_id, plate_no, vehicle_type, seat_capacity) values (6, 'นน 5566', 'รถมินิบัส', 15);
insert into dash_vehicles (vehicle_id, plate_no, vehicle_type, seat_capacity) values (7, 'นม 8899', 'รถมินิบัส', 15);
 
-- 120 รอบเดินรถ (1-30 เม.ย. 2568): ก่อน 17:00 = 84 รอบ, หลัง 17:00 = 36 รอบ
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (1, date '2025-04-01', '15:00', 3, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (2, date '2025-04-02', '15:00', 2, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (3, date '2025-04-03', '07:30', 1, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (4, date '2025-04-03', '12:00', 4, 3);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (5, date '2025-04-03', '15:00', 1, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (6, date '2025-04-03', '17:30', 5, 7);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (7, date '2025-04-03', '19:00', 2, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (8, date '2025-04-04', '09:30', 3, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (9, date '2025-04-04', '12:00', 2, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (10, date '2025-04-04', '15:00', 6, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (11, date '2025-04-04', '19:00', 5, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (12, date '2025-04-05', '07:30', 5, 7);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (13, date '2025-04-05', '09:30', 4, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (14, date '2025-04-05', '15:00', 5, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (15, date '2025-04-05', '17:30', 4, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (16, date '2025-04-06', '07:30', 1, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (17, date '2025-04-06', '09:30', 4, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (18, date '2025-04-06', '12:00', 4, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (19, date '2025-04-06', '15:00', 5, 6);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (20, date '2025-04-06', '19:00', 2, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (21, date '2025-04-07', '09:30', 1, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (22, date '2025-04-07', '12:00', 2, 3);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (23, date '2025-04-07', '15:00', 2, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (24, date '2025-04-07', '19:00', 3, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (25, date '2025-04-08', '09:30', 1, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (26, date '2025-04-08', '12:00', 7, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (27, date '2025-04-08', '15:00', 6, 6);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (28, date '2025-04-08', '17:30', 2, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (29, date '2025-04-08', '19:00', 1, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (30, date '2025-04-09', '07:30', 4, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (31, date '2025-04-09', '15:00', 2, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (32, date '2025-04-10', '07:30', 1, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (33, date '2025-04-10', '09:30', 2, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (34, date '2025-04-10', '12:00', 2, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (35, date '2025-04-10', '15:00', 2, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (36, date '2025-04-10', '17:30', 1, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (37, date '2025-04-10', '19:00', 1, 7);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (38, date '2025-04-11', '07:30', 1, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (39, date '2025-04-11', '09:30', 4, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (40, date '2025-04-11', '15:00', 3, 7);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (41, date '2025-04-11', '17:30', 3, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (42, date '2025-04-12', '07:30', 3, 6);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (43, date '2025-04-12', '09:30', 1, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (44, date '2025-04-12', '15:00', 1, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (45, date '2025-04-12', '19:00', 1, 6);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (46, date '2025-04-13', '07:30', 3, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (47, date '2025-04-13', '09:30', 1, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (48, date '2025-04-13', '12:00', 3, 6);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (49, date '2025-04-13', '15:00', 2, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (50, date '2025-04-13', '17:30', 7, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (51, date '2025-04-13', '19:00', 3, 7);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (52, date '2025-04-14', '07:30', 1, 3);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (53, date '2025-04-14', '09:30', 3, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (54, date '2025-04-14', '12:00', 2, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (55, date '2025-04-14', '15:00', 1, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (56, date '2025-04-14', '17:30', 4, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (57, date '2025-04-14', '19:00', 3, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (58, date '2025-04-15', '07:30', 4, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (59, date '2025-04-15', '09:30', 6, 7);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (60, date '2025-04-15', '12:00', 5, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (61, date '2025-04-15', '15:00', 2, 3);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (62, date '2025-04-15', '17:30', 6, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (63, date '2025-04-15', '19:00', 1, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (64, date '2025-04-16', '07:30', 1, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (65, date '2025-04-16', '09:30', 3, 3);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (66, date '2025-04-16', '12:00', 2, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (67, date '2025-04-16', '15:00', 5, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (68, date '2025-04-16', '17:30', 4, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (69, date '2025-04-17', '09:30', 5, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (70, date '2025-04-17', '12:00', 4, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (71, date '2025-04-17', '15:00', 4, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (72, date '2025-04-17', '17:30', 5, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (73, date '2025-04-17', '19:00', 2, 3);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (74, date '2025-04-18', '07:30', 4, 6);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (75, date '2025-04-18', '09:30', 1, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (76, date '2025-04-18', '17:30', 1, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (77, date '2025-04-18', '19:00', 3, 3);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (78, date '2025-04-19', '07:30', 1, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (79, date '2025-04-19', '09:30', 3, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (80, date '2025-04-19', '12:00', 3, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (81, date '2025-04-19', '15:00', 1, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (82, date '2025-04-19', '17:30', 4, 3);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (83, date '2025-04-20', '07:30', 1, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (84, date '2025-04-20', '09:30', 2, 6);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (85, date '2025-04-20', '12:00', 1, 6);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (86, date '2025-04-20', '15:00', 5, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (87, date '2025-04-20', '17:30', 6, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (88, date '2025-04-20', '19:00', 6, 6);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (89, date '2025-04-21', '12:00', 1, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (90, date '2025-04-21', '17:30', 7, 6);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (91, date '2025-04-22', '07:30', 5, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (92, date '2025-04-22', '12:00', 3, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (93, date '2025-04-22', '15:00', 5, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (94, date '2025-04-22', '19:00', 1, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (95, date '2025-04-23', '12:00', 2, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (96, date '2025-04-23', '15:00', 6, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (97, date '2025-04-23', '17:30', 2, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (98, date '2025-04-24', '07:30', 3, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (99, date '2025-04-24', '09:30', 2, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (100, date '2025-04-24', '12:00', 3, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (101, date '2025-04-24', '15:00', 7, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (102, date '2025-04-24', '17:30', 4, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (103, date '2025-04-25', '07:30', 7, 6);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (104, date '2025-04-25', '17:30', 2, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (105, date '2025-04-25', '19:00', 5, 3);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (106, date '2025-04-26', '07:30', 4, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (107, date '2025-04-26', '12:00', 2, 7);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (108, date '2025-04-26', '17:30', 3, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (109, date '2025-04-27', '07:30', 6, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (110, date '2025-04-27', '09:30', 2, 3);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (111, date '2025-04-27', '12:00', 6, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (112, date '2025-04-27', '19:00', 5, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (113, date '2025-04-28', '07:30', 7, 5);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (114, date '2025-04-28', '09:30', 5, 6);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (115, date '2025-04-28', '17:30', 2, 2);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (116, date '2025-04-29', '09:30', 3, 1);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (117, date '2025-04-29', '15:00', 1, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (118, date '2025-04-30', '09:30', 6, 4);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (119, date '2025-04-30', '12:00', 4, 7);
insert into dash_trips (trip_id, trip_date, depart_time, driver_id, vehicle_id) values (120, date '2025-04-30', '17:30', 1, 4);
 
-- 61 การจอง ในช่วง 12-15 เม.ย. 2568
insert into dash_bookings (booking_id, user_id, trip_id, status) values (1, 2, 42, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (2, 2, 42, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (3, 3, 42, 'no_show');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (4, 4, 42, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (5, 3, 43, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (6, 6, 43, 'no_show');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (7, 2, 44, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (8, 2, 44, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (9, 2, 44, 'no_show');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (10, 3, 44, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (11, 8, 44, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (12, 1, 45, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (13, 4, 45, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (14, 3, 46, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (15, 4, 46, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (16, 6, 46, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (17, 7, 46, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (18, 1, 47, 'cancelled');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (19, 5, 47, 'cancelled');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (20, 5, 47, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (21, 6, 47, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (22, 8, 47, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (23, 6, 48, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (24, 7, 48, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (25, 3, 49, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (26, 1, 50, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (27, 2, 51, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (28, 7, 51, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (29, 1, 52, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (30, 3, 53, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (31, 5, 53, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (32, 8, 53, 'no_show');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (33, 2, 54, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (34, 4, 54, 'cancelled');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (35, 6, 54, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (36, 6, 54, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (37, 2, 55, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (38, 6, 55, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (39, 3, 56, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (40, 4, 56, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (41, 7, 56, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (42, 1, 57, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (43, 5, 57, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (44, 1, 58, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (45, 3, 58, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (46, 7, 58, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (47, 6, 59, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (48, 1, 60, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (49, 5, 60, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (50, 1, 61, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (51, 1, 61, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (52, 6, 61, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (53, 7, 61, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (54, 1, 62, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (55, 1, 62, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (56, 2, 62, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (57, 4, 62, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (58, 7, 62, 'cancelled');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (59, 8, 62, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (60, 1, 63, 'checked_in');
insert into dash_bookings (booking_id, user_id, trip_id, status) values (61, 2, 63, 'checked_in');
 
commit;
 

-- การquery ข้อมูลเพื่อสร้าง dashboard

-- รายงานที่ 3: พฤติกรรมผู้ใช้ 12-15 เม.ย. 2568
select u.full_name as "ผู้ใช้",
       count(*) as "การจองทั้งหมด",
       count(case when b.status = 'checked_in' then 1 end) as "ขึ้นรถจริง",
       count(case when b.status = 'cancelled'  then 1 end) as "ยกเลิก",
       count(case when b.status = 'no_show'    then 1 end) as "no show"
from dash_bookings b
join dash_users u on u.user_id = b.user_id
join dash_trips t on t.trip_id = b.trip_id
where t.trip_date between date '2025-04-12' and date '2025-04-15'
group by u.user_id, u.full_name
order by count(*) desc;
 
-- รายงานที่ 6: การมอบหมายงานคนขับ 1-30 เม.ย. 2568
select d.full_name as "คนขับ",
       count(*) as "รวมรอบทั้งหมด",
       count(case when t.depart_time <  '17:00' then 1 end) as "ก่อน 17:00",
       count(case when t.depart_time >= '17:00' then 1 end) as "หลัง 17:00"
from dash_trips t
join dash_drivers d on d.driver_id = t.driver_id
where t.trip_date between date '2025-04-01' and date '2025-04-30'
group by d.driver_id, d.full_name
order by count(*) desc;
 
-- รายงานที่ 7: การมอบหมายงานตามประเภทรถ 1-30 เม.ย. 2568
-- 7.1 รายคัน
select v.vehicle_type as "ประเภท", v.plate_no as "ทะเบียน", v.seat_capacity as "ที่นั่ง", count(*) as "จำนวนรอบ"
from dash_trips t
join dash_vehicles v on v.vehicle_id = t.vehicle_id
where t.trip_date between date '2025-04-01' and date '2025-04-30'
group by v.vehicle_id, v.vehicle_type, v.plate_no, v.seat_capacity
order by v.vehicle_type, count(*) desc;
 
-- 7.2 สรุปรายประเภท
select v.vehicle_type as "ประเภท", v.seat_capacity as "ที่นั่ง", count(*) as "รวมรอบ"
from dash_trips t
join dash_vehicles v on v.vehicle_id = t.vehicle_id
where t.trip_date between date '2025-04-01' and date '2025-04-30'
group by v.vehicle_type, v.seat_capacity;