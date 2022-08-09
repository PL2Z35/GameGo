const socket = io();

let rootX = 50, rootY = 45, boardSize = parseInt(document.getElementById('table').innerHTML), boxSize = 50;
let player = 0;

const EMPTY = -1;
const CHECKED = 1, UNCHECKED = 0;

let directs = [
    [0, 1], [0, -1], [1, 0], [-1, 0]
];

//Current board
let board = [], checkBoard = [], testBoard = [], backupBoard = [], historyBoards = [];

for (let i = 0; i < boardSize; i++) {
    board.push([]);
    checkBoard.push([]);
    testBoard.push([]);
    backupBoard.push([]);
    for (let j = 0; j < boardSize; j++) {
        board[i].push(EMPTY);
        checkBoard[i].push(UNCHECKED);
        testBoard[i].push(EMPTY);
        backupBoard[i].push(EMPTY);
    }
}

window.onload = function () {

    let canvas = document.getElementsByTagName('canvas')[0];
    let ctx = canvas.getContext('2d');
    let clicks = 0;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawBoard(ctx);

    createGrid();

    paintBoard();

    if (document.getElementById('passActual').innerHTML == '2') {
        document.getElementById('winner').innerHTML = '';
    }

    if (document.getElementById('player').innerHTML == ("Player: " + document.getElementById('player1').innerHTML)) {
        player = 0;
    } else {
        player = 1;
    }

    const aux = document.getElementById('username').value
    if (aux !== "None") {
        splitBoard(aux);
        let pointsPlayer1 = countPoints(0);
        let pointsPlayer2 = countPoints(1);
        document.getElementById('pointsPlayer1').innerHTML = '(' + document.getElementById('player1').innerHTML + '): ' + pointsPlayer1;
        document.getElementById('pointsPlayer2').innerHTML = '(' + document.getElementById('player2').innerHTML + '): ' + pointsPlayer2;
        if (parseInt(pointsPlayer1) <= parseInt(pointsPlayer2)) {
            document.getElementById('pointsPlayer1').style.color = 'red';
            document.getElementById('pointsPlayer2').style.color = 'green';
        } else {
            document.getElementById('pointsPlayer2').style.color = 'red';
            document.getElementById('pointsPlayer1').style.color = 'green';
        }
    } else {
        if (document.getElementById('player').innerHTML == ("Player: " + document.getElementById('player2').innerHTML)) {
            clicks = 1;
        }
    }

    $('.box').on('click', function click_board() {
        if (clicks == 0) {
            clicks = 1;
            document.getElementById('play').disabled = false
            document.getElementById('pass').disabled = true
            if ($(this).hasClass('hide')) {
                let box = $(this).attr('id').split('-');
                let x = parseInt(box[1]);
                let y = parseInt(box[2]);
                testBoard[x][y] = player;
                clearBoard(testBoard);
                if (invalidTestBoard() || invalidMove(x, y)) {
                    showInvalidMove(x, y);
                    copyBoard(testBoard, board);
                    resetCheckBoard();
                    clicks = 0;
                    document.getElementById('play').disabled = true
                    document.getElementById('pass').disabled = false
                } else { //Valid move
                    historyBoards.push(JSON.parse(JSON.stringify(backupBoard.slice(0))));
                    copyBoard(backupBoard, board);
                    copyBoard(board, testBoard);
                    updateGameBy(board);
                    $(this).addClass(player === 0 ? 'black' : 'white');
                    $(this).removeClass('hide');
                    player === 0 ? player++ : player--;
                }
                document.getElementById('username').value = updateBoard(board);
                paintBoard();
            }
        }
    });

    function paintBoard() {
        let test = $('#test');
        test.html("current board<br>");
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === EMPTY)
                    test.append('*   ');
                else
                    test.append(board[i][j] + '    ');
            }
            test.append('<br>');
        }
        test.append(historyBoards.length + '<br>');
        test.append('backup board<br>');
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (backupBoard[i][j] === EMPTY)
                    test.append('*   ');
                else
                    test.append(backupBoard[i][j] + '    ');
            }
            test.append('<br>');
        }
        test.append('test board<br>');
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (testBoard[i][j] === EMPTY)
                    test.append('*   ');
                else
                    test.append(testBoard[i][j] + '    ');
            }
            test.append('<br>');
        }
    }

    $('.undo-btn').on('click', function () {
        if (historyBoards.length > 0) {

            copyBoard(board, backupBoard);
            copyBoard(testBoard, backupBoard);

            updateGameBy(board);

            copyBoard(backupBoard, historyBoards.pop());

            player === 0 ? player++ : player--;
        }
        paintBoard();
    });

    $('.reset-btn').on('click', function () {
        reset();
        paintBoard();
    });

    socket.on('message', function (msg) {
        let code = document.getElementById('code').innerHTML;
        let cont = msg.split('-');
        if (code == cont[2]) {
            if (cont[5] == "user") {
                playclick(cont, 0);
            }
            if (cont[5] != "user") {
                let aux = cont[5].split('=');
                let x = parseInt(aux[0]);
                let y = parseInt(aux[1]);
                testBoard[x][y] = player;
                clearBoard(testBoard);
                historyBoards.push(JSON.parse(JSON.stringify(backupBoard.slice(0))));
                copyBoard(backupBoard, board);
                copyBoard(board, testBoard);
                updateGameBy(board);
                $(this).addClass(player === 0 ? 'black' : 'white');
                $(this).removeClass('hide');
                player === 0 ? player++ : player--;
                document.getElementById('username').value = updateBoard(board);
                paintBoard();
                document.getElementById('play').disabled = true
                document.getElementById('pass').disabled = false
                clicks = 0;
                playclick(cont, 1);
            }
        }
    });

    function playclick(cont, opc) {
        document.getElementById('passActual').innerHTML = cont[4];
        if (document.getElementById('passActual').innerHTML == '2') {
            document.getElementById('winner').innerHTML = '';
        }
        document.getElementById('messages').innerHTML = cont[0];
        splitBoard(cont[0]);
        document.getElementById('pointsPlayer1').innerHTML = '(' + document.getElementById('player1').innerHTML + '): ' + countPoints(0);
        document.getElementById('pointsPlayer2').innerHTML = '(' + document.getElementById('player2').innerHTML + '): ' + countPoints(1);
        if (opc == 0) {
            player = parseInt(cont[1]);
            document.getElementById('play').disabled = true
            if (player == 0) {
                document.getElementById('played').innerHTML = "Juega:" + document.getElementById('player1').innerHTML;
                if (document.getElementById('player').innerHTML == ("Player: " + document.getElementById('player1').innerHTML)) {
                    clicks = 0;
                }
            } else {
                document.getElementById('played').innerHTML = "Juega:" + document.getElementById('player2').innerHTML;
                if (document.getElementById('player').innerHTML == ("Player: " + document.getElementById('player2').innerHTML)) {
                    clicks = 0;
                }
            }
        }
        if (parseInt(countPoints(0)) <= parseInt(countPoints(1))) {
            document.getElementById('pointsPlayer1').style.color = 'red';
            document.getElementById('pointsPlayer2').style.color = 'green';
        } else {
            document.getElementById('pointsPlayer2').style.color = 'red';
            document.getElementById('pointsPlayer1').style.color = 'green';
        }
        document.getElementById('player2').innerHTML = cont[3];
    }

    $('#play').on('click', function () {
        let auxuser = document.getElementById('username').value;
        socket.send(auxuser + "-" + player + "-" + 0);
        document.getElementById('username').value = board;
        document.getElementById('pass').disabled = false;
    });

    $('#pass').on('click', function () {
        player === 0 ? player++ : player--;
        document.getElementById('username').value = updateBoard(board);
        let auxuser = document.getElementById('username').value;
        socket.send(auxuser + "-" + player + "-" + 1);
        document.getElementById('username').value = board;
        document.getElementById('pass').disabled = true;
    });

    function splitBoard(boardText) {
        let aux = boardText.split(',')
        let cont = 0
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (aux[cont] != '2') {
                    drawNewBoad(i, j, parseInt(aux[cont]));
                } cont++;
            }
        }
        document.getElementById('username').value = board;
    }

    function drawNewBoad(x, y, player) {
        testBoard[x][y] = player;
        clearBoard(testBoard);
        historyBoards.push(JSON.parse(JSON.stringify(backupBoard.slice(0))));
        copyBoard(backupBoard, board);
        copyBoard(board, testBoard);
        updateGameBy(board);
        $(this).addClass(player === 0 ? 'black' : 'white');
        $(this).removeClass('hide');
        paintBoard();
    }

}

function updateBoard(board) {
    let aux = []
    for (var i = 0; i < boardSize; i++) {
        aux.push([])
        for (var j = 0; j < boardSize; j++) {
            if (parseInt(board[i][j]) == -1) {
                aux[i].push(2);
            } else {
                aux[i].push(board[i][j]);
            }
        }
    }
    return aux;
}

function getLiberties(board, x, y) {
    if (board[x][y] === EMPTY)
        return -1;
    if (checkBoard[x][y] === CHECKED)
        return 0;

    checkBoard[x][y] = CHECKED;

    var count = 0;

    for (const element of directs) {
        var pX = x + element[0];
        var pY = y + element[1];

        if (!outOfBounds(pX, pY)) { //valid position
            if (board[pX][pY] === EMPTY) { //1 liberty
                count++;
            } else if (board[pX][pY] === board[x][y]) { //next chain
                count += getLiberties(board, pX, pY);
                checkBoard[pX][pY] = CHECKED;
            }
        }

    }
    return count;
}

function getChain(x, y) {
    var chain = [];
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            if (checkBoard[i][j] === CHECKED) {
                chain.push([i, j]);
            }
        }
    }
    return chain;
}

function clearBoard(board) {
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            if (board[i][j] !== EMPTY && board[i][j] !== player) {
                if (getLiberties(board, i, j) === 0) {
                    //Remove dead pieces in board
                    var chain = getChain(i, j);
                    for (const element of chain) {
                        var pX = element[0];
                        var pY = element[1];

                        board[pX][pY] = EMPTY;
                    }
                }
                resetCheckBoard();
            }
        }
    }
}

