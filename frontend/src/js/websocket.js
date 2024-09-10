const INPUTS = {
	38: 'moveUp',
	40: 'moveDown',
};
var socket = null;
var playerid = null;
var connected = false;

function connectToWebsocket() {
	if (socket != undefined)
		socket.close();

	socket = new WebSocket('ws://localhost:8000/ws/pong');
	socket.addEventListener('message', (e) => {
		console.log(e.data);
	});
}

function keyUpHandler(e) {
	if (e.repeat || !(e.keyCode in INPUTS))
		return;

	socket.send(JSON.stringify({
		'type': `+${INPUTS[e.keyCode]}`,
		'user': `${document.getElementById('user').value}`,
	}));
}

function keyDownHandler(e) {
	if (e.repeat || !(e.keyCode in INPUTS))
		return;

	socket.send(JSON.stringify({
		'type': `-${INPUTS[e.keyCode]}`,
		'user': `${document.getElementById('user').value}`,
	}));
}

document.addEventListener(
	'DOMContentLoaded',
	() => {
		document.addEventListener('keydown', keyUpHandler);
		document.addEventListener('keyup', keyDownHandler);
	}
);
