CREATE TABLE users(
    id serial not null primary key,
    name text,
    password text,
    username text
);

CREATE TABLE user_movies(
    id serial not null primary key,
    movie_name text,
    movie_id int,
    foreign key (movie_id) references users(id)
);