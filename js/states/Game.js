"use strict"
BasicGame.Game = function(game){
	
}

BasicGame.Game.prototype = {
	preload: function(){
		this.score = 0;
		this.scoreTime = 0;
		this.scoreMult = 1;
		this.SCORETIMER = 10;
		this.ROADSPEED = 8000;
		this.ROADHEIGHT = 3*this.game.height/5;
		this.BOTTOM = 7*this.game.height/8;
		this.CURSORS = this.game.input.keyboard.createCursorKeys();
		this.JUMPBUTTON = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.canJump = false;
		this.TOONSPEED = 150;
		this.ACORNCHANCE = .005;
		this.ACORNMINY = this.game.height/2;

		
	},

	create: function(){
		

		//draw the background
		//--- Road ---
		var graphics = this.add.graphics(0, 0);

    	graphics.moveTo(0,this.ROADHEIGHT);
	    graphics.beginFill(0x333333);
	    graphics.lineTo(0, this.game.stage.height);
	    graphics.lineTo(this.game.stage.width, this.game.stage.height);
	    graphics.lineTo(this.game.stage.width, this.ROADHEIGHT);
	    
	    graphics.endFill();
	    
	    var botGraphics = this.add.graphics(0,0);
	    botGraphics.moveTo(0, this.BOTTOM);
	    botGraphics.lineStyle(1,0xffffff,1);
	    botGraphics.lineTo(this.game.width, this.BOTTOM);

	    this.botBound = this.add.sprite(0, this.BOTTOM, botGraphics.generateTexture());



		//Set up toon
		this.toon = this.add.sprite(0,0,'Play_TA', 'Toon_Running_1');
		this.toon.position.setTo(50,150);
		this.toon.animations.add('running', Phaser.Animation.generateFrameNames('Toon_Running_',1,3),3, true);
		this.toon.animations.add('jumping', 'Toon_Running_1', 2, true);
		this.toon.animations.play('running', 12, true);
		this.toon.scale.setTo(.7,.7);

		this.setupEnemies();

		//set up physics
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.physics.arcade.gravity.y = 800;
		this.physics.arcade.enable([this.toon, this.botBound]);
		this.toon.body.collideWorldBounds = true;
		
		this.botBound.body.immovable = true;
		this.botBound.body.allowGravity = false;


		//Now let's set up acorns
		this.acorns = this.add.group();
		//That was easy!
	
		//place the Display stuff
		var panel = this.add.sprite(0,0,'UI_TA', 'panel');
		panel.anchor.setTo(.5,.5);
		panel.position.setTo(6*this.stage.width/11 - panel.width/2, this.game.height/10);
		panel.scale.setTo(2.7,1.6);

		this.scoreText = this.add.bitmapText(250, 10, 'zantroke', 'Score: 0', 30);
	},

	update: function(){
		this.updateScore();
		this.mole.updateCrop();
		//console.log(this.score);
		this.physics.arcade.collide(this.toon, this.botBound, this.landing, null, this);
		this.moveToon();
		

		//----- ACORN METHODS -----
		//Should we spawn acorns?
		if(Math.random() < this.ACORNCHANCE)
			this.spawnAcorn(this);
		//check for acorn collisons
		var self = this;
		this.acorns.forEach(function(item){
			if(Phaser.Rectangle.intersects(self.toon, item)){
				self.scoreMult++;
				item.destroy();
			}
		});

		//Check for enemy collisions
	},

	//----- Setup Functions -----
	setupEnemies: function(){
		this.enemies = this.add.group();
		this.setupMole();

	},

	setupMole: function(){
		this.mole = this.add.sprite(this.game.width,this.BOTTOM,'Play_TA', 'MoleEnemy');
		this.dirt = this.add.sprite(this.game.width,0,'Play_TA', 'MoleDirt');
		this.mole.position.y = this.BOTTOM - this.mole.height;
		this.dirt.position.y = this.BOTTOM - this.dirt.height;
	
		this.moleEnemy = this.add.group();
		this.moleEnemy.add(this.mole);
		this.moleEnemy.add(this.dirt);
		this.enemies.add(this.moleEnemy);

		this.moleCrop = new Phaser.Rectangle(0,0, this.mole.width, 10);
		//this.mole.crop(this.moleCrop);
		this.moleCropTween = this.add.tween(this.moleCrop).to({height: this.mole.height}, 2000);
		this.moleTween = this.add.tween(this.moleEnemy).to({x:-1 * (this.game.width + this.mole.width + 100)}, this.ROADSPEED);
		this.moleTween.onComplete.add(this.resetMole, this);
		this.resetMole();
	},

	// ----- TOON BASED FUNCTIONS -----
	landing: function(toon, ground){
		if(!this.canJump){
			this.canJump = true;
			this.toon.animations.play('running');
		}
	},


	moveToon: function(){
		if(this.JUMPBUTTON.isDown && this.canJump){
			this.toon.body.velocity.y = -400
			this.canJump = false;
			this.toon.animations.stop(null, true);
		}

		this.toon.body.velocity.x = 0;
		if(this.CURSORS.left.isDown){
			this.toon.body.velocity.x = -1 * this.TOONSPEED;
		}
		else if(this.CURSORS.right.isDown){
			this.toon.body.velocity.x = this.TOONSPEED;
		}
	},

	//----- ACORN FUNCTIONS -----
	spawnAcorn: function(self){
		var acornY = self.ACORNMINY + (Math.random() * (this.BOTTOM - self.ACORNMINY - 50));

		var acorn = self.add.sprite(self.game.width,acornY, 'Play_TA', 'acorn');
		acorn.scale.setTo(.75,.75);
		var travelTime = 3000 + Math.random() * 2000;
		//move the acorn across the stage
		var acornTween = this.add.tween(acorn).to({x: 0, y: acorn.position.y}, travelTime);
		acornTween.onComplete.add(function(){
			acorn.kill();
			self.acorns.remove(acorn);	
		}, this);
		acornTween.start();
		self.acorns.add(acorn);

	},

	updateScore: function(){
		if(this.scoreTime >= this.SCORETIMER){
			this.score += 1 * this.scoreMult;
			this.scoreText.text = "Score: " + this.score;
			this.scoreTime = 0;	
		}
		else{
			this.scoreTime++;
		}

	},

	//Enemy Functions
	//----- Mole Functions -----
	resetMole: function() {
		this.moleEnemy.position.x = 0;
		//this.moleCrop.height = 0;
		this.moleTween.start();
		this.moleCropTween.start();
	}

};