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
