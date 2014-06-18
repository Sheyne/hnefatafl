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
        },
	"winner": -1
    };
};

var boardElement;


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
    if(gameState.team == exports.TeamNone) {
	return false;
    }
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
        if (PieceTeams[currentPiece] != exports.TeamNone || (isKingOnly(currentX, currentY) && selectedPiece != PK)) {
		return false;
	}
    }

    return true;
}

function gameIsDraw(gameState) {
	//if the current player has no moves, it's a draw
	for(var i=0;i<BoardSize;i++) {
		for(var j=0;j<BoardSize;j++) {
			//if the piece at gameState.board[j][i] is not on the team equal to gameState.team
			var currentPiece = gameState.board[j][i];
			if(PieceTeams[currentPiece] != gameState.turn) {
				continue;
			}
			//the piece is on this player's team
			//try 0 to BoardSize-1, y and x, 0 to BoardSize-1
			gameState.selectedPiece.x = i;
			gameState.selectedPiece.y = j;
			for(var k=0;k<BoardSize;k++) {
				if(isLegalMove(gameState, i, k) || isLegalMove(gameState, k, j)) {
					gameState.selectedPiece.x = -1;
					gameState.selectedPiece.y = -1;
					return false;
				}
			}
		}
	}

	return true;
}

exports.makeMove = function (player, selectedX, selectedY, x, y) {
    //if it's not this player's turn, return false
    if (player != exports.gameState.turn || player == exports.TeamNone) {
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

	if(exports.gameState.board[y][x] == PK) {
		if(x == 0 || x == BoardSize-1) {
			if(y == 0 || y == BoardSize-1) {
				exports.gameState.turn = exports.TeamNone;
				exports.gameState.winner = exports.TeamGreen;
				return true;
			}
		}
	}

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
                            if ((isOccupied(x + i * 2, y + j * 2) && PieceTeams[exports.gameState.board[y + j * 2][x + i * 2]] == exports.gameState.turn) || (isEmpty(x + i * 2, y + j * 2) && isKingOnly(x + i * 2, y + j * 2))) {
                                exports.gameState.board[y + j][x + i] = PX;
                            }
                        } else if (capturedPiece == PK) {
                            //need 4 flanks
			    
			    var canEscape = false;
			    for(var v = -1; v < 2; v+= 1) {
				for(var w = -1; w < 2; w += 1) {
				    var possibleEscape = exports.gameState.board[y + j + w][x + i + v];
				    if(isEmpty(x + i + v, y + j + w) && !isKingOnly(x + i + v, y + j + w)) {
					canEscape = YES;
				    }
				}
			    }
			    if(!canEscape) {
				exports.gameState.turn = exports.TeamNone;
				exports.gameState.winner = exports.TeamRed;
			    }
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
	if(gameIsDraw(exports.gameState)) {
		exports.gameState.turn = exports.TeamNone;
		exports.gameState.winner = exports.TeamNone;
	}
        return true;
    } else {
        return false;
    }

};




