-- ระบบจองรถรับส่ง (oracle)

drop table departments cascade constraints;
create table departments (
  dept_id number primary key,
  dept_name varchar2(100) not null
);

drop table positions cascade constraints;
create table positions (
  position_id number primary key,
  position_name varchar2(100) not null
);

drop table employees cascade constraints;
create table employees (
  emp_id varchar2(20) primary key,
  emp_name varchar2(100) not null,
  emp_surname varchar2(100) not null,
  emp_email varchar2(100) not null,
  emp_password varchar2(255) not null,
  dept_id number not null,
  position_id number not null,
  constraint fk_emp_dept foreign key (dept_id) references departments(dept_id),
  constraint fk_emp_position foreign key (position_id) references positions(position_id)
);

drop table screens cascade constraints;
create table screens (
  screen_id number primary key,
  screen_name varchar2(100) not null,
  screen_path varchar2(100) not null
);

drop table position_permissions cascade constraints;
create table position_permissions (
  position_id number not null,
  screen_id number not null,
  can_access char(1) default 'n' not null check (can_access in ('y','n')),
  primary key (position_id, screen_id),
  foreign key (position_id) references positions(position_id) on delete cascade,
  foreign key (screen_id) references screens(screen_id) on delete cascade
);

drop table stops cascade constraints;
create table stops (
  stop_id number primary key,
  stop_name varchar2(100) not null
);

drop table routes cascade constraints;
create table routes (
  route_id number primary key,
  route_name varchar2(100) not null
);

drop table route_stops cascade constraints;
create table route_stops (
  route_id number not null,
  stop_order number not null,
  stop_id number not null,
  minutes_from_previous number default 0 not null,
  primary key (route_id, stop_order),
  foreign key (route_id) references routes(route_id) on delete cascade,
  foreign key (stop_id) references stops(stop_id)
);

drop table vehicle_types cascade constraints;
create table vehicle_types (
  vehicle_type_id number primary key,
  type_name varchar2(50) not null,
  seats number not null,
  constraint uq_vehicle_type_name unique (type_name),
  constraint ck_vehicle_type_seats check (seats > 0)
);

drop table vehicles cascade constraints;
create table vehicles (
  vehicle_id number primary key,
  license_plate varchar2(20) not null,
  status varchar2(20) default 'active' not null,
  vehicle_type_id number not null,
  constraint uq_vehicle_plate unique (license_plate),
  constraint ck_vehicle_status check (status in ('active','inactive','maintenance')),
  constraint fk_vehicle_type foreign key (vehicle_type_id) references vehicle_types(vehicle_type_id)
);

drop table schedules cascade constraints;
create table schedules (
  schedule_id number primary key,
  route_id number not null,
  schedule_time varchar2(5) not null,
  emp_id varchar2(20) not null,
  vehicle_id number not null,
  foreign key (route_id) references routes(route_id),
  foreign key (emp_id) references employees(emp_id),
  foreign key (vehicle_id) references vehicles(vehicle_id)
);

-- ข้อมูล

insert into departments values (1, 'it');
insert into departments values (2, 'transportation');

insert into positions values (1, 'admin');
insert into positions values (2, 'staff');
insert into positions values (3, 'driver');

insert into screens values (1, 'employee management', '/employee');
insert into screens values (2, 'permission management', '/permission');
insert into screens values (3, 'route management', '/routes');
insert into screens values (4, 'schedule management', '/schedules');
insert into screens values (5, 'department management', '/departments');
insert into screens values (6, 'position management', '/positions');
insert into screens values (7, 'stop management', '/stops');
insert into screens values (8, 'vehicle type management', '/vehicle-types');
insert into screens values (9, 'vehicle management', '/vehicles');

insert into position_permissions (position_id, screen_id, can_access)
select p.position_id, s.screen_id, 'y'
from positions p cross join screens s
where p.position_name = 'admin';

insert into position_permissions (position_id, screen_id, can_access)
select p.position_id, s.screen_id, 'y'
from positions p join screens s
on s.screen_path in ('/routes', '/schedules')
where p.position_name = 'driver';

insert into employees (emp_id, emp_name, emp_surname, emp_email, emp_password, dept_id, position_id)
select 'emp69001','system','admin','admin@mut.ac.th',
       '$2b$10$tt4sgmfnfespfx1aqtuyruzmw9sm4tscltqkusofbyw2iphbcmtfy',
       d.dept_id,p.position_id
from departments d cross join positions p
where d.dept_name='it' and p.position_name='admin';

insert into employees (emp_id, emp_name, emp_surname, emp_email, emp_password, dept_id, position_id)
select 'emp69002','สมชาย','ใจดี','driver1@mut.ac.th',
       '$2b$10$tt4sgmfnfespfx1aqtuyruzmw9sm4tscltqkusofbyw2iphbcmtfy',
       d.dept_id,p.position_id
from departments d cross join positions p
where d.dept_name='transportation' and p.position_name='driver';

insert into employees (emp_id, emp_name, emp_surname, emp_email, emp_password, dept_id, position_id)
select 'emp69003','สมหมาย','ใจรัก','driver2@mut.ac.th',
       '$2b$10$tt4sgmfnfespfx1aqtuyruzmw9sm4tscltqkusofbyw2iphbcmtfy',
       d.dept_id,p.position_id
from departments d cross join positions p
where d.dept_name='transportation' and p.position_name='driver';

insert into stops values (1, 'มหาวิทยาลัยเทคโนโลยีมหานคร');
insert into stops values (2, 'โลตัสหนองจอก');
insert into stops values (3, 'โรงพยาบาลหนองจอก');
insert into stops values (4, 'big c หนองจอก');
insert into stops values (5, 'สวนสาธารณะหนองจอก');
insert into stops values (6, 'ร้านส้มตำป้านาง');

insert into vehicle_types values (1, 'รถตู้', 9);
insert into vehicle_types values (2, 'รถบัส', 20);

insert into vehicles values (1, 'สย 2591', 'active', 1);
insert into vehicles values (2, 'บก 1130', 'active', 2);

commit;