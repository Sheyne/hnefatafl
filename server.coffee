http = require 'http'
fs = require 'fs'
logic = require './logic'

index = fs.readFileSync 'index.html'
frontend = fs.readFileSync 'frontend.js'
logicFile = fs.readFileSync 'logic.js'

doCommand = (command, opts) ->
	res = opts.response
	if command == 'reset'
		logic.reset()
		res.writeHead(200, {'Content-Type': 'text/plain'})
		res.end "user \"#{opts.user}\" reset the game"
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
		if part1 == '/frontend.js'
			res.writeHead(200, {'Content-Type': 'text/plain'})
			res.end frontend
		else if part1 == '/logic.js'
			res.writeHead(200, {'Content-Type': 'text/plain'})
			res.end logicFile
		else if parts[0]
			doCommand parts[0], {'request': req, 'user': part1, 'response': res, 'data': parts[1..]}
		else
			res.writeHead(400, {'Content-Type': 'text/plain'})
			res.end 'invalid request'
).listen(9615)
