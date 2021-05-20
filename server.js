"use strict";
const express = require("express");
const app = express();
const fs = require('fs');
const BodyParser = require("body-parser");
const server = require('http').Server(app);
const io = require('socket.io')(server, {
	cors: {
		origin: '*',
	}
});

const port = process.env.PORT || 8004;

app.set('view engine', 'ejs');

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({
	extended: true
}));

let allDraw = { img: null };

const words = JSON.parse(fs.readFileSync('./words.json'));

// app.use(BodyParser.json());
// app.use(BodyParser.urlencoded({
// extended: true
// }));

let id = 0;
let offUsers = [];
let users = [];
let chat = [];
let timer = null;
let timertwo = null;
let drawing = null;
let actualWord = null;
let tim = 29;

function whoDraw(person) {
	actualWord = words[Math.floor(Math.random() * words.length)];
	io.sockets.emit('clearAll', true);
	if (users.length > 0) {
		if (users.length == 1 || !drawing) {
			drawing = users[0];
			return { drawing: drawing, word: actualWord };
		} else {
			if (person) {
				clearInterval(timer);
				clearInterval(timertwo);
				timer = null;
				timertwo = null;
				startTimer();
				for (let index of users) {
					if (index.name == person.name && index.id == person.id) {
						drawing = index;
						return { drawing: drawing, word: actualWord };
					}
				}
				return whoDraw(null);
			} else {
				let next = false;
				for (let index of users) {
					if (next) {
						drawing = index;
						return { drawing: drawing, word: actualWord };
					}
					if (index == drawing) {
						next = true;
					}
				}
				drawing = users[0];
				return { drawing: drawing, word: actualWord };
			}
		}
	} else {
		clearInterval(timer);
		clearInterval(timertwo);
	}
}

function startTimer() {
	if (users.length == 1) {
		io.sockets.emit('whoDraw', whoDraw(null));
		if (!timer) {
			timer = setInterval(function () {
				tim = 30;
				io.sockets.emit('whoDraw', whoDraw(null));
			}, 30000);
		}
		if (!timertwo) {
			timertwo = setInterval(function () {
				io.sockets.emit('count', tim);
				tim--;
			}, 1000);
		}
	}
}
app.post('/login', function (req, res) {
	id++;
	let us = {
		name: req.body.name,
		points: 0,
		id: id
	};
	users.push(us);
	offUsers.push(us);
	startTimer();
	if (chat.length) {
		io.sockets.emit('chat', chat);
	}
	io.sockets.emit('whoDraw', { drawing: drawing, word: actualWord });
	res.send({ data: us, error: false });
	res.end();

});

app.post('/oldLogin', function (req, res) {
	let us = false;
	for (let index of offUsers) {
		if (index.id == req.body.id && index.name == req.body.name) {
			us = index;
		}
	}
	if (us) {
		let buli = true;
		for (let index of users) {
			if (index.id == us.id && index.name == us.name) {
				buli = false;
			}

		}
		if (buli) {
			users.push(us);
		}
		res.send({ data: us, error: false });
		res.end();
	} else {
		id++;
		let us = {
			name: req.body.name,
			points: 0,
			drawing: false,
			id: id
		};
		users.push(us);
		offUsers.push(us);
		startTimer();
		res.send({ data: us, error: true });
		res.end();
	}
	if (chat.length) {
		io.sockets.emit('chat', chat);
	}
	io.sockets.emit('whoDraw', { drawing: drawing, word: actualWord });
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
	let userId;
	console.log('Client connected');
	socket.on('login', function (data) {
		userId = data.id;
	});
	socket.on('users', function (data) {
		io.sockets.emit('users', users);
	});
	socket.on('chat', function (data) {
		chat.push({ name: data.name, data: data.data });
		if (chat.length > 20) {
			chat.splice(0, 1);
		}
		io.sockets.emit('chat', chat);
		if (data.data == actualWord) {
			for (let index of users) {
				if (index.id == userId && data.name == index.name) {
					index.points++;
					io.sockets.emit('users', users);
					chat.push({ data: index.name + " guess the word!" });
					io.sockets.emit('chat', chat);
					io.sockets.emit('whoDraw', whoDraw(index.name));
				}
			}
		}
	});
	socket.on('draw', function (data) {
		io.sockets.emit('draw', data);
	});
	socket.on('clearAll', function (data) {
		io.sockets.emit('clearAll', true);
	});
	socket.on('disconnect', function () {
		for (let i = 0; i < users.length; i++) {
			if (users[i].id == userId) {
				users.splice(i, 1);
			}
		}
		io.sockets.emit('users', users);
		console.log('Client disconnected');
	});
});

server.listen(port, function () {
	console.log('Server Started on port ' + port);
});