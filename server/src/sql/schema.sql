create table if not exists users (
    id integer primary key autoincrement,
    username varchar(200) not null,
    email varchar,
    user_password varchar,
    created_at integer
)

create table if not exists parking_lots (
    id integer primary key autoincrement,
    lot_name varchar,
    office_name varchar,
    total_lots integer,
    occupied_lots integer,
    created_at integer,
)

create table if not exists parking_action {
  id integer [primary key]
  user_id integer 
  created_at timestamp
  foreign key (user_id) references users (id)
}