//Update game by selected board
function updateGameBy(board) {
    deleteBox($('.box'));

    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            if (board[i][j] !== EMPTY) {
                var box = $('#box-' + i + '-' + j);

                box.addClass(board[i][j] === 0 ? 'black' : 'white');
                box.removeClass('hide');
            }
        }
    }
}

//Copy two board
function copyBoard(board, copyBoard) {
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            board[i][j] = copyBoard[i][j];
        }
    }
}

//Check if board changed or not
//Compare test board to backup board
function invalidTestBoard() {
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            if (testBoard[i][j] !== backupBoard[i][j]) {
                return false;
            }
        }
    }
    return true;
}

//Check if this move is valid
function invalidMove(x, y) {
    if (testBoard[x][y] !== EMPTY && getLiberties(testBoard, x, y) === 0) {
        return true;
    }
    resetCheckBoard();
    return false;
}

//Check valid position
function outOfBounds(x, y) {
    return x < 0 || x >= boardSize || y < 0 || y >= boardSize;
}

function resetCheckBoard() {
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            checkBoard[i][j] = UNCHECKED;
        }
    }
}

//Reset board to start new game
function resetBoard(board) {
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            board[i][j] = EMPTY;
        }
    }
}

function deleteBox(box) {
    box.removeClass('black');
    box.removeClass('white');
    box.addClass('hide');
}

function reset() {
    deleteBox($('.box'));

    player = 0;

    resetBoard(board);
    resetBoard(testBoard);
    resetBoard(backupBoard);

    historyBoards = [];
}

function showInvalidMove(x, y) {
    var box = $('#box-' + x + '-' + y);

    box.addClass('invalid');
    setTimeout(function () {
        box.removeClass('invalid');
    }, 50);
}

//Create grid board game
function createGrid() {
    $('.board').empty();

    for (var i = 0; i < boardSize; i++) {
        $('.board').append('<div class=\"row\" id=\"row-' + i + '\">');
        for (var j = 0; j < boardSize; j++) {
            $('#row-' + i).append('<div class=\"box hide\" id=\"box-' + i + '-' + j + '\">');
        }
    }
}

//Draw board functions
function drawBoard(ctx) {

    var x = rootX, y = rootY;

    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.fillStyle = '#F2B06D';
    ctx.fillRect(rootX - 40, rootY - 40, 80 + boxSize * (boardSize - 1), 80 + boxSize * (boardSize - 1));

    for (var i = 0; i < boardSize; i++) {
        drawLine(ctx, x, y, 0, boxSize * (boardSize - 1));
        x += boxSize;
    }
    x = rootX, y = rootY;
    for (var i = 0; i < boardSize; i++) {
        drawLine(ctx, x, y, boxSize * (boardSize - 1), 0);
        y += boxSize;
    }

    drawLine(ctx, rootX - 40, rootY - 40, 0, 80 + boxSize * (boardSize - 1));
    drawLine(ctx, rootX + 40 + boxSize * (boardSize - 1), rootY - 40, 0, 80 + boxSize * (boardSize - 1));
    drawLine(ctx, rootX - 40, rootY - 40, 80 + boxSize * (boardSize - 1), 0);
    drawLine(ctx, rootX - 40, rootY + 40 + boxSize * (boardSize - 1), 80 + boxSize * (boardSize - 1), 0);

    ctx.fillStyle = '#000';
    if (boardSize === 9) {
        drawPoint(ctx, 2, 2);
        drawPoint(ctx, 2, 6);
        drawPoint(ctx, 6, 2);
        drawPoint(ctx, 6, 6);
        drawPoint(ctx, 4, 4);
    } else if (boardSize === 13) {
        drawPoint(ctx, 3, 3);
        drawPoint(ctx, 3, 9);
        drawPoint(ctx, 9, 3);
        drawPoint(ctx, 9, 9);
        drawPoint(ctx, 6, 6);
    } else if (boardSize === 19) {
        for (var i = 3; i <= 15; i += 6) {
            for (var j = 3; j <= 15; j += 6) {
                drawPoint(ctx, i, j);
            }
        }
    }
}

function drawLine(ctx, x, y, a, b) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + a, y + b);
    ctx.stroke();
}

function drawPoint(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(rootX + boxSize * x, rootY + boxSize * y, 5, 0, 2 * Math.PI);
    ctx.fill();
}

function countPoints(playerCode) {
    let points = 0;
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === playerCode) {
                points++;
            }
        }
    }
    return points;
}