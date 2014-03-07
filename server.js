// ######################################################
// ......................SERVER..........................
// ######################################################

var http = require("http"),
	httpServer = http.createServer(handler),
	io = require("socket.io").listen(httpServer),
	fs = require("fs"),
	path = require("path"),
	extensions = {
		".html" : "text/html",
		".css" : "text/css",
		".js" : "application/javascript",
		".png" : "image/png",
		".gif" : "image/gif",
		".jpg" : "image/jpeg"
	};

httpServer.listen(9000);

function handler(req, res)
{
	var filename = path.basename(req.url) || "index.html",
		ext = path.extname(filename),
		dir = path.dirname(req.url).substring(1),
		localPath = __dirname + "/public/";
		
	if(extensions[ext])
	{
		localPath += (dir ? dir + "/" : "") + filename;
		fs.exists(localPath, function(exists)
		{
			if(exists)
			{
				getFile(localPath, extensions[ext],res);
			}
			else
			{
				res.writeHead(404);
				res.end();
			}
		});
	}
}

function getFile(localPath, mimeType, res)
{
	fs.readFile(localPath, function(err, contents)
	{
		if(!err)
		{
			res.writeHead(200, {
				"Content-Type" : mimeType,
				"Content-Length" : contents.length
			});
			res.end(contents);
		}
		else
		{
			res.writeHead(500);
			res.end();
		}
	});
}


// ######################################################
// .......................GAME...........................
// ######################################################

var Game = require("./public/js/game.js");

var gameID = 1,
	playerID = 0,
	games = [],
	players = [],
	groupName;
	
io.set("log level", 1);

io.sockets.on("connection", function (socket)
{
	playerID++;
	groupName = "Game" + gameID;
	socket.join(groupName);
	console.log("Player" + playerID + " connected");
	
	// Send playerID and gameID to Client
	socket.emit("IDs", { playerID : playerID, gameID : gameID });
	
	// Create a New Game
	if(typeof games[gameID] == "undefined")
	{
		games[gameID] = {};
		games[gameID].background = new Game.Background(500, 300, "black");
		games[gameID].ball = new Game.Ball(Game.CANVAS, 8, "white");
		
		console.log("Game" + gameID + " created");
	}
	
	// Add Player1 to Game
	if(typeof games[gameID].player1 == "undefined")
	{
		players[playerID] = new Game.Player(0, "red", "Player 1", gameID);
		games[gameID].player1 = players[playerID];
		
		console.log("Player" + playerID + " joined " + groupName);
	}
	
	// Add Player2 to Game
	else if(typeof games[gameID].player2 == "undefined")
	{
		players[playerID] = new Game.Player(Game.CANVAS.width - 20, "blue", "Player 2", gameID);
		games[gameID].player2 = players[playerID];
		
		console.log("Player" + playerID + " joined " + groupName);
		
		gameID++;
	}
	
	// Players and Games on Server
	//console.log("Number of Players: " + (players.length -1));
	//console.log("Number of Games: " + (games.length-1));
	
	// Delete Player On Disconnect
	
	// Close Game On Player-Disconnect
	
	// Receive Client Control Inputs
	socket.on("controls", function(data)
	{
		players[data.playerID].controls.up = data.up;
		players[data.playerID].controls.down = data.down;
	});
});


// Game Loop
setInterval(function()
{
	var groupName;
	
	for(i = 1; i < games.length; i++)
	{
		groupName = "Game" + i;
		
		// Move Ball
		if(typeof games[i].player2 != "undefined")
			games[i].ball.move(Game.STEP, Game.CANVAS);
		
		// Move Player1 (controls, canvas, step)
		games[i].player1.move(Game.controls, Game.CANVAS, Game.STEP);
		
		// Move Player2
		if(typeof games[i].player2 != "undefined")
			games[i].player2.move(Game.controls, Game.CANVAS, Game.STEP);
		
		// Player1 Blocks Ball
		games[i].player1.blockBall(games[i].ball);
		
		// Player2 Blocks Ball
		if(typeof games[i].player2 != "undefined")
			games[i].player2.blockBall(games[i].ball);
		
		// Increase Scores
		if(typeof games[i].player2 != "undefined")
			games[i].ball.increaseScore(games[i].player1, games[i].player2, Game.CANVAS);
		
		// Check Winner
		if(typeof games[i].player2 != "undefined")
		{
			games[i].player1.checkWinner();
			games[i].player2.checkWinner();
		}
		
		// Send Game Data to Groups
		io.sockets.in(groupName).emit("gameData", games[i]);
	}
}, Game.STEP * 1000);


