"use strict";
var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = process.env.PORT || 8080;

app.set('view engine', 'ejs');

var allDraw = {img:null};

// app.use(BodyParser.json());
// app.use(BodyParser.urlencoded({
	// extended: true
// }));

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
	console.log('Client connected');
	socket.on('draw', function(data) {
		io.sockets.emit('draw', data);
	});
	socket.on('clearAll',function(data){
		io.sockets.emit('clearAll',true);
	});
	socket.on('disconnect', function() {
		console.log('Client disconnected');
	});
});

server.listen(port, function() {
	console.log('Server Started on port ' + port)
});