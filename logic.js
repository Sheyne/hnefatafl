if (typeof exports === 'undefined') {
    logic = {};
    exports = logic;
}

//attackers move first
//corners are always hostile and none may enter except the king
//walls are hostile to the king
//the throne is hostile to all when unoccupied and hostile to defenders when empty
//only the king may enter or pass through the throne

exports.TeamNone = -1;
exports.TeamRed = 0;
exports.TeamGreen = 1;

var PX = 0;
var PE = 1;
var PD = 2;
var PK = 3;

var PieceClasses = ["unit-empty", "unit-enemy", "unit-defender", "unit-king"];
var PieceTeams = [exports.TeamNone, exports.TeamRed, exports.TeamGreen, exports.TeamGreen];

var BoardSize = 11;

function initBoard() {
    return [
    [PX, PX, PX, PE, PE, PE, PE, PE, PX, PX, PX], [PX, PX, PX, PX, PX, PE, PX, PX, PX, PX, PX], [PX, PX, PX, PX, PX, PX, PX, PX, PX, PX, PX], [PE, PX, PX, PX, PX, PD, PX, PX, PX, PX, PE], [PE, PX, PX, PX, PD, PD, PD, PX, PX, PX, PE], [PE, PE, PX, PD, PD, PK, PD, PD, PX, PE, PE], [PE, PX, PX, PX, PD, PD, PD, PX, PX, PX, PE], [PE, PX, PX, PX, PX, PD, PX, PX, PX, PX, PE], [PX, PX, PX, PX, PX, PX, PX, PX, PX, PX, PX], [PX, PX, PX, PX, PX, PE, PX, PX, PX, PX, PX], [PX, PX, PX, PE, PE, PE, PE, PE, PX, PX, PX]];
}

exports.reset = function () {
    exports.gameState = {
        "board": initBoard(),
            "turn": exports.TeamRed,
            "selectedPiece": {
            "x": -1,
                "y": -1
        }
    };
};

var boardElement;

initUI = function () {
    exports.reset();

    boardElement = $('<div class="board"></div>');
    for (var i = 0; i < BoardSize; i++) {
        var boardRow = $('<div class="board-row"></div>');
        for (var j = 0; j < BoardSize; j++) {
            var cell = $('<div class="board-cell"></div>');
            cell.data('x', j);
            cell.data('y', i);
            boardRow.append(cell);
        }
        boardElement.append(boardRow);
    }

    $('body').append(boardElement);
}

function updateUI() {
    //draw each piece where it is
    $('.board-cell').attr('class', 'board-cell').each(function () {
        var cell = $(this);
        var x = cell.data('x');
        var y = cell.data('y');
        var cellData = exports.gameState.board[y][x];
        cell.addClass(PieceClasses[cellData]);

        if (isKingOnly(x, y)) {
            cell.addClass("unit-throne");
        }

        //if there is a selected piece, draw it highlighted
        if (exports.gameState.selectedPiece.x == x && exports.gameState.selectedPiece.y == y) {
            cell.addClass("special").addClass("selected");
        } else if (isLegalMove(exports.gameState, x, y)) {
            cell.addClass("special").addClass("move");
        }
    });

    //also highlight its possible moves
    //highlight enemy pieces that are flanked on one side
    //highlight the king if he is an enemy and is flanked at all?
    //highlight enemy pieces that may be flanked by this piece?
}

//board analysis

//(black's move and white is one move away from corner)? 
//checkmate(black's move and white has two valid moves that will let him win)?
//is it black check(white's turn and black has a move next turn that will let him win)?

function isValid(x, y) {
    return x >= 0 && y >= 0 && x < BoardSize && y < BoardSize;
}

function isEmpty(x, y) {
    if (isValid(x, y)) {
        return exports.gameState.board[y][x] == PX;
    }
    return false;
}

function isOccupied(x, y) {
    if (!isValid(x, y)) {
        return false;
    }
    return !isEmpty(x, y);
}

function isKingOnly(x, y) {
    if (x == Math.floor(BoardSize / 2) && y == Math.floor(BoardSize / 2)) {
        return true;
    }
    if (x !== 0 && x != BoardSize - 1) {
        return false;
    }
    if (y !== 0 && y != BoardSize - 1) {
        return false;
    }

    return true;
}

function isLegalMove(gameState, x, y) {
    var currentTurn = gameState.turn;
    var selectedX = gameState.selectedPiece.x;
    var selectedY = gameState.selectedPiece.y;
    if (!isValid(selectedX, selectedY) || !isValid(x, y)) {
        return false;
    }
    var selectedPiece = gameState.board[selectedY][selectedX];
    if (PieceTeams[selectedPiece] != currentTurn) {
        return false;
    }

    if (selectedX == x && selectedY == y) {
        return false;
    }
    if (selectedX != x && selectedY != y) {
        return false;
    }

    var deltaX = (x - selectedX) / Math.abs(x - selectedX) || 0;
    var deltaY = (y - selectedY) / Math.abs(y - selectedY) || 0;

    var currentX = selectedX;
    var currentY = selectedY;
    var currentPiece = gameState.board[currentY][currentX];

    while (currentX != x || currentY != y) {
        currentX += deltaX;
        currentY += deltaY;

        currentPiece = gameState.board[currentY][currentX];
        if (PieceTeams[currentPiece] != exports.TeamNone || (isKingOnly(currentX, currentY) && selectedPiece != PK)) return false;
    }

    return true;
}

exports.makeMove = function (player, selectedX, selectedY, x, y) {
    //if it's not this player's turn, return false
    if (player != exports.gameState.turn) {
        return false;
    }

    exports.gameState.selectedPiece.x = selectedX;
    exports.gameState.selectedPiece.y = selectedY;

    if (isLegalMove(exports.gameState, x, y)) {
        //swap selectedx, selectedy with x, y
        var temp = exports.gameState.board[y][x];
        exports.gameState.board[y][x] = exports.gameState.board[selectedY][selectedX];
        exports.gameState.board[selectedY][selectedX] = temp;
        exports.gameState.selectedPiece = {
            "x": -1,
                "y": -1
        };

        //try to capture pieces in 4 directions
        var capturingPiece = exports.gameState.board[y][x];
        for (var i = -1; i < 2; i += 1) {
            for (var j = -1; j < 2; j += 1) {
                if ((j !== 0 && i !== 0) || (j === 0 && i === 0)) {
                    continue;
                }
                //for x+i, y+j, check to see if it's an enemy
                if (isOccupied(x + i, y + j)) {
                    var capturedPiece = exports.gameState.board[y + j][x + i];
                    if (PieceTeams[capturedPiece] != exports.gameState.turn) {
                        //if they're a defender/enemy, need 1 flank or castle
                        if (capturedPiece == PD || capturedPiece == PE) {
                            if (isOccupied(x + i * 2, y + j * 2)) {
                                if (PieceTeams[exports.gameState.board[y + j * 2][x + i * 2]] == exports.gameState.turn) {
                                    exports.gameState.board[y + j][x + i] = PX;
                                }
                            } else if (isKingOnly(x + i * 2, y + j * 2)) {

                            }
                        } else if (capturedPiece == PK) {
                            //need 4 flanks
                        }
                    }
                }
            }
        }

        if (exports.gameState.turn == exports.TeamRed) {
            exports.gameState.turn = exports.TeamGreen;
        } else {
            exports.gameState.turn = exports.TeamRed;
        }
        return true;
    } else {
        return false;

    }

};




