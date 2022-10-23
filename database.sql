create database gameGo;

use gameGo;

create table user (
    id int not null auto_increment,
    name varchar(255) not null,
    gamesWon int not null,
    gamesPlayed int not null,
    active int not null,
    primary key (id)
);

create table game (
    id int not null auto_increment,
    code int not null,
    board varchar(1000),
    player1 int not null,
    player2 int,
    pass int not null,
    typeBoard int not null,
    primary key (id)
);

create table move(
    id int not null auto_increment,
    id_code int not null,
    board varchar(1000),
    primary key(id)
)

alter table game add foreign key (player1) references user(id);
alter table game add foreign key (player2) references user(id);
alter table move add foreign key (id_code) references game(id);
