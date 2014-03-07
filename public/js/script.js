// ######################################################
// ...................CLIENT GAME........................
// ######################################################

var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"),
	scoreDiv = document.getElementById("score"),
	fpsDiv = document.getElementById("fps"),
	background = new Game.Background(500, 300, "black"),
	ball = new Game.Ball(Game.CANVAS, 8, "white"),
	player1 = new Game.Player(0, "red", "Player 1", gameID),
	player2 = new Game.Player(Game.CANVAS.width - 20, "blue", "Player 2", gameID),
	player2exists = false,
	timeLast = 0;

canvas.width = Game.CANVAS.width;
canvas.height = Game.CANVAS.height;


// DRAW GAME ............................................
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
function drawAll(timestamp)
{
	background.clearAll(ctx, canvas);

	// Background, Ball, Players
	background.draw(ctx);
	ball.draw(ctx);
	player1.draw(ctx);
	
	if(player2exists === true)
		player2.draw(ctx);
	
	// Show Score
	scoreDiv.innerHTML = player1.score + " : " + player2.score;
	
	// Calculate FPS
	Game.DELTA = timestamp - timeLast;
	Game.FPS = 1000 / Game.DELTA;
	timeLast = timestamp;
	
	// Check Winner
	player1.checkWinner();
	if(player2exists === true)
		player2.checkWinner();
	
	// Show Winner
	player1.showWinner(scoreDiv, canvas, fpsDiv);
	if(player2exists === true)
		player2.showWinner(scoreDiv, canvas, fpsDiv);
	
	// Loop
	requestAnimationFrame(drawAll);
}
requestAnimationFrame(drawAll);

// Show FPS
setInterval(function()
{
	fpsDiv.innerHTML = "FPS: " + Math.round(Game.FPS);
}, 200);


// EVENT LISTENERS ......................................
window.addEventListener("keydown", function(e){
	switch(e.keyCode)
	{
		case 38: // up arrow
			Game.controls.up = true;
			break;
		case 40: // down arrow
			Game.controls.down = true;
			break;
	}
}, false);

window.addEventListener("keyup", function(e){
	switch(e.keyCode)
	{
		case 38: // up arrow
			Game.controls.up = false;
			break;
		case 40: // down arrow
			Game.controls.down = false;
			break;
	}
}, false);


// ######################################################
// ..................CLIENT SOCKET.......................
// ######################################################

var socket = io.connect("http://node.brutussmash.com");

var playerID,
	gameID;

// GAME & PLAYER IDs ....................................
socket.on("IDs", function(data)
{
	playerID = data.playerID;
	gameID = data.gameID;
	console.log("Player" + playerID + " - Game" + gameID);
});

// UPDATE ...............................................
socket.on("gameData", function(data)
{
	player1.clientUpdate(data.player1.y, data.player1.height, data.player1.score, data.player1.gameWon);
	
	if(typeof data.player1 != "undefined" && typeof data.player2 != "undefined")
	{
		player2exists = true;
		
		ball.clientUpdate(data.ball.x, data.ball.y, data.ball.speedX, data.ball.speedY, data.ball.direction);
		player1.clientUpdate(data.player1.y, data.player1.height, data.player1.score, data.player1.gameWon);
		player2.clientUpdate(data.player2.y, data.player2.height, data.player2.score, data.player2.gameWon);
	}
});

// Send Control Inputs to Server
setInterval(function()
{
	socket.emit("controls", { playerID : playerID , up : Game.controls.up, down : Game.controls.down } );
}, 333);












