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


$(document).ready(function(){
	initUI();
	updateUI();
	
	boardElement.on('click', '.board-cell', function () {
	    var cell = $(this);
	    var x = cell.data('x');
	    var y = cell.data('y');
	    if (!exports.makeMove(gameState.turn, gameState.selectedPiece.x, gameState.selectedPiece.y, x, y)) {
	        var piece = gameState.board[y][x];
	        if (PieceTeams[piece] == gameState.turn && (x != gameState.selectedPiece.x || y != gameState.selectedPiece.y)) {
	            gameState.selectedPiece = {
	                "x": x,
	                    "y": y
	            };
	        } else {
	            gameState.selectedPiece = {
	                "x": -1,
	                    "y": -1
	            };
	        }
	    }
	    updateUI();
	});
});
