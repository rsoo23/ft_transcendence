import { postRequest } from './network_utils/api_requests.js';

const INPUTS = {
	38: 'moveUp',
	40: 'moveDown',
};
var socket = null;
var matchID = null;
var connected = false;

async function createMatch() {
	const player1_uuid = document.getElementById('player1').value;
	const player2_uuid = document.getElementById('player2').value;
	const response = await postRequest('/pong/create_match/', {
		'player1_uuid': player1_uuid,
		'player2_uuid': player2_uuid,
	});
	if (!response['success'])
		return;

	matchID = response['match_id'];
	document.getElementById('matchid').textContent = `${matchID}`;
}

function connectToWebsocket() {
	if (socket != undefined)
		socket.close();

	socket = new WebSocket('ws://localhost:8000/ws/pong?test=true');
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

		document.getElementById('websocket').onclick = connectToWebsocket;
		document.getElementById('testmatch').onclick = createMatch;
		console.log("this is working yes");
	}
);
