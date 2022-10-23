import random
from flask import session
import mysql.connector

mysql = mysql.connector.connect(
    host='bzak9i8w15owuzwncj7g-mysql.services.clever-cloud.com',
    user='u8637lpbax4fmbnc',
    password='yILnKFzBzc4rrmiuXLOe',
    database='bzak9i8w15owuzwncj7g'
)

cur = mysql.cursor()


def route_game():
    return '/game'


def get_user_name(username):
    cur.execute("SELECT * FROM user WHERE name = %s", (username,))
    user = cur.fetchone()
    return user


def get_user_id(iduser):
    cur.execute("SELECT * FROM user WHERE id = %s", (iduser,))
    user = cur.fetchone()
    return user


def get_game(code):
    cur.execute("SELECT * FROM game WHERE code = %s", (code,))
    game = cur.fetchone()
    return game


def update_board(code, board):
    cur.execute("UPDATE game SET board = %s WHERE code = %s", (board, code,))
    mysql.commit()


def get_game_player1(code, iduser):
    cur.execute(
        "SELECT * FROM game WHERE player1 = %s and code = %s", (iduser, code))
    game = cur.fetchone()
    return game


def get_game_player2(code, iduser):
    cur.execute(
        "SELECT * FROM game WHERE player2 = %s and code = %s", (iduser, code))
    game = cur.fetchone()
    return game


def terminate_game(code, winner):
    cur.execute(
        "UPDATE game SET player1 = NULL and player2 = NULL WHERE code = %s", (code,))
    mysql.commit()
    cur.execute(
        "UPDATE user SET gamesPlayed = gamesPlayed + 1 WHERE id = %s", (winner,))
    mysql.commit()
    cur.execute(
        "UPDATE user SET gamesWon = gamesWon + 1 WHERE id = %s", (winner,))
    mysql.commit()


def add_player2(iduser, code):
    cur.execute("UPDATE game SET player2 = %s WHERE code = %s", (iduser, code,))
    mysql.commit()


def exist_player2(code):
    cur.execute("SELECT player2 FROM game WHERE code = %s", (code,))
    player2 = cur.fetchone()[0]
    if player2 is None:
        return False
    else:
        return True


def add_user(username):
    cur.execute(
        "INSERT INTO user (name,gamesWon,gamesPlayed,active) VALUES (%s,0,0,0)", (username,))
    mysql.commit()


def count_active_games(iduser):
    cur.execute("SELECT COUNT(*) FROM game WHERE player1 = %s OR player2 = %s",
                (iduser, iduser,))
    return cur.fetchone()[0]


def generate_code():
    return generate_random(10000, 99999)


def generate_random(i, j):
    return random.randint(i, j)


def add_game(code, idgame, table):
    cur.execute("INSERT INTO game (code,player1,pass,typeBoard) VALUES (%s,%s,0,%s)",
                (code, idgame, table,))
    mysql.commit()


def add_game_machine(code, id1, id2, table):
    cur.execute("INSERT INTO game (code,player1,player2,pass,typeBoard) VALUES (%s,%s,%s,0,%s)",
                (code, id1, id2, table,))
    mysql.commit()


def logout(iduser):
    cur.execute("UPDATE user SET active = 0 WHERE id = %s", (iduser,))
    mysql.commit()


def login(iduser):
    cur.execute("UPDATE user SET active = 1 WHERE id = %s", (iduser,))
    mysql.commit()


def update_pass(code, passupdate):
    if int(passupdate) == 0:
        cur.execute("UPDATE game SET pass = 0 WHERE code = %s", (code,))
    else:
        cur.execute("UPDATE game SET pass = pass + 1 WHERE code = %s",
                    (code,))
    mysql.commit()


def get_pass(code):
    cur.execute("SELECT pass FROM game WHERE code = %s", (code,))
    return cur.fetchone()[0]


def exist_user(username):
    if get_user_name(username) is None:
        return False
    else:
        return True


def exist_user_game(iduser):
    if count_active_games(iduser) == 0:
        return False
    else:
        return True


def exist_game(code):
    if get_game(code) is None:
        return False
    else:
        return True


def is_player1(code, iduser):
    if get_game_player1(code, iduser) is None:
        return False
    else:
        return True


def is_player2(code, iduser):
    if get_game_player2(code, iduser) is None:
        return False
    else:
        return True


def signin(iduser, username, code, table, player1, player2):
    login(iduser)
    session['username'] = username
    session['id'] = iduser
    session['code'] = code
    session['table'] = table
    session['player1'] = player1
    session['player2'] = player2


def sigup():
    logout(session['id'])
    session.pop('username', None)
    session.pop('id', None)
    session.pop('code', None)
    session.pop('table', None)
    session.pop('player1', None)
    session.pop('player2', None)