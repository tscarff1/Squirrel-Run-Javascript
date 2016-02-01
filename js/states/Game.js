"use strict"
BasicGame.Game = function(game){
	
}

BasicGame.Game.prototype = {
	preload: function(){
	/*Score related Stuff*/
		this.score = 0;
		this.scoreTime = 0;
		this.scoreMult = 1;
		this.SCORETIMER = 10;
		this.DECAYTIMER = 300;
		this.decayTime = 0;
		
	/* Road related stuff */
		this.ROADSPEED = 8000;
		this.ROADHEIGHT = 3*this.game.height/5;
		this.BOTTOM = 7*this.game.height/8;
		
		this.CURSORS = this.game.input.keyboard.createCursorKeys();
		this.JUMPBUTTON = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.PAUSEBUTTON = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
		
	/* Toon stats n' stuff*/
		this.TOONBOX = [30,30,50,40];
		this.TOONSPEED = 150;
		this.canJump = false;
		this.HURTTIME = 0;
		this.HURTTIMER = 90;
		this.HYPERTIME = 0;
		this.HYPERTIMER = 300;
		this.HYPERMOVEMENT = 2;
		this.HYPERJUMP = 1.3;

	// Bonus related stuff
		this.ACORNCHANCE = .005;
		this.ACORNMINY = this.game.height/2;
		this.acornsCollected = 0;
		this.DRINKCHANCE = .3;
		this.DRINKSPEED = 5000;

	//Enemy related stuff
		this.ENEMYDELAY = 200;
		this.enemyTimer = 0;
		this.enemySpawned = false;
		this.MOLECHANCE = 0.005;
		this.MOLEHEIGHT;
		this.MOLEBOX = [15,20,30,10];
		this.MOLEPOPDIST = 150;
		this.BCHANCE = .002;
		this.BBOX =[5,5,5,5];
		this.BSPEED=7000;
		this.CROWCHANCE = .008;
		this.CROWBOX = [30,20,75,30];
		this.CROWTWEENCHANCES = [.5, .3, .2];
		this.CROWSCALE = .7;
		this.CARCHANCE =.05;
		this.CARBOX = [10,80,10,0];
		this.CARBOX1 = [10,50,20,120];

	//Background stuff
		this.SAMXRADIUS = this.game.width/2  +20;
		this.SAMYRADIUS = this.game.height-20;
		this.SLOWCLOUDTIME = 10000;
		this.FASTCLOUDTIME = 3000;

	//Winter stuff
		this.winterDistance = 1000;
		this.winterMax = 200;
		this.winterPadding = 80;
		this.winterSpeed = .5;
		this.cautionX = 10;

		//Sound stuff
		this.musicEnabled = true;
		this.soundEnabled = true;
		this.music = this.add.audio('Game Theme',.9);
		this.popSound = this.add.audio('Pop');
		this.owSound = this.add.audio('Ow');
		this.yihooSound = this.add.audio('Yihoo');
		this.boingSound = this.add.audio('Boing');
		this.slideSound = this.add.audio('Slide');
		this.crashSound = this.add.audio('Crash');
		this.engineSound = this.add.audio('Engine',.7);
		this.honkSound = this.add.audio('Honk',.7);
		this.windSound = this.add.audio('Wind');
		this.paused = false;

		game.load.image('ground', 'assets/images/hills.png');	},

	create: function(){
		this.sprites = this.add.group();
		//Set up the sun and moon (MUST be first)
		this.setUpSAM();
		this.setupClouds();
		
		//draw the background
		this.hills = this.add.tileSprite(0, this.game.height/2 +100, 800, 100,'ground');
		this.sprites.add(this.hills);
	    var botGraphics = this.add.graphics(0,0);
	    botGraphics.moveTo(0, this.BOTTOM);
	    botGraphics.lineStyle(1,0xffffff,1);
	    botGraphics.lineTo(this.game.width, this.BOTTOM);
	  	this.botBound = this.add.sprite(0, this.BOTTOM, botGraphics.generateTexture());

	  	var graphics = this.add.graphics(0, 0);	
		graphics.moveTo(0,this.BOTTOM+1);
	    graphics.beginFill(0x333333);
	    graphics.lineTo(0, this.game.stage.height);
	    graphics.lineTo(this.game.stage.width, this.game.stage.height);
	    graphics.lineTo(this.game.stage.width, this.BOTTOM);
	    
	    graphics.endFill();
	    graphics.moveTo(0,0);
	    botGraphics.destroy();
		this.sprites.add(this.botBound);
		this.sprites.add(graphics);
		this.setupTree();

		this.setupToon();
		this.setupDrink();
		this.setupEnemies();
		this.setupPhysics();
		
		//Now let's set up acorns
		this.sprites.acorns = this.add.group();
		//That was easy!

		//Must be second to last!
		this.setupWinter();

		//Has to go last so that the display is on top
		this.setupDisplay();

		this.startGame();

		this.startBtn = this.game.add.button(0,0, 'UI_TA', this.togglePause, this, 'button', 'button', 'button');
		this.startBtn.position.x = this.game.width - this.startBtn.width - 10;
		this.startBtn.position.y = 10;

		this.startTxt = this.add.bitmapText(this.startBtn.position.x+this.startBtn.width/2 - 5, 
			this.startBtn.position.y + this.startBtn.height/2, 'zantroke', 'PAUSE', 30);
        this.startTxt.anchor.setTo(.5,.5);
        this.startTxt.tint = 0xff0000;

	},

	startGame: function(){
		//Sound stuff on the other hand can go whereever
		this.music.loop = true;
		this.music.play();
	},

	update: function(){
		if(!this.paused){
			this.hills.tilePosition.x -= .5;
			this.updateHitboxes();

			this.updateScore();
			this.updateSAM();
			this.updateWinter();

			this.physics.arcade.collide(this.toon, this.botBound, this.landing, null, this);
			this.moveToon();
			this.updateHyper();

			//this.moleStarter();
			//this.baseballStarter();
			//this.crowStarter();
			this.spawnEnemies();
			this.carStarter();

			//Make the mole pop out of the ground as needed
			
			if(this.moleEnemy.position.x + this.game.width - (this.toon.position.x  + this.toon.width) <= this.MOLEPOPDIST
			 && this.mole.position.y > this.BOTTOM - this.MOLEHEIGHT
			 && !this.mole.hasHit){
			 	this.mole.cropRect.height += 2;
				this.mole.position.y -= 2;
			}

			if(!this.mole.isReset){
				this.mole.updateCrop();
			}

			this.acornSpawner();
			this.drinkSpawner();
			this.checkCollisions();

			//----- ENEMY STUFF -----
			if(this.baseball.position.x < this.game.width +10)
				this.baseball.angle--;
			
			this.updateDeer();

			if(this.toon.isHurt){
				if(this.HURTTIME > this.HURTTIMER + this.score/1000){
					this.toon.isHurt = false;
					this.HURTTIME = 0;
					this.toon.animations.play('running');
				}
				this.HURTTIME++;
			}
		}
	},

/*	// Comment this out when testing 'final' versions of game
	render: function(){
		game.debug.geom( this.toon.hitbox,     'rgba(255,0,0, .7)');
		game.debug.geom( this.moleEnemy.hitbox,'rgba(0,255,0, .7)');
		game.debug.geom( this.baseball.hitbox, 'rgba(0,255,0, .7)');
		game.debug.geom( this.crow.hitbox,     'rgba(0,255,0, .7)');
		game.debug.geom( this.car.hitbox,      'rgba(0,255,0, .7)');
		game.debug.geom( this.car.goodbox,     'rgba(0,0,255, .7)');
	},	
*/
	//----- SETUP FUNCTIONS -----
	setupToon: function(){
		this.toon = this.add.sprite(0,0,'Play_TA', 'Toon_Running_1');
		this.toon.position.setTo(50,250);
		this.toon.animations.add('running', Phaser.Animation.generateFrameNames('Toon_Running_',1,3),3, true);
		this.toon.animations.add('jumping', 'Toon_Running_1', 2, true);
		this.toon.animations.add('riding', 'Toon_Sitting_1', 2, true);
		this.toon.animations.play('running', 12, true);
		this.toon.isHurt = false;
		this.toon.isHyper = false;
		this.toon.isRiding = false;
	},

	setupDrink: function(){
		this.drink = this.add.sprite(this.game.width + 50,250,'Play_TA','EnergyDrink');
		this.drink.isReset = true;
		this.drink.scale.setTo(.6,.6);
		this.drink.angle = -20;
		this.drink.anchor.setTo(.5,.5);
		this.drinkglow = this.add.sprite(this.game.width + 50,250, 'Play_TA', 'EnergyDrink');
		this.drinkglow.anchor.setTo(.5,.5);
		this.drinkglow.alpha = .7;
		this.drinkglow.scale.setTo(.61,.61);
		this.glowtween = this.add.tween(this.drinkglow.scale).to({x: .75, y:.75}, 800, Phaser.Easing.Linear.Out, true, 0, Number.MAX_VALUE, true);
		//this.glowtween.yoyo(true, 0);
		this.drinkglow.angle = -20;
		this.drinkglow.tint = 0xF2FF00
		this.drinkglow.blendMode = PIXI.blendModes.ADD;

		this.sprites.add(this.drink);
		this.sprites.add(this.drinkglow);
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
		panel.position.setTo(this.stage.width/2 - 4 *  panel.width, this.game.height/10);
		panel.scale.setTo(2.7,1.6);

		var hyperPanel = this.add.sprite(220,55,'UI_TA', 'Hyper Bar Panel');
		this.hyperBar = this.add.sprite(231, 58, 'UI_TA', 'Hyper Bar Meter');
		this.hyperBar.MAXWIDTH = this.hyperBar.width;
		this.hyperBar.width = 1;
		this.scoreText = this.add.bitmapText(220, 10, 'zantroke', 'Score: 0', 30);

		var acornBG = this.add.sprite(510,10,'Play_TA', 'acorn');
		acornBG.angle = 40;
		acornBG.scale.setTo(1.2,1.2);
		acornBG.tint = 0x888888;
		acornBG.alpha = .6;
		
		this.acornDisplay = this.add.sprite(510,10,'Play_TA','acorn');
		this.acornDisplay.angle = 40;
		this.acornDisplay.scale.setTo(1.2,1.2);
		this.acornDisplay.tint = 0xeeeeee;
		 //	A mask is a Graphics object
	    this.acornMask = game.add.graphics(0, 0);
    	this.acornMask.beginFill(0xffffff);
    	this.acornMask.drawRect(485,10, this.acornDisplay.width + 10, 155);
  		this.acornDisplay.mask = this.acornMask;

		this.multText = this.add.bitmapText(530, 50, 'zantroke', 'x1', 24);
	},

	setUpSAM: function(){
		this.sun = this.add.sprite(100,0,'Play_TA','sun');
		this.sun.anchor.x = .5;
		this.moon = this.add.sprite(0,0, 'Play_TA', 'moon');
		this.moon.anchor.x=.5;
		this.samAngle = 0;
		this.sprites.add(this.sun);
		this.sprites.add(this.moon);
	},

	setupTree: function(){
		var tree = this.add.sprite(this.game.width/2, this.game.height/2 - 120, 'PLAY_TA2','tree');
		tree.cropRect = new Phaser.Rectangle(0,0,tree.width, tree.height - 34);
		tree.updateCrop();
		this.sprites.add(tree);
	},

	setupClouds: function(){

	},

	setupWinter: function(){
		this.caution = this.add.sprite(this.cautionX ,this.game.height/3,'Play_TA', 'Caution');
		this.caution.scale.setTo(1.5,1.5);

		this.cautionText = this.add.bitmapText(this.caution.position.x + this.caution.width/2,
			this.game.height/3 - 22,'zantroke', 'WINTER', 20);
		this.cautionText.tint = 0xff0000;
		this.cautionText.anchor.setTo(.5,0)

		//Set up the snow particles
		var bmd = game.add.bitmapData(64, 64);
	    var radgrad = bmd.ctx.createRadialGradient(32, 32, 2, 32, 32, 20);
	    radgrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
	    radgrad.addColorStop(1, 'rgba(200, 200, 200, 0)');
	    bmd.context.fillStyle = radgrad;
	    bmd.context.fillRect(0, 0, 64, 64);
    	//  Put the bitmapData into the cache
	    //set up the emitter to emit the snow particles
		this.snowEmitter = this.game.add.emitter(game.world.centerX, 10, 80);
   		this.snowEmitter.makeParticles(bmd);
   		this.snowEmitter.width = 300;
   		this.snowEmitter.gravity = 100;
   		this.snowEmitter.start(false, 1000,60);

   		this.winterClouds = this.add.sprite(0,0,'Play_TA', 'Winter_1');
   		this.winterClouds.scale.setTo(.6,.6);
   		this.winterClouds.anchor.setTo(1,0);
	},

	setupEnemies: function(){
		this.enemies = this.add.group();
		this.setupMole();
		this.setupBaseball();
		this.setupCrow();
		this.setupCar();
		this.setupDeer();
		this.sprites.add(this.enemies);
	},

	spawnEnemies: function(){
		if(this.enemyTimer < this.ENEMYDELAY){
			this.enemyTimer++;
		}
		else if(this.enemyTimer == this.ENEMYDELAY){

			//enemySpawned is used to reduce the chance of two enemies appearing closer together
			if(!this.enemySpawned){
				var enemyChance = Math.random();
				if(enemyChance < 1.0/3){
					this.spawnMole();
				}
				else if(enemyChance < 2.0/3){
					this.spawnCrow();
				}
				else {
					this.spawnBaseball();
				}
				this.enemyTimer = 0;
			}
		}
	},

	setupMole: function(){
		this.mole = this.add.sprite(this.game.width,this.BOTTOM,'Play_TA', 'MoleEnemy');
		this.MOLEHEIGHT = this.mole.height;
		this.dirt = this.add.sprite(this.game.width,0,'Play_TA', 'MoleDirt');
		this.mole.position.y = this.BOTTOM - 2* 	this.dirt.height;
		this.dirt.position.y = this.BOTTOM - this.dirt.height;
	
		this.moleEnemy = this.add.group();
		this.moleEnemy.add(this.mole);
		this.moleEnemy.add(this.dirt);
		this.enemies.add(this.moleEnemy);
		this.moleEnemy.isReset = true;

		this.moleEnemy.hitbox = new Phaser.Rectangle(this.MOLEBOX[0] + this.moleEnemy.position.x,
			this.MOLEBOX[1] + this.BOTTOM -this.moleEnemy.height,
			this.moleEnemy.width - this.MOLEBOX[2], this.moleEnemy.height - this.MOLEBOX[3])

		
		this.mole.cropRect = new Phaser.Rectangle(0,0,this.mole.width, 0);
		this.mole.updateCrop();
	   

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

	setupCrow: function(){
		this.crow = this.add.sprite(0,0, 'Play_TA', 'Crow_1_1');
		this.crow.scale.setTo(this.CROWSCALE, this.CROWSCALE);
		this.crow.position.y = this.game.height/2;
		this.crow.position.x = this.game.width + 10;
		this.crow.hitbox = new Phaser.Rectangle(this.crow.position.x + this.CROWBOX[0],
									this.crow.position.y + this.CROWBOX[1],
									this.crow.width - this.CROWBOX[2],
									this.crow.height - this.CROWBOX[3]);
		this.crow.animations.add('flying', Phaser.Animation.generateFrameNames('Crow_1_',1,2),2, true);
		this.crow.animations.play('flying', 5, true);
		this.enemies.add(this.crow);
		this.crow.isReset = true;
	},

	setupCar: function(){
		this.car = this.add.sprite(-1000,0,'Play_TA', 'truck_0');
		this.car.isReset = false;
		this.car.animations.add('standard', Phaser.Animation.generateFrameNames('truck_',0,1),2,true);
		this.car.animations.play('standard', 10, true);
		this.car.scale.setTo(1.2,1.2);
		this.car.position.y = this.BOTTOM - this.car.height;
		this.car.hitbox = new Phaser.Rectangle(this.car.position.x + this.CARBOX[0],
									this.car.position.y + this.CARBOX[1],
									this.car.width - this.CARBOX[2] - this.CARBOX[0],
									this.car.height - this.CARBOX[3] - this.CARBOX[1]);
		this.car.goodbox = new Phaser.Rectangle(this.car.position.x + this.CARBOX1[0],
									this.car.position.y + this.CARBOX1[1],
									this.car.width - this.CARBOX1[2],
									this.car.height - this.CARBOX1[3]);
		this.enemies.add(this.car);	
		this.car.isReset = true;
	},

	setupDeer: function(){
		this.deer = this.add.sprite(this.game.width/2,this.game.height/2 + 100, 'PLAY_TA2', 'deer_0');
		this.deer.scale.setTo(.6,.6);
		this.deer.anchor.setTo(.5,0);
		this.deersign = this.add.sprite(0,0,'PLAY_TA2','deer_sign');

		this.deer.animations.add('running', Phaser.Animation.generateFrameNames('deer_', 0,1), 2, true);
		this.deer.animations.play('running', 10, true);

		this.deer.scaleTween = this.add.tween(this.deer.scale).to({x:.1,y:.1}, 1500);
		this.deer.moveTween = this.add.tween(this.deer.position).to({y: this.BOTTOM - 50}, 1500);
		this.deer.moveTween.start();
		this.deer.scaleTween.start();
		this.deer.zPos = 3;
		this.sprites.add(this.deer);
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
			var hyperBonus = 1;
			var hyperJump = 1;
			if(this.toon.isHyper){
				hyperBonus = this.HYPERMOVEMENT;
				hyperJump = this.HYPERJUMP;
			}
			//JUMPBUTTON is defined as Space bar in preload
			if(this.JUMPBUTTON.isDown && this.canJump){
				this.toon.body.velocity.y = -350 * hyperJump; //arbitrary, changed as needed
				this.canJump = false;
				this.toon.animations.stop(null, true);
			}

			//Otherwise if we are jumping, lets give some jump height control
			else if(!this.toon.canJump && this.toon.body.velocity.y < 0 && this.JUMPBUTTON.isDown){
				this.toon.body.velocity.y -= 5;
			}

			if(this.CURSORS.left.isDown){
				this.toon.body.velocity.x = -1 * this.TOONSPEED * hyperBonus;
			}
			else if(this.CURSORS.right.isDown){
				this.toon.body.velocity.x = this.TOONSPEED * hyperBonus;
			}


			
		}

		//I used canJump as an indicator of if toon is jumping. If we can jump, we aren't jumping.
		//If toon is on the ground, make toon move back with the road
		else if(this.canJump){
			this.toon.body.velocity.x = -120;
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
		acorn.moveTween = this.add.tween(acorn).to({x: 0, y: acorn.position.y}, travelTime);
		acorn.moveTween.onComplete.add(function(){
			acorn.kill();
			this.sprites.acorns.remove(acorn);	
		}, this);
		acorn.moveTween.start();
		this.sprites.acorns.add(acorn);

	},

	drinkSpawner: function(){
		if(Math.random() < this.DRINKCHANCE && this.drink.isReset && !this.toon.isHyper){
			this.drinktween1 = this.add.tween(this.drink).to({x: -1 * this.drink.width-20}, this.DRINKSPEED);
			this.drinktween2 = this.add.tween(this.drinkglow).to({x: -1 * this.drink.width - 20}, this.DRINKSPEED);
			this.drinktween1.start();
			this.drinktween2.start();
			this.drink.isReset = false;
			this.drinktween1.onComplete.addOnce(this.resetDrink, this);
		}
	},

	resetDrink: function(){
		this.drink.position.x = this.game.width + 40;
		this.drinkglow.position.x = this.game.width + 40;
		this.drinktween1.stop();
		this.drinktween2.stop();
		this.drink.isReset = true;
	},

	startHyper: function(){
		if(this.soundEnabled)
			this.yihooSound.play();
		this.toon.isHyper = true;
		this.x10Text = this.add.sprite(this.game.width/2,130, 'UI_TA', 'x10 text');
		this.x10Text.anchor.setTo(.5,.5);
		this.bonusTextGlow = this.add.sprite(this.game.width/2, 130, 'UI_TA', 'x10 text');
		this.bonusTextGlow.anchor.setTo(.5,.5);
		this.bonusTextGlow.alpha = .6;
		var bonusTextEffect = this.add.tween(this.bonusTextGlow.scale).to({x: 1.1, y:1.1}, 
			400, Phaser.Easing.Linear.Out, true, 0, Number.MAX_VALUE, true);
		bonusTextEffect.yoyo(true,0);
		this.toon.animations.stop(null, true);
		this.toon.animations.play('running', 18, true);
	},

	updateHyper: function(){
		if(this.toon.isHyper){
			this.HYPERTIME++;
			this.hyperBar.width = this.hyperBar.MAXWIDTH * (1-this.HYPERTIME/this.HYPERTIMER);
		}
		if(this.HYPERTIME == this.HYPERTIMER){
			this.stopHyper();
		}
	},

	stopHyper: function(){
		this.toon.isHyper = false;
		this.x10Text.destroy();
		this.HYPERTIME = 0;
		this.bonusTextGlow.destroy();this.toon.animations.stop(null, true);
		this.toon.animations.play('running', 12, true);
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

	updateWinter: function(){
			this.cautionText.text = Math.floor(Math.abs(this.winterDistance)/10) + 'm';
			var winterMod =1;
			if(this.toon.isHyper)
				winterMod *= -1
			if(this.toon.isHurt)
				winterMod += 1.3;
			this.winterDistance -= winterMod*.5;

			if(this.winterDistance < 0){
				if(this.caution.position.x > -80){
					this.caution.position.x = -80;
					this.cautionText.position.x = this.caution.position.x + this.caution.width/2;
					this.windSound.play();
				}
			}
			else{
				this.caution.position.x = this.cautionX;
			}

			if(this.winterDistance < -1 * this.winterMax){
				this.winterDistance = -1 * this.winterMax;
			}
			this.winterClouds.position.x = -1 * this.winterDistance;
			this.snowEmitter.x = this.winterClouds.position.x - this.winterClouds.width/2;

			//I decided to put game over detection here rather than in a Toon function
			if(this.toon.hitbox.x < this.winterClouds.position.x - this.winterPadding){
				this.gameOver();
			}
	},

	updateScore: function(){
		var multTime = (6/this.scoreMult) * this.DECAYTIMER;
		this.acornMask.position.y = 10 + (this.decayTime/multTime)*this.acornDisplay.height;
		if(this.scoreMult > 1){
			this.decayTime++;
			if(this.decayTime >= multTime){
				this.scoreMult--;
				this.decayTime = 0;
			}
		}

		this.multText.text = 'x' + this.scoreMult;

		if(this.scoreTime >= this.SCORETIMER){
			var hyperMult = 1;
			if(this.toon.isHyper)
				hyperMult =  10;
			var scoreAdder = this.scoreMult * hyperMult;
			this.score += scoreAdder;
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
		if(!this.mole.hasHit)
			this.moleEnemy.hitbox.x = this.moleEnemy.position.x + this.MOLEBOX[0] + this.game.width;
		this.baseball.hitbox.x = this.baseball.position.x + this.BBOX[0] -  this.baseball.width/2;
		this.baseball.hitbox.y = this.baseball.position.y + this.BBOX[1] - this.baseball.height/2;
		this.crow.hitbox.x = this.crow.position.x + this.CROWBOX[0];
		this.crow.hitbox.y = this.crow.position.y + this.CROWBOX[1];
	
		this.car.hitbox.x = this.car.position.x + this.CARBOX[0];
		this.car.goodbox.x = this.car.position.x + this.CARBOX1[0];
	},

	checkCollisions: function(){
		//Check for enemy collisions
		this.enemies.forEach(function(enemy){
				if(Phaser.Rectangle.intersects(this.toon.hitbox, enemy.hitbox)){
					//Start by performing the event specific to each enemy
					if(enemy == this.moleEnemy)
						this.collideMole();
					else if(enemy == this.baseball)
						this.collideBaseball();
					else if(enemy == this.crow)
						this.collideCrow();
					else if(enemy == this.car)
						this.collideCar();
					//Make toon trip!
					this.toon.animations.stop(null, true);
					this.toon.frameName = 'Toon_Tripping';
					this.toon.isHurt = true;
					//if(this.soundEnabled)
					//	this.owSound.play();
				}
		}.bind(this));

		//Now check to see if we collide with the car's hitbox
		if(Phaser.Rectangle.intersects(this.toon.hitbox, this.car.goodbox)){
			this.rideCar();
		}


		//check for acorn collisons
		this.sprites.acorns.forEach(function(item){
			if(Phaser.Rectangle.intersects(this.toon.hitbox, item)){
				this.scoreMult++;
				this.decayTime = 0;
				item.destroy();
				this.acornsCollected++;
				if(this.soundEnabled)
					this.popSound.play();
			}
		}.bind(this));


		//check for collision with energy drink
		if(Phaser.Rectangle.intersects(this.toon.hitbox, this.drink)){
			this.resetDrink();
			this.startHyper();
		}
	},

	//----- ENEMY FUNCTIONS -----
	resetMole: function() {
		if(this.moleEnemy.moveTween != undefined)
			this.moleEnemy.moveTween.stop();
		this.moleEnemy.position.x = 0;
		this.mole.position.y = this.BOTTOM - 2* this.dirt.height;
		this.moleEnemy.isReset = true;
		this.mole.cropRect.height = 0;
		
	},

	moleStarter:function(){
		if(Math.random() < this.MOLECHANCE && this.moleEnemy.isReset == true){
			this.spawnMole();
		}
	},

	spawnMole: function(){
		if(this.moleEnemy.isReset){
			this.moleEnemy.isReset = false;
			this.mole.y = this.BOTTOM;
			this.mole.cropRect.height = 0;
			this.mole.updateCrop();
			this.mole.hasHit = false;
			this.moleEnemy.moveTween = this.add.tween(this.moleEnemy).to({x:-1 * (this.game.width + this.mole.width + 100)}, this.ROADSPEED -1000);
			this.moleEnemy.moveTween.onComplete.add(this.resetMole, this);
			this.moleEnemy.moveTween.start();
		}
	},

	collideMole: function(){
		this.mole.hasHit = true;
		if(this.soundEnabled)
			this.slideSound.play();
		var dropTween = this.add.tween(this.mole).to({y:this.BOTTOM - 2 * this.dirt.height}, 300);
		var dropTween2 = this.add.tween(this.mole.cropRect).to({height: 0}, 300);
		dropTween.start();
		dropTween2.start();
		this.moleEnemy.hitbox.x = this.game.width;
	},

	baseballStarter: function(){
		if(Math.random() < this.BCHANCE && this.baseball.isReset == true){
			this.spawnBaseball();
		}
	},

	spawnBaseball: function(){
		if(this.baseball.isReset){
			this.baseball.isReset = false;

			this.baseball.moveTime = this.BSPEED + Math.floor(Math.random() * 400)-200;
			this.baseball.xTween = this.add.tween(this.baseball).to({x:-1 * this.baseball.width}, this.baseball.moveTime);
			this.baseball.xTween.onComplete.add(this.resetBaseball, this);
			this.baseball.xTween.start();
			
			this.baseball.yTween = this.add.tween(this.baseball).to({y: [this.BOTTOM - this.baseball.height/2,this.game.height/2 +20]}, 
				1000,"Sine.easeInOut", true, 0 ,-1);
			this.baseball.yTween.start();
		}
	},

	collideBaseball: function(){
		if(this.soundEnabled){
			this.boingSound.play();
		}
		this.baseball.yTween.stop();
		this.baseball.endTween = this.add.tween(this.baseball).to({y: -50},800, Phaser.Easing.Cubic.Out);
		this.baseball.endTween.onComplete.add(this.resetBaseball, this);
		this.baseball.endTween.start();
	},

	resetBaseball: function(){	
		this.baseball.xTween.stop();
		this.baseball.yTween.stop();
		this.xOffset = 20 + Math.floor(Math.random() * 30);
		this.baseball.position.y = this.game.height/2+20;
		this.baseball.position.x = this.game.width + this.baseball.width + 20;
		this.baseball.isReset = true;
	},

	crowStarter: function(){
		if(Math.random() < this.CROWCHANCE && this.crow.isReset){
			this.spawnCrow();
		}
	},

	spawnCrow: function(){
		if(this.crow.isReset){
			this.crow.isReset = false;
			this.crow.moveTween = this.add.tween(this.crow).to({x: -1 * this.crow.width - 20}, 6000);
			this.crow.moveTween.onComplete.add(this.resetCrow, this);
			this.crow.yTween;
			var tweenChoice = Math.random();
			 if(tweenChoice < this.CROWTWEENCHANCES[0]){
			 	this.crow.yTween = this.add.tween(this.crow).to({y:[this.BOTTOM -this.crow.height, 10]}, 6000);
			 }
			 else if(tweenChoice < this.CROWTWEENCHANCES[0] + this.CROWTWEENCHANCES[1]){
			 	this.crow.yTween = this.add.tween(this.crow).to({y:this.crow.y}, 6000);
			 }
			 else{
				var startY = this.crow.position.y;
				var endY = 300;
				this.crow.yTween = this.add.tween(this.crow).to({y:[startY - 300, startY, startY + 300, startY]},
				 2000, Phaser.Easing.Linear.easeInOut, true, 1000, 10);
				this.crow.yTween.interpolation(Phaser.Math.bezierInterpolation);
			 }
			this.crow.moveTween.start();
			this.crow.yTween.start();
		}
	},

	collideCrow: function(){
		this.crow.moveTween.stop();
		this.crow.yTween.stop();
		this.crow.position.setTo(this.crow.position.x + this.crow.width/2, this.crow.position.y + this.crow.height/2);
		this.crow.anchor.setTo(.5,.5);
		this.crow.endTween1 = this.add.tween(this.crow).to({angle: 720}, 300);
		this.crow.endTween2 = this.add.tween(this.crow.scale).to({x: .1, y: .1},290);
		this.crow.endTween1.onComplete.addOnce(this.resetCrow, this);
		this.crow.endTween2.start();
		this.crow.endTween1.start();

		if(this.soundEnabled)
			this.crashSound.play();
	},

	resetCrow: function(){
		this.crow.position.y = this.game.height/2;
		this.crow.position.x = this.game.width + 10;
		this.crow.yTween.stop();
		this.crow.moveTween.stop();
		this.crow.anchor.setTo(0,0);
		this.crow.scale.setTo(this.CROWSCALE,this.CROWSCALE);
		this.crow.isReset = true;
	},

	carStarter: function(){
		if(Math.random() < this.CARCHANCE && this.car.isReset){
			this.car.isReset = false;
			this.car.x = -1 * this.car.width - 120;
			this.car.startCar = this.add.tween(this.car).to({x: -100}, 3800, Phaser.Easing.Cubic.Out);
			this.car.startCar.start();
			this.car.startCar.onComplete.addOnce(this.idleCar, this);
			if(this.soundEnabled)
				this.honkSound.play();
		}
	},

	idleCar: function(){
		game.time.events.add(Phaser.Timer.SECOND * 7, this.moveCar, this);
		this.car.isIdle = true;
	},

	moveCar: function(){
		this.car.isIdle = false;
		this.car.moveCar = this.add.tween(this.car).to({x: this.game.width}, 4000, Phaser.Easing.Quadratic.In);
		this.car.moveCar.onComplete.addOnce(this.resetCar, this);
		this.car.moveCar.start();
		if(this.soundEnabled && this.car.hitbox.y < this.game.height)
			this.engineSound.play();
		this.car.isMoving = true;
	},

	collideCar: function(){
		this.owSound.play();
		this.car.hitbox.y = this.game.height;
		this.car.goodbox.y = this.game.height;
		if(this.car.isIdle){
			this.moveCar();
			game.time.events.events = [];
		}
		else if(!this.car.isMoving){
			this.car.startCar.stop();
			this.moveCar();
		}	
	},

	rideCar: function(){
		this.toon.frameName='ToonSitting_1';
	},

	resetCar: function(){
		this.car.isMoving = false;
		this.car.hitbox.y = this.car.position.y + this.CARBOX[1];
		this.car.goodbox.y = this.car.position.y + this.CARBOX1[1];
		this.car.isReset = true;
	},

	updateDeer: function(){
		if(!this.deer.isReset){
			if(this.deer.scale.x < .5 && this.deer.zPos == 3){
				this.sprites.moveDown(this.deer);
				this.deer.zPos--;
			}
			else if(this.deer.scale.x < .4 && this.deer.zPos ==2){
				this.deer.zPos--;
				this.sprites.moveDown(this.deer);
			}
			else if(this.deer.scale.x < .32 && this.deer.zPos == 1){
				this.sprites.moveDown(this.deer);
				this.deer.zPos--;
			}
			else if(this.deer.scale.x <= .1){
				this.resetDeer();
			}
		}
	},

	resetDeer: function(){
		this.deer.zPos = 3;
		this.deer.scale.setTo(.6,.6);
		this.deer.position.y = this.game.height + 20;
		this.deer.animations.stop();
	},

	togglePause: function(btn){
		if(this.paused){
			this.unpauseGame();
		}
		else{
			this.pauseGame();
		}
	},

	pauseGame: function(){
    	this.paused = true;    
    	this.menu = this.add.sprite(this.game.width/2,this.game.height/2,'UI_TA2', 'PauseScreen');
    	this.menu.anchor.setTo(.5,.5);

    	this.pauseText = this.add.bitmapText(this.game.width/2, 90, 'zantroke', 'GAME PAUSED', 40);
    	this.pauseText.anchor.setTo(.5,.5);

    	this.musicText = this.add.bitmapText(280,170,'zantroke', 'MUSIC:', 30);
    	this.musicText.anchor.setTo(0,.5);
    	this.musicBox = this.add.button(450, 170, 'UI_TA2', this.toggleMusic, this, 'box','box','box');
    	this.musicBox.anchor.setTo(.5,.5);
    	if(this.musicEnabled){
    		this.musicCheck = this.add.sprite(this.musicBox.position.x, this.musicBox.position.y, 'UI_TA2', 'check');
    		this.musicCheck.anchor.setTo(.5,.5);
    	}

    	this.soundText = this.add.bitmapText(280,250,'zantroke', 'SOUND:', 30);
    	this.soundText.anchor.setTo(0,.5);
    	this.soundBox = this.add.button(450, 250, 'UI_TA2', this.toggleSound, this, 'box','box','box');
    	this.soundBox.anchor.setTo(.5,.5);
    	if(this.soundEnabled){
    		this.soundCheck = this.add.sprite(this.soundBox.position.x, this.soundBox.position.y, 'UI_TA2', 'check');
    		this.soundCheck.anchor.setTo(.5,.5);
    	}

    	this.pauseText2 = this.add.bitmapText(this.game.width/2, 360, 'zantroke', 'Unpause with :P: or the pause button', 18);
    	this.pauseText2.anchor.setTo(.5,.5);
    	this.physics.arcade.isPaused = true;
    	this.pauseTweens();
    	this.toggleAnimations(true);
    },

    pauseTweens: function(){
		//Pause all acorns
		this.sprites.acorns.forEach(function(acorn){
			acorn.moveTween.pause();
		}.bind(this));

		//Now for the drink
		if(!this.drink.isReset){
			this.drinktween1.pause();
			this.drinktween2.pause();
			this.glowtween.pause();
		}
		if(!this.moleEnemy.isReset)
			this.moleEnemy.moveTween.pause();
		if(!this.baseball.isReset){
			this.baseball.xTween.pause();
			this.baseball.yTween.pause();
		}
		if(!this.crow.isReset){
			this.crow.moveTween.pause();
			this.crow.yTween.pause();
		}

		if(!this.car.isReset){
			if(this.car.isIdle){
				game.time.events.stop();
			}
		}
    },

    resumeTweens: function(){
    	//Unpause all acorns
		this.sprites.acorns.forEach(function(acorn){
			acorn.moveTween.resume();
		}.bind(this));
    
		//Now for the drink
		if(!this.drink.isReset){
			this.drinktween1.resume();
			this.drinktween2.resume();
			this.glowtween.resume();
		}

		if(!this.moleEnemy.isReset)
			this.moleEnemy.moveTween.resume();
		if(!this.baseball.isReset){
			this.baseball.xTween.resume();
			this.baseball.yTween.resume();
		}
		if(!this.crow.isReset){
			this.crow.moveTween.resume();
			this.crow.yTween.resume();
		}

		if(!this.car.isReset){
			if(this.car.isIdle)
				game.time.events.resume();
		}
    },

    toggleAnimations: function(pause){

    		this.toon.animations.paused = pause;
    		this.car.animations.paused = pause;
    		this.crow.animations.paused = pause;
    },

    toggleMusic: function(){
    	this.musicEnabled = !(this.musicEnabled);
    	if(this.musicEnabled){
    		this.musicCheck = this.add.sprite(this.musicBox.position.x, this.musicBox.position.y, 'UI_TA2', 'check');
    		this.musicCheck.anchor.setTo(.5,.5);
    		this.music.play();
    	}
    	else{
    		this.music.pause();
    		this.musicCheck.destroy();
    	}
    },

    toggleSound: function(){
    	this.soundEnabled = !(this.soundEnabled);
    	if(this.soundEnabled){
    		this.soundCheck = this.add.sprite(this.soundBox.position.x, this.soundBox.position.y, 'UI_TA2', 'check');
    		this.soundCheck.anchor.setTo(.5,.5);
    	}
    	else{
    		this.soundCheck.destroy();
    	}	
    },

    unpauseGame: function(){
    	this.pauseText.destroy();
    	this.menu.destroy();
    	this.musicBox.destroy();
    	this.musicText.destroy();
    	this.soundBox.destroy();
    	this.soundText.destroy();
    	if(this.musicEnabled)
    		this.musicCheck.destroy();
    	if(this.soundEnabled)
    		this.soundCheck.destroy();
    	this.pauseText2.destroy();

    	this.toggleAnimations(false);
    	this.resumeTweens();

    	this.physics.arcade.isPaused = false;
    	this.paused = false;
    },

	gameOver: function(){
		console.log("game over");
	}

};