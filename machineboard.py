import random


def generate_move(board, typeboard, player):
    aux = analitic_move(board, typeboard, player).split("=")
    return str(aux[0])+"="+str(aux[1])


def analitic_move(board, typeboard, player):
    boardaux = generate_board(board, typeboard)
    aux = generate_random_move(boardaux, typeboard, player).split("=")
    return str(aux[0])+"="+str(aux[1])


def generate_board(board, typeboard):
    boardaux = []
    splitaux = board.split(",")
    cont = 0
    for i in range(0, int(typeboard)):
        boardaux2 = []
        for j in range(0, int(typeboard)):
            boardaux2.append(splitaux[cont])
            cont = cont + 1
        boardaux.append(boardaux2)
    return boardaux


def is_valid_move(board, x, y, player, typeboard):
    return board[x][y] != "0" and board[x][y] != "1"


def suicide(board, x, y, player, typeboard):
    if x > 0 and y > 0 and x < typeboard and y < typeboard:
        return False
    return True


def generate_random(i, j):
    return random.randint(i, j-1)


def generate_random_move(board, typeboard, player):
    x = 0
    y = 0
    while True:
        x = generate_random(0, int(typeboard))
        y = generate_random(0, int(typeboard))
        if is_valid_move(board, x, y, player, typeboard):
            break
    return str(x)+"="+str(y)
