from flask import Flask, redirect, render_template, request, session
from flask_socketio import SocketIO, send
import control
import machineboard

app = Flask(__name__)

app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


@app.route('/')
def index():
    try:
        username = session['username']
        return redirect(control.route_game())
    except Exception:
        return render_template('index.html')


@app.route('/new-game', methods=['POST'])
def new_game():
    username = request.form['username']
    table = request.form['table']
    typeuser = request.form['type']
    if typeuser == 'user':
        if not control.exist_user(username):
            control.add_user(username)
        user = control.get_user_name(username)
        if not control.exist_user_game(user[0]):
            code = control.generate_code()
            control.signin(user[0], username, code, table, user[1], '')
            control.add_game(code, user[0], table)
            return redirect(control.route_game())
        else:
            return redirect('/')
    else:
        code = control.generate_code()
        control.add_user("machine="+code.__str__())
        machine = control.get_user_name("machine="+code.__str__())
        if not control.exist_user(username):
            control.add_user(username)
        user = control.get_user_name(username)
        if not control.exist_user_game(user[0]):
            control.signin(user[0], username, code, table, user[1], machine[1])
            control.add_game_machine(code, user[0], machine[0], table)
            return redirect(control.route_game())
        else:
            return redirect('/')


@app.route('/logout')
def logout():
    control.sigup()
    return redirect('/')


@app.route('/game')
def game():
    try:
        game = control.get_game(session['code'])
        if game[4] != None:
            session['player2'] = control.get_user_id(game[4])[1]
        return render_template(
            'game.html',
            username=session['username'],
            code=session['code'],
            table=session['table'],
            player1=session['player1'],
            player2=session['player2'],
            board=game[2],
            passActual=game[5],)
    except Exception:
        return redirect('/')


@app.route('/conn-game', methods=['POST'])
def conn_game():
    username = request.form['username']
    code = request.form['code']
    if not control.exist_user(username):
        control.add_user(username)
    if control.exist_game(code):
        user = control.get_user_name(username)
        game = control.get_game(code)
        if control.exist_player2(code):
            if control.is_player1(code, user[0]) or control.is_player2(code, user[0]):
                player1 = control.get_user_id(game[3])
                player2 = control.get_user_id(game[4])
                control.signin(user[0], user[1], game[1],
                               game[7], player1[1], player2[1])
                return redirect(control.route_game())
            else:
                return redirect('/')
        else:
            if control.is_player1(code, user[0]):
                control.signin(user[0], user[1], game[1], game[7], user[1], '')
                return redirect(control.route_game())
            else:
                control.add_player2(user[0], code)
                player1 = control.get_user_id(game[3])
                control.signin(user[0], user[1], game[1],
                               game[7], player1[1], user[1])
                return redirect(control.route_game())
    else:
        return redirect('/')


@socketio.on('message')
def handle_message(msg):
    board = msg.split('-')
    control.update_board(session['code'], board[0])
    control.update_pass(session['code'], board[2])
    game = control.get_game(session['code'])
    try:
        player2 = control.get_user_id(game[4])
        if control.is_player1(session['code'], session['id']) and player2[1].split('=')[0] == 'machine':
            move = machineboard.generate_move(game[2], game[7], 1)
            send(game[2]+"-"+board[1]+'-'+str(session['code']) +
                 "-"+player2[1]+"-"+str(game[5])+"-"+move, broadcast=True)
        else:
            send(game[2]+"-"+board[1]+'-'+str(session['code']) +
                 "-"+player2[1]+"-"+str(game[5])+"-user", broadcast=True)
    except Exception:
        send(game[2]+"-"+board[1]+'-' +
             str(session['code'])+"-"+str(game[5])+"-user", broadcast=True)


if __name__ == '__main__':
    socketio.run(app)
