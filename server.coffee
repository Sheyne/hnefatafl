http = require 'http'
fs = require 'fs'
logic = require './logic'

index = fs.readFileSync 'index.html'

http.createServer((req, res) ->
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.end(index)
).listen(9615)
