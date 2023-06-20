create table if not exists users (
  id integer primary key autoincrement,
  username varchar(200) not null,
  email varchar unique,
  user_password varchar,
  is_admin boolean,
  created_at integer
);

create table if not exists parking_lots (
  id integer primary key autoincrement,
  lot_name varchar,
  office_name varchar,
  total_lots integer,
  free_lots integer,
  curr_users varchar,
  latitude real,
  longitude real,
  created_at integer
);

create table if not exists parking_actions (
  id integer primary key,
  user_id integer,
  parking_lot_id integer,
  is_park boolean,
  created_at timestamp,
  foreign key (user_id) references users (id),
  foreign key (parking_lot_id) references parking_lots (id)
)
