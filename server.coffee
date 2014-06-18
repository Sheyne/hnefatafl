http = require 'http'
fs = require 'fs'
logic = require './logic'

index = fs.readFileSync 'index.html'
frontend = fs.readFileSync 'frontend.js'
logicFile = fs.readFileSync 'logic.js'
stylesheet = fs.readFileSync 'style.css'

keyCounter = 1
players = {}

outputState = (res, player) ->
	if logic.gameState
		console.log players
		res.writeHead(200, {'Content-Type': 'text/plain'})
		logic.gameState['yourTurn'] = logic.gameState.turn == player
		res.end JSON.stringify logic.gameState
	else
		res.writeHead(500, {'Content-Type': 'text/plain'})
		res.end 'no game in progress'


doCommand = (command, opts) ->
	res = opts.response
	player = players[opts.token]
	console.log "player #{player}"
	if command == 'reset'
		logic.reset()
		res.writeHead(200, {'Content-Type': 'text/plain'})
		res.end "user \"#{opts.token}\" reset the game"
	else if command == 'move'
		args = [parseInt(x) for x in opts.data[0].split(",")]
		console.log logic.makeMove(player,args[0],args[1],args[2],args[3])
		outputState opts.response, player
	else if command == 'info'
		outputState opts.response, player
	else
		res.writeHead(404, {'Content-Type': 'text/plain'})
		res.end 'unrecognized command'


http.createServer((req, res) ->
	if req.url == '/'
		res.writeHead(200, {'Content-Type': 'text/html'})
		res.end(index)
	else
		parts = req.url.split('/')
		part1 = parts[1]
		parts = parts[2..]
		if part1 == 'frontend.js'
			res.writeHead(200, {'Content-Type': 'text/plain'})
			res.end frontend
		else if part1 == 'logic.js'
			res.writeHead(200, {'Content-Type': 'text/plain'})
			res.end logicFile
		else if part1 == 'style.css'
			res.writeHead(200, {'Content-Type': 'text/plain'})
			res.end stylesheet
		else if part1 == 'key'
			key = "key#{keyCounter}"
			if keyCounter <= 2
				if keyCounter == 1
					players[key] = logic.TeamRed
					logic.reset()
				else
					players[key] = logic.TeamGreen
				res.writeHead(200, {'Content-Type': 'text/plain'})
				res.end key
				keyCounter += 1
			else
				res.writeHead(500, {'Content-Type': 'text/plain'})
				res.end 'the game is full'

		else if part1 == 'api' and parts[0] and parts[1]
			doCommand parts[1], {'request': req, 'token': parts[0], 'response': res, 'data': parts[2..]}
		else
			res.writeHead(400, {'Content-Type': 'text/plain'})
			res.end 'invalid request'
).listen(9615)
