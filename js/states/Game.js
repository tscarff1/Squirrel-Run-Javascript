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
		this.BCHANCE = .005;
		this.BBOX =[5,5,5,5]

		this.SAMXRADIUS = this.game.width/2  +20;
		this.SAMYRADIUS = this.game.height-20;
	},

	create: function(){

		//Set up the sun and moon (MUST be first)
		this.setUpSAM();
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
		
		this.setupToon();
		this.setupDrink();
		this.setupEnemies();
		this.setupPhysics();
		
		//Now let's set up acorns
		this.acorns = this.add.group();
		//That was easy!
	
		//Has to go last so that the display is on top
		this.setupDisplay();
	},

	update: function(){
		this.updateHitboxes();

		this.updateScore();
		this.updateSAM();

		this.moleStarter();
		this.baseballStarter();
		this.mole.updateCrop();
		this.physics.arcade.collide(this.toon, this.botBound, this.landing, null, this);
		this.moveToon();
		

		//----- ACORN METHODS -----
		//Should we spawn acorns?
		this.acornSpawner();

		this.checkCollisions();

		//----- ENEMY STUFF -----
		if(this.baseball.position.x < this.game.width +10)
			this.baseball.angle--;

		

		if(this.toon.isHurt){
			if(this.HURTTIME > this.HURTTIMER){
				this.toon.isHurt = false;
				this.HURTTIME = 0;
				this.toon.animations.play('running');
			}
			this.HURTTIME++;
		}
	},

	/*// Comment this out when testing 'final' versions of game
	render: function(){
		game.debug.geom( this.toon.hitbox, 'rgba(255,0,0, .7)' ) ;
		game.debug.geom( this.moleEnemy.hitbox, 'rgba(0,255,0, .7)' ) ;
		game.debug.geom( this.baseball.hitbox, 'rgba(0,255,0, .7)' );
		
	},
*/
	//----- SETUP FUNCTIONS -----
	setupToon: function(){
		this.toon = this.add.sprite(0,0,'Play_TA', 'Toon_Running_1');
		this.toon.position.setTo(50,150);
		this.toon.animations.add('running', Phaser.Animation.generateFrameNames('Toon_Running_',1,3),3, true);
		this.toon.animations.add('jumping', 'Toon_Running_1', 2, true);
		this.toon.animations.play('running', 12, true);
		this.toon.isHurt = false;
		this.toon.isHyper = false;
	},

	setupDrink: function(){
		this.drink = this.add.sprite(0,0,'Play_TA','EnergyDrink');
		this.drink.scale.setTo(.6,.6);
		this.drink.angle = -20;
	},

	setupPhysics: function(){
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.physics.arcade.gravity.y = 800;
		this.physics.arcade.enable([this.toon, this.botBound]);
		this.toon.body.collideWorldBounds = true;
		this.toon.scale.setTo(.7,.7);
		this.toon.hitbox = new Phaser.Rectangle(this.TOONBOX[0], this.TOONBOX[1],
			this.toon.width - this.TOONBOX[2] ,this.toon.height - this.TOONBOX[3]);

		this.botBound.body.immovable = true;
		this.botBound.body.allowGravity = false;
	},

	setupDisplay: function(){
		var panel = this.add.sprite(0,0,'UI_TA', 'panel');
		panel.anchor.setTo(.5,.5);
		panel.position.setTo(this.stage.width/2 - panel.width/2, this.game.height/10);
		panel.scale.setTo(2.7,1.6);

		var hyperPanel = this.add.sprite(220,55,'UI_TA', 'Hyper Bar Panel');
		this.hyperBar = this.add.sprite(231, 58, 'UI_TA', 'Hyper Bar Meter');
		this.scoreText = this.add.bitmapText(220, 10, 'zantroke', 'Score: 0', 30);
	},

	setUpSAM: function(){
		this.sun = this.add.sprite(100,0,'Play_TA','sun');
		this.sun.anchor.x = .5;
		this.moon = this.add.sprite(0,0, 'Play_TA', 'moon');
		this.moon.anchor.x=.5;
		this.samAngle = 0;
	},

	setupEnemies: function(){
		this.enemies = this.add.group();
		this.setupMole();
		this.setupBaseball();
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
		this.moleEnemy.isReset = true;

		this.moleEnemy.hitbox = new Phaser.Rectangle(this.MOLEBOX[0] + this.moleEnemy.position.x,
			this.MOLEBOX[1] + this.BOTTOM -this.moleEnemy.height,
			this.moleEnemy.width - this.MOLEBOX[2], this.moleEnemy.height - this.MOLEBOX[3])

		this.moleCrop = new Phaser.Rectangle(0,0, this.mole.width, 10);
		//this.mole.crop(this.moleCrop);
		this.moleCropTween = this.add.tween(this.moleCrop).to({height: this.mole.height}, 2000);
	},

	setupBaseball: function(){
		this.baseball = this.add.sprite(0, 0, 'Play_TA', 'baseball');
		this.baseball.hitbox = new Phaser.Rectangle(this.baseball.position.x + this.BBOX[0],
													this.baseball.position.y + this.BBOX[1],
													this.baseball.width - this.BBOX[0] - this.BBOX[2],
													this.baseball.height - this.BBOX[1] - this.BBOX[3]);
		this.baseball.position.x = this.game.width+10;
		this.baseball.position.y = this.game.height/2- this.baseball.height;
		this.baseball.anchor.setTo(.5,.5);
		this.enemies.add(this.baseball);
		this.xOffset = 20 + Math.floor(Math.random() * 30);
		this.baseball.position.x = this.game.width + this.baseball.width + 20;
		this.baseball.position.y = this.game.height/2+20;
		this.baseball.isReset = true;
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
	acornSpawner: function(){
		if(Math.random() < this.ACORNCHANCE)
			this.spawnAcorn();
	},

	spawnAcorn: function(){
		var acornY = this.ACORNMINY + (Math.random() * (this.BOTTOM - this.ACORNMINY - 50));

		var acorn = this.add.sprite(this.game.width,acornY, 'Play_TA', 'acorn');
		acorn.scale.setTo(.75,.75);
		var travelTime = 3000 + Math.random() * 2000;
		//move the acorn across the stage
		var acornTween = this.add.tween(acorn).to({x: 0, y: acorn.position.y}, travelTime);
		acornTween.onComplete.add(function(){
			acorn.kill();
			this.acorns.remove(acorn);	
		}, this);
		acornTween.start();
		this.acorns.add(acorn);

	},

	//----- Update functions -----
	updateSAM: function(){
		//Makes the background darker as the sun goes down and lighter as it comes up
		//Note the three decimals:
		//1st: Larger this is, the lighter the sky will be overall, and the sky is darker when this is smaller
		//2nd: Larger = greater light range, smaller = less light range
		//3rd: Similar to the first
		var bgColorMod =(.95- (this.sun.position.y + this.game.height)/(2 * this.game.height)*.8) + .5;
		var g = Math.floor((parseInt('6f',16) * bgColorMod)).toString(16);
		var b = Math.floor((parseInt('e6',16) * bgColorMod)).toString(16);
		this.game.stage.backgroundColor = '#00' + g + b;
		this.sun.position.x = this.game.width/2 + Math.cos(this.samAngle * Math.PI/180) * this.SAMXRADIUS;
		this.sun.position.y = this.game.height + Math.sin(this.samAngle * Math.PI/180) * this.SAMYRADIUS;

		this.moon.position.x = (this.game.width/2 - this.sun.position.x) + this.game.width/2;
		this.moon.position.y = (this.game.height - this.sun.position.y) + this.game.height;
		this.samAngle-=.12;
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
		this.baseball.hitbox.x = this.baseball.position.x + this.BBOX[0] -  this.baseball.width/2;
		this.baseball.hitbox.y = this.baseball.position.y + this.BBOX[1] - this.baseball.height/2;
	},

	checkCollisions: function(){
		//Check for enemy collisions
		this.enemies.forEach(function(enemy){
				if(Phaser.Rectangle.intersects(this.toon.hitbox, enemy.hitbox)){
					if(enemy == this.moleEnemy)
						this.resetMole();
					else if(enemy == this.baseball)
						this.resetBaseball();
					this.toon.animations.stop(null, true);
					this.toon.frameName = 'Toon_Tripping';
					this.toon.isHurt = true;
				}
		}.bind(this));

		//check for acorn collisons
		this.acorns.forEach(function(item){
			if(Phaser.Rectangle.intersects(this.toon.hitbox, item)){
				this.scoreMult++;
				item.destroy();
			}
		}.bind(this));
	},

	//----- ENEMY FUNCTIONS -----
	resetMole: function() {
		if(this.moleEnemy.moveTween != undefined)
			this.moleEnemy.moveTween.stop();
		this.moleEnemy.position.x = 0;
		this.moleEnemy.isReset = true;
		//this.moleCrop.height = 0;
		
	},

	moleStarter:function(){
		if(Math.random() < this.MOLECHANCE && this.moleEnemy.isReset == true){
			this.moleEnemy.isReset = false;
			this.moleEnemy.moveTween = this.add.tween(this.moleEnemy).to({x:-1 * (this.game.width + this.mole.width + 100)}, this.ROADSPEED);
			this.moleEnemy.moveTween.onComplete.add(this.resetMole, this);
			this.moleEnemy.moveTween.start();
		}
	},

	baseballStarter: function(){
		if(Math.random() < this.BCHANCE && this.baseball.isReset == true){
			console.log("starting baseball");
			this.baseball.isReset = false;

			this.baseball.moveTime = this.ROADSPEED + Math.floor(Math.random() * 400)-200;
			this.baseball.xTween = this.add.tween(this.baseball).to({x:0}, this.ROADSPEED);
			this.baseball.xTween.onComplete.add(this.resetBaseball, this);
			this.baseball.xTween.start();
			
			this.baseball.yTween = this.add.tween(this.baseball).to({y: [this.BOTTOM - this.baseball.height/2,this.game.height/2 +20]}, 
				1000,"Sine.easeInOut", true, 0 ,-1);
			this.baseball.yTween.start();
		}
	},

	resetBaseball: function(){	
		this.baseball.xTween.stop();
		this.baseball.yTween.stop();
		this.xOffset = 20 + Math.floor(Math.random() * 30);
		
		this.baseball.position.y = this.game.height/2+20;
		this.baseball.position.x = this.game.width + this.baseball.width + 20;
		this.baseball.isReset = true;
	},

};