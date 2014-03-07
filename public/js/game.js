Game = {};

// GAME VARIABLES .......................................
Game.STEP = 0.033;
Game.DELTA;
Game.FPS;
Game.message;

Game.CANVAS = {
	width : 500,
	height : 300
};

Game.controls = {
	up : false,
	down : false
};

// BACKGROUND ...........................................
(function(){
	function Background(width, height, color)
	{
		this.width = width;
		this.height = height;
		this.color = color;
	}
	
	Background.prototype.draw = function(ctx)
	{
		ctx.save();
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.width, this.height);
		ctx.restore();
	};
	
	Background.prototype.clearAll = function(ctx, canvas)
	{
		ctx.save();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.restore();
	};
	
	Game.Background = Background;
})();


// PLAYER ...............................................
(function(){
	function Player(x, color, name, gameID)
	{
		this.x = x;
		this.y = 100;
		this.color = color;
		
		this.width = 20;
		this.height = 100;
		
		this.speed = 240; // px per second
		this.score = 0;
		this.name = name;
		
		this.controls = {
			up : false,
			down : false
		};
		
		this.defaultX = this.x;
		this.defaultSpeed = this.speed;
		
		this.gameWon = false;
		
		this.gameID = gameID;
	}
	
	Player.prototype.reset = function()
	{
		this.x = this.defaultX;
		this.y = 100;
		this.height = 100;
		this.speed = this.defaultSpeed;
	};
	
	Player.prototype.clientUpdate = function(y, height, score, gameWon)
	{
		this.y = y;
		this.height = height;
		this.score = score;
		this.gameWon = gameWon;
	};
	
	Player.prototype.remove = function()
	{
		this.gameID = null;
	}

	Player.prototype.draw = function(ctx)
	{
		ctx.save();
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.restore();
	};
	
	Player.prototype.move = function(controls, canvas, step)
	{
		if(this.controls.up === true)
			this.y -= this.speed * step;
		if(this.controls.down === true)
			this.y += this.speed * step;
		
		if(this.y < 0)
			this.y = 0;
		if(this.y + this.height > canvas.height)
			this.y = canvas.height - this.height;
	};
	
	Player.prototype.blockBall = function(ball)
	{
		// Player1 (left)
		if(this.x === 0)
		{
			if(this.x + this.width >= ball.x - ball.radius
			   && ball.y + ball.radius >= this.y
			   && ball.y - ball.radius <= this.y + this.height)
			{
				ball.x = this.x + this.width + ball.radius + 1;
				ball.speedX *= -1;
				//ball.speedX += 1;
				//ball.speedY += 1;
				this.height -= 4;
			}
		}
		
		// Player2 (right)
		else
		{
			if(this.x <= ball.x + ball.radius
			   && ball.y + ball.radius >= this.y
			   && ball.y - ball.radius <= this.y + this.height)
			{
				ball.x = this.x - ball.radius - 1;
				ball.speedX *= -1;
				//ball.speedX -= 1;
				//ball.speedY -= 1;
				this.height -= 4;
			}
		}
	};
	
	Player.prototype.checkWinner = function()
	{
		if(this.score === 3)
		{
			this.gameWon = true;
			Game.message = this.name + " won the game!<br><br><a href=\"index.html\">Play again</a>";
		}
	};
	
	Player.prototype.showWinner = function(scoreDiv, canvas, fpsDiv)
	{		
		if(this.gameWon === true)
		{
			var winnerMsgDiv = document.createElement("div");
			winnerMsgDiv.id = "winner";
			winnerMsgDiv.innerHTML = Game.message;
			
			scoreDiv.parentNode.removeChild(scoreDiv);
			canvas.parentNode.removeChild(canvas);
			fpsDiv.parentNode.removeChild(fpsDiv);
			
			document.getElementsByTagName("body")[0].appendChild(winnerMsgDiv);
		}
	};
	
	Game.Player = Player;
})();


// BALL ....................................................
(function(){
	function Ball(canvas, radius, color)
	{
		this.x = canvas.width / 2;
		this.y = canvas.height / 2;
		this.radius = radius;
		this.color = color;
		this.speedX = 135; //270; // px per second
		this.speedY = 90; //180; // px per second
		this.direction = 1;
		
		this.defaultX = this.x;
		this.defaultY = this.y;
		this.defaultSpeedX = this.speedX;
		this.defaultSpeedY = this.speedY;
	}
	
	Ball.prototype.reset = function()
	{
		this.x = this.defaultX;
		this.y = this.defaultY;
		this.speedX = this.defaultSpeedX * this.direction;
		this.speedY = this.defaultSpeedY * this.direction;
	};
	
	Ball.prototype.clientUpdate = function(x, y, speedX, speedY, direction)
	{
		this.x = x;
		this.y = y;
		this.speedX = speedX; // px per second
		this.speedY = speedY; // px per second
		this.direction = direction;
	};
	
	Ball.prototype.draw = function(ctx)
	{
		ctx.save();
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.restore();
	};
	
	Ball.prototype.move = function(step, canvas)
	{
		this.x += this.speedX * step;
		this.y += this.speedY * step;
		
		if(this.x < this.radius)
			this.speedX *= -1;
		if(this.x + this.radius > canvas.width)
			this.speedX *= -1;
			
		if(this.y < this.radius)
			this.speedY *= -1;
		if(this.y + this.radius > canvas.height)
			this.speedY *= -1;
	};
	
	Ball.prototype.increaseScore = function(player1, player2, canvas)
	{
		// Player 1 (left) scores
		if(this.x + this.radius >= canvas.width)
		{
			player1.score += 1;
			this.direction *= -1;
			
			this.reset();
			player1.reset();
			player2.reset();
		}
		
		// Player 2 (right) scores
		if(this.x - this.radius <= 0)
		{
			player2.score += 1;
			this.direction *= -1;
			
			this.reset();
			player1.reset();
			player2.reset();
		}
	};
	
	Game.Ball = Ball;
})();


// EXPORT MODULE ...........................................
module.exports = Game;





















