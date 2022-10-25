import random
from typing import List
import control

def generate_move(list,board, typeboard, player):
    aux = analitic_move(list, board, typeboard, player).split("=")
    print(aux)
    return str(aux[0])+"="+str(aux[1])


def analitic_move(list, board, typeboard, player):
    print("MOVIMIENTO A REALIZAR")
    auxList = str(list).split(",")
    if len(auxList) > 1:
        list = str(list).replace(",a","")
        newBoard = generate_board(list, typeboard)
        boardaux = generate_board(board, typeboard)
        print(newBoard)
        result = compare_boards(newBoard, boardaux, typeboard)
        auxList = str(result).split("=")
        boardtext = str(board).replace(" ", "")
        boardtext = str(boardtext).replace("[", "")
        boardtext = str(boardtext).replace("]", "")
        boardtext = str(boardtext).replace("'", "")
        return str(auxList[0])+"="+str(auxList[1])+"-"+boardtext
    boardaux = generate_board(board, typeboard)
    aux = generate_random_move(board,boardaux, typeboard, player).split("=")
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

def compare_boards(board1, board2, typeboard):
    list = ""
    for i in range(0, int(typeboard)):
        for j in range(0, int(typeboard)):
            if(int(board1[i][j]) != int(board2[i][j])):
                list = (str(i)+"="+str(j))
                break
    return str(list)

def generate_random_move(boardtext,board, typeboard, player):
    x = 0
    y = 0
    while True:
        x = generate_random(0, int(typeboard))
        y = generate_random(0, int(typeboard))
        if is_valid_move(board, x, y, player, typeboard):
            board[x][y]=1
            break
    boardtext = str(board).replace(" ", "")
    boardtext = str(boardtext).replace("[", "")
    boardtext = str(boardtext).replace("]", "")
    boardtext = str(boardtext).replace("'", "")
    return str(x)+"="+str(y)+"-"+boardtext


def total_moves(player,moves, actual_board):
    end = "";
    for i in range(0, int(len(moves))):
        end = moves[i];
        if i == int(len(moves))-1:
            end = moves[i-1]
    opc1 = str(end).count("0")
    opc2 = str(end).count("1")
    act1 = str(actual_board).count("0")
    act2 = str(actual_board).count("1")
    if(player==True):
        contAnt= int(opc1) - int(opc2)
        contAct = int(act1) - int(act2)
        if (int(contAct) > int(contAnt)):
            return "good"
        if (int(contAct) == int(contAnt)):
            return "acceptable"
        if (int(contAct) < int(contAnt)):
            return "bad"
    else:
        contAnt= int(opc2) - int(opc1)
        contAct = int(act2) - int(act1)
        if (int(contAct) > int(contAnt)):
            return "good"
        if (int(contAct) == int(contAnt)):
            return "acceptable"
        if (int(contAct) < int(contAnt)):
            return "bad"
