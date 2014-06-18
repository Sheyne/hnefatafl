key = null;

initUI = function () {
    logic.reset();

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

    turnText = $('<div class="turn"></div>');
    $('body').append(turnText);
    gameOverText = $('<div class="gameOver"></div>');
    $('body').append(gameOverText);
    resetButton = $('<input type="button" value="Reset" />');
    $('body').append(resetButton);
    $('body').append(boardElement);
}

function updateUI() {
    //draw each piece where it is
    $('.board-cell').attr('class', 'board-cell').each(function () {
        var cell = $(this);
        var x = cell.data('x');
        var y = cell.data('y');
        var cellData = logic.gameState.board[y][x];
        cell.addClass(PieceClasses[cellData]);

        if (isKingOnly(x, y)) {
            cell.addClass("unit-throne");
        }

        //if there is a selected piece, draw it highlighted
        if (logic.gameState.selectedPiece.x == x && logic.gameState.selectedPiece.y == y) {
            cell.addClass("special").addClass("selected");
        } else if (isLegalMove(logic.gameState, x, y)) {
            cell.addClass("special").addClass("move");
        }
	if(logic.gameState.previousPiece.x == x && logic.gameState.previousPiece.y == y) {
	    cell.addClass("previous").addClass("special");
	}
    });

    if(logic.gameState.turn == -1) {
	var winner;
	switch(logic.gameState.winner) {
		case logic.TeamNone:
			winner = "Tie";
			break;
		case logic.TeamRed:
			winner = "Red";
			break;
		case logic.TeamGreen:
			winner = "Green";
			break;
	}
	gameOverText.text(winner+" Wins!");
        turnText.text("Game Over");
	resetButton.show();
    } else {
	gameOverText.text("");
	turnText.text((logic.gameState.turn == logic.TeamRed ? "Red" : "Green")+"'s Turn");
	resetButton.hide();
    }

    //also highlight its possible moves
    //highlight enemy pieces that are flanked on one side
    //highlight the king if he is an enemy and is flanked at all?
    //highlight enemy pieces that may be flanked by this piece?
}

function queryServer() {
	$.getJSON("/api/"+key+"/info", function(gameState) {
		logic.gameState = gameState;
		updateUI();
		if(gameState.yourTurn) {
			
		} else {
			//if it's not our turn, queryServer after 200 ms	
			setTimeout(queryServer, 200);
		}
	});
}

$(document).ready(function(){
	//hit key, grab a key!
	$.getJSON("key", function(data){
		console.log("GRABBED KEY: ", data);
		key = data;
		if(key.error) {
			key = null;
		}
		queryServer();
	});

	initUI();

	updateUI();
	
	boardElement.on('click', '.board-cell', function () {
	    if(!logic.gameState.yourTurn) {
		return;
	    }
	    var cell = $(this);
	    var x = cell.data('x');
	    var y = cell.data('y');
	    var selectedX = logic.gameState.selectedPiece.x;
	    var selectedY = logic.gameState.selectedPiece.y;
	    if (!logic.makeMove(logic.gameState.turn, selectedX, selectedY, x, y)) {
	        var piece = logic.gameState.board[y][x];
	        if (PieceTeams[piece] == logic.gameState.turn && (x != logic.gameState.selectedPiece.x || y != logic.gameState.selectedPiece.y)) {
	            logic.gameState.selectedPiece = {
	                "x": x,
	                    "y": y
	            };
	        } else {
	            logic.gameState.selectedPiece = {
	                "x": -1,
	                    "y": -1
	            };
	        }
	    } else {
		//send your move, and then queryServer
		queryString = "/api/"+key+"/move/"+selectedX+","+selectedY+","+x+","+y;
		console.log(queryString);
		$.getJSON(queryString, function(data) {
			queryServer();
			updateUI();
		});
	    }
	    updateUI();
	});
	resetButton.on('click', function() {
		$.getJSON("api/wow/reset", function(data) {
			queryServer();
		});
	});
});
