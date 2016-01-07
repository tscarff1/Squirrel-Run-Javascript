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
		
		this.TOONBOX = [30,30,50,40];
		this.TOONSPEED = 150;
		this.canJump = false;

		this.HURTTIME = 0;
		this.HURTTIMER = 100;
		
		this.HYPERTIME = 0;
		this.HYPERTIMER = 150

		this.ACORNCHANCE = .005;
		this.ACORNMINY = this.game.height/2;
		
		this.MOLECHANCE = 0.05;
		this.MOLEBOX = [10,20,20,10];
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
		this.toon.isHurt = false;
		this.toon.isHyper = false;
		
		this.setupEnemies();

		//set up physics
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.physics.arcade.gravity.y = 800;
		this.physics.arcade.enable([this.toon, this.botBound]);
		this.toon.body.collideWorldBounds = true;
		this.toon.scale.setTo(.7,.7);
		this.toon.hitbox = new Phaser.Rectangle(this.TOONBOX[0], this.TOONBOX[1],
			this.toon.width - this.TOONBOX[2] ,this.toon.height - this.TOONBOX[3]);

		

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

		var hyperPanel = this.add.sprite(250,55,'UI_TA', 'Hyper Bar Panel');
		this.hyperBar = this.add.sprite(261, 58, 'UI_TA', 'Hyper Bar Meter');
		this.scoreText = this.add.bitmapText(250, 10, 'zantroke', 'Score: 0', 30);
	},

	update: function(){
		this.updateHitboxes();

		this.updateScore();
		this.moleStarter();
		this.mole.updateCrop();
		//console.log(this.score);
		this.physics.arcade.collide(this.toon, this.botBound, this.landing, null, this);
		this.moveToon();
		

		//----- ACORN METHODS -----
		//Should we spawn acorns?
		if(Math.random() < this.ACORNCHANCE)
			this.spawnAcorn(this);
		//check for acorn collisons
		this.acorns.forEach(function(item){
			if(Phaser.Rectangle.intersects(this.toon.hitbox, item)){
				this.scoreMult++;
				item.destroy();
			}
		}.bind(this));

		//Check for enemy collisions
		this.enemies.forEach(function(enemy){
				if(Phaser.Rectangle.intersects(this.toon.hitbox, enemy.hitbox)){
					this.resetMole();
					this.toon.animations.stop(null, true);
					this.toon.frameName = 'Toon_Tripping';
					this.toon.isHurt = true;
				}
		}.bind(this));

		if(this.toon.isHurt){
			if(this.HURTTIME > this.HURTTIMER){
				this.toon.isHurt = false;
				this.HURTTIME = 0;
				this.toon.animations.play('running');
			}
			this.HURTTIME++;
		}
		//console.log(this.moleEnemy.getBounds());
	},

	// Comment this out when testing 'final' versions of game
	render: function(){
		game.debug.geom( this.toon.hitbox, 'rgba(255,0,0, .7)' ) ;
		game.debug.geom( this.moleEnemy.hitbox, 'rgba(0,255,0, .7)' ) ;
		
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

		this.moleEnemy.hitbox = new Phaser.Rectangle(this.MOLEBOX[0] + this.moleEnemy.position.x,
			this.MOLEBOX[1] + this.BOTTOM -this.moleEnemy.height,
			this.moleEnemy.width - this.MOLEBOX[2], this.moleEnemy.height - this.MOLEBOX[3])

		this.moleCrop = new Phaser.Rectangle(0,0, this.mole.width, 10);
		//this.mole.crop(this.moleCrop);
		this.moleCropTween = this.add.tween(this.moleCrop).to({height: this.mole.height}, 2000);
	
	},

	// ----- TOON BASED FUNCTIONS -----
	//Called when toon collides with the ground
	landing: function(toon, ground){
		if(!this.canJump){
			this.canJump = true;
			//Only play the running animation if toon isn't hurt!
			if(!this.toon.isHurt)
				this.toon.animations.play('running');
		}
	},

	//runs on update
	moveToon: function(){
		this.toon.body.velocity.x = 0;
		//Don't other with any input if toon is hurt
		if(!this.toon.isHurt){
			//JUMPBUTTON is defined as Space bar in preload
			if(this.JUMPBUTTON.isDown && this.canJump){
				this.toon.body.velocity.y = -400 //arbitrary, changed as needed
				this.canJump = false;
				this.toon.animations.stop(null, true);
			}

			if(this.CURSORS.left.isDown){
				this.toon.body.velocity.x = -1 * this.TOONSPEED;
			}
			else if(this.CURSORS.right.isDown){
				this.toon.body.velocity.x = this.TOONSPEED;
			}
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

	updateHitboxes: function(){
		this.toon.hitbox.x = this.toon.position.x + this.TOONBOX[0];
		this.toon.hitbox.y = this.toon.position.y + this.TOONBOX[1];
		this.moleEnemy.hitbox.x = this.moleEnemy.position.x + this.MOLEBOX[0] + this.game.width;
	},

	//Enemy Functions
	//----- Mole Functions -----
	resetMole: function() {
		this.moleEnemy.moveTween.stop();
		this.moleEnemy.position.x = 0;

		//this.moleCrop.height = 0;
		
	},

	moleStarter:function(){
		if(Math.random() < this.MOLECHANCE && this.moleEnemy.position.x >= 0){
			this.moleEnemy.moveTween = this.add.tween(this.moleEnemy).to({x:-1 * (this.game.width + this.mole.width + 100)}, this.ROADSPEED);
			this.moleEnemy.moveTween.onComplete.add(this.resetMole, this);
			this.moleEnemy.moveTween.start();
		}
	}

};