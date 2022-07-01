CREATE TABLE users(
    id serial not null primary key,
    name text,
    password text
);

CREATE TABLE user_movies(
    id serial not null primary key,
    movie_id int,
    usersId int,
    foreign key (usersId) references users(id)
);