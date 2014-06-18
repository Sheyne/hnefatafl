http = require 'http'
fs = require 'fs'
logic = require './logic'

index = fs.readFileSync 'index.html'
frontend = fs.readFileSync 'frontend.js'
logicFile = fs.readFileSync 'logic.js'
stylesheet = fs.readFileSync 'style.css'

doCommand = (command, opts) ->
	res = opts.response
	if command == 'reset'
		logic.reset()
		res.writeHead(200, {'Content-Type': 'text/plain'})
		res.end "user \"#{opts.token}\" reset the game"
	else if command == 'info'
		
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
		else if part1 == 'api' and parts[0] and parts[1]
			doCommand parts[1], {'request': req, 'token': parts[0], 'response': res, 'data': parts[2..]}
		else
			res.writeHead(400, {'Content-Type': 'text/plain'})
			res.end 'invalid request'
).listen(9615)
