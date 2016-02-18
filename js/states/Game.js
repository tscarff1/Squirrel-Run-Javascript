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
		this.ROADSPEED = 7000;
		this.ROADHEIGHT = 3*this.game.height/5;
		this.BOTTOM = 7*this.game.height/8;
		
		this.CURSORS = this.game.input.keyboard.createCursorKeys();
		this.JUMPBUTTON = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.PAUSEBUTTON = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
		
	/* Toon stats n' stuff*/
		this.TOONBOX = [30,30,50,40];
		this.TOONSPEED = 160;
		this.canJump = false;
		this.HURTTIME = 0;
		this.HURTTIMER = 90;
		this.HYPERTIME = 0;
		this.HYPERTIMER = 300;
		this.HYPERMOVEMENT = 2.5;
		this.HYPERJUMP = 1.3;

	// Bonus related stuff
		this.ACORNCHANCE = .007;
		this.ACORNMINY = this.game.height/2;
		this.acornsCollected = 0;
		this.DRINKCHANCE = .0002;
		this.DRINKSPEED = 5000;

	//Enemy related stuff
		this.ENEMYDELAY = 250;
		this.MAXENEMYDELAY = 800;
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
		
		this.CARCHANCE =.0006;
		this.CARBOX = [40,120,20,0];
		this.CARBOX1 = [10,60,30,120];
		this.IDLETIMER = 500;
		this.idleTime = 0;
		this.RIDETIMER = 300;
		this.rideTime = 0;

		this.DEERCHANCE = .005;
		this.DEERBOX = [10,10,10,10];

	//Background stuff
		this.SAMXRADIUS = this.game.width/2  +20;
		this.SAMYRADIUS = this.game.height-20;
		this.CLOUDSPEED = [17000,6000];
		this.CLOUDDELAY = [200,60];
		this.cloudTime = 0;
		this.CLOUDTIMER = this.CLOUDDELAY[0] + (Math.random() * this.CLOUDDELAY[1]);
		this.TREEDELAY = [60, 50];
		this.treeTime = 0;
		this.TREETIMER = this.TREEDELAY[0] + (Math.random() * this.TREEDELAY[1]);

	//Winter stuff
		this.winterDistance = 1500;
		this.winterMax = 200;
		this.winterPadding = 80;
		this.winterSpeed = .5;
		this.cautionX = 10;

		//Sound stuff
		BasicGame.musicEnabled = true;
		this.soundEnabled = true;
		this.music = this.add.audio('Game Theme',.75);
		this.popSound = this.add.audio('Pop');
		this.owSound = this.add.audio('Ow');
		this.yihooSound = this.add.audio('Yihoo');
		this.boingSound = this.add.audio('Boing');
		this.slideSound = this.add.audio('Slide');
		this.crashSound = this.add.audio('Crash');
		this.engineSound = this.add.audio('Engine',.7);
		this.honkSound = this.add.audio('Honk',.7);
		this.clipclopSound = this.add.audio('Clipclop');
		this.gongSound = this.add.audio('Gong', .7);
		this.windSound = this.add.audio('Wind', .8);
		this.byeSound = this.add.audio('Bye');
		this.windSound.loop = true;

		this.paused = false;
		this.gameSpeed = 1;
		this.ROADACC = .01;

		game.load.image('ground', 'assets/images/hills.png');	},

	create: function(){
		this.sprites = this.add.group();
		//Set up the sun and moon (MUST be first)
		this.setUpSAM();
		this.setupClouds();
		this.initClouds();

		this.setupBG();

		//Set up for trees
		this.trees = this.add.group();
		this.sprites.add(this.trees);
		this.initTrees();

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

		this.music.loop = true;
		if(BasicGame.musicEnabled){
			BasicGame.menutheme.stop();
			this.music.play();
		}

		this.startBtn = this.game.add.button(0,0, 'UI_TA', this.togglePause, this, 'button', 'button', 'button');
		this.startBtn.position.x = this.game.width - this.startBtn.width - 10;
		this.startBtn.position.y = 10;

		this.startTxt = this.add.bitmapText(this.startBtn.position.x+this.startBtn.width/2 - 5, 
			this.startBtn.position.y + this.startBtn.height/2, 'zantroke', 'PAUSE', 30);
        this.startTxt.anchor.setTo(.5,.5);
        this.startTxt.tint = 0xff0000;

        //Rearrance the sprites order
        this.sprites.setChildIndex(this.drinkGroup, 9);
        this.sprites.setChildIndex(this.deer, 8);
        this.sprites.setChildIndex(this.toon, 7);
        this.sprites.setChildIndex(this.enemies, 6);
        this.sprites.setChildIndex(this.trees, 5);
	},

	

	update: function(){
		if(!this.paused){
			this.hills.tilePosition.x -= .5 * this.gameSpeed;
			this.updateHitboxes();

			this.updateScore();
			this.updateSAM();
			this.cloudSpawner();
			this.updateWinter();
			this.treeSpawner();

			this.physics.arcade.collide(this.toon, this.botBound, this.landing, null, this);
			this.moveToon();
			this.updateRide();
			this.updateHyper();

			//this.moleStarter();
			//this.baseballStarter();
			//this.crowStarter();
			this.spawnEnemies();
			this.carStarter();
			this.updateCar();
			this.deerStarter();
			
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
				if(this.HURTTIME > this.HURTTIMER ){
					this.toon.isHurt = false;
					this.HURTTIME = 0;
					this.toon.animations.play('running');
				}
				this.HURTTIME++;
			}
		}

		this.pauseListener();
	},

	/*// Comment this out when testing 'final' versions of game
	render: function(){
		game.debug.geom( this.toon.hitbox,     'rgba(255,0,0, .7)');
		game.debug.geom( this.moleEnemy.hitbox,'rgba(0,255,0, .7)');
		game.debug.geom( this.baseball.hitbox, 'rgba(0,255,0, .7)');
		game.debug.geom( this.crow.hitbox,     'rgba(0,255,0, .7)');
		game.debug.geom( this.car.hitbox,      'rgba(0,255,0, .7)');
		game.debug.geom( this.car.goodbox,     'rgba(0,0,255, .7)');
		game.debug.geom( this.deer.hitbox,     'rgba(0,255,0, .7)');
	},	*/

	//----- SETUP FUNCTIONS -----
	setupBG:function(){
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
	},

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
		this.sprites.add(this.toon);
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
		this.drinkglow.angle = -20;
		this.drinkglow.tint = 0xF2FF00
		this.drinkglow.blendMode = PIXI.blendModes.ADD;
		this.drinkGroup = this.add.group();
		this.drinkGroup.add(this.drink);
		this.drinkGroup.add(this.drinkglow);
		this.sprites.add(this.drinkGroup);
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
		this.hyperBar = this.add.sprite(hyperPanel.position.x + 11, 58, 
			'UI_TA', 'Hyper Bar Meter');
		this.hyperBar.MAXWIDTH = this.hyperBar.width;
		this.hyperBar.width = 1;
		this.scoreText = this.add.bitmapText(hyperPanel.position.x, 10, 
			'zantroke', 'Score: 0', 30);

		var acornBG = this.add.sprite(500,10,'Play_TA', 'acorn');
		acornBG.angle = 40;
		acornBG.scale.setTo(1.2,1.2);
		acornBG.tint = 0x888888;
		acornBG.alpha = .6;
		
		this.acornDisplay = this.add.sprite(acornBG.position.x,10,'Play_TA','acorn');
		this.acornDisplay.angle = 40;
		this.acornDisplay.scale.setTo(1.2,1.2);
		this.acornDisplay.tint = 0xeeeeee;
		 //	A mask is a Graphics object
	    this.acornMask = game.add.graphics(0, 0);
    	this.acornMask.beginFill(0xffffff);
    	this.acornMask.drawRect(475,10, this.acornDisplay.width + 10, 155);
  		this.acornDisplay.mask = this.acornMask;

		this.multText = this.add.bitmapText(520, 50, 'zantroke', 'x1', 24);
	},

	setUpSAM: function(){
		this.sun = this.add.sprite(100,0,'Play_TA','sun');
		this.sun.anchor.x = .5;
		this.moon = this.add.sprite(0,0, 'Play_TA', 'moon');
		this.moon.anchor.x=.5;
		this.samAngle = 0;
		this.sam = this.add.group();
		this.sam.add(this.sun);
		this.sam.add(this.moon);
		this.sprites.add(this.sam);
	},

	

	setupClouds: function(){
		this.clouds = this.add.group();
		this.sprites.add(this.clouds);
	},

	initClouds: function(){
		var  numClouds = 4 + Math.random() * 2;
		for(var i = 0; i < numClouds; i++){
			var cloudNum = 1 +  Math.floor((Math.random() * 3));
			var cloud = this.add.sprite(
				50 + Math.random() * (game.width - 100),
			 -10 + Math.random() * (game.height - 200),
			 'PLAY_TA2', 'Cloud' + cloudNum);
			var scale = .3 + .5 * Math.random();
			var speed = this.CLOUDSPEED[0] + Math.random() * (this.CLOUDSPEED[1]);
			cloud.moveTween =this.add.tween(cloud.position).to({x: -1 * cloud.width}, cloud.position.x / game.width * speed);	
			cloud.moveTween.onComplete.add(function(){
				cloud.destroy();
			}.bind(this), this);
			cloud.moveTween.start();
			cloud.scale.setTo(scale, scale);
			cloud.alpha = .9;
			this.clouds.add(cloud);
		}
	},

	cloudSpawner: function(){
		if(this.cloudTime < this.CLOUDTIMER){
			this.cloudTime+=this.gameSpeed;
		}
		else{
			var cloudNum = 1 +  Math.floor((Math.random() * 3));
			var cloud = this.add.sprite(game.width,
			 -10 + Math.random() * (game.height - 200),
			 'PLAY_TA2', 'Cloud' + cloudNum);
			var scale = .3 + .5 * Math.random();
			var speed = this.CLOUDSPEED[0] + Math.random() * (this.CLOUDSPEED[1]);
			cloud.moveTween = this.add.tween(cloud.position).to({x: -1 * cloud.width}, speed);	
			cloud.moveTween.onComplete.add(function(){
				cloud.destroy();
			}.bind(this), this);
			cloud.moveTween.timeScale = this.gameSpeed;
			cloud.moveTween.start();
			cloud.scale.setTo(scale, scale);
			cloud.alpha = .9;
			this.CLOUDTIMER = this.CLOUDDELAY[0] + Math.random() * this.CLOUDDELAY[1];
			this.cloudTime = 0;
			this.clouds.add(cloud);
		}
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
		this.enemyTimer+= Math.floor(this.gameSpeed);
		if(this.enemyTimer % this.ENEMYDELAY == 0){
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
		}

		else if(this.ENEMYDELAY >= this.MAXENEMYDELAY){
		console.log(this.enemyTimer);
			while(!this.enemySpawned){
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
		this.deer.position.y = this.game.height + 20;
		this.deer.hitbox = new Phaser.Rectangle(this.deer.position.x - this.deer.width/2 + this.DEERBOX[0],
									this.deer.position.y+ this.DEERBOX[1],
									this.deer.width - this.DEERBOX[2],
									this.deer.height - this.DEERBOX[3]);
		this.deer.animations.add('running', Phaser.Animation.generateFrameNames('deer_', 0,1), 2, true);
		this.sprites.add(this.deer);
		this.deer.isReset = true;
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
		if(!this.toon.isHurt && !this.toon.isRiding){
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

		else if(this.toon.isRiding){
			//JUMPBUTTON is defined as Space bar in preload
			if(this.JUMPBUTTON.isDown && this.rideTime > 50){
				this.endRide();
			}
		}

		//I used canJump as an indicator of if toon is jumping. If we can jump, we aren't jumping.
		//If toon is on the ground, make toon move back with the road
		//So if we are hurt (we reached the else statement) and canJump (we are on the ground) we will move backwards
		else if(this.canJump){
			this.toon.body.velocity.x = -120 - .004 * this.score;
		}
	},

	updateRide: function(){
		if(this.toon.isRiding){
			if(this.rideTime < this.RIDETIMER)
				this.rideTime++;
			else if(this.rideTime == this.RIDETIMER){
				this.endRide();
			}
		}
	},

	endRide: function(){
			this.canJump = false;
			this.toon.isRiding = false;
			this.toon.body.velocity.y = -300; //arbitrary, changed as needed
			this.toon.frameName = 'Toon_Running_1';

			this.toon.body.immovable = false;
			this.toon.body.allowGravity = true;
			this.rideTime = 0;
			this.moveCar();
			this.revertSpeeds();
			if(this.soundEnabled){
				this.byeSound.play();
			}
	},

	initTrees: function(){
		var numTrees = 2 + Math.random() * 3; 
		for(var i = 0; i < numTrees; i++){
			var tree = this.add.sprite(this.game.width, this.BOTTOM, 'PLAY_TA2','tree');
			var scale = .1 + (Math.random() * .2);
			tree.anchor.setTo(0,1);
			tree.scale.setTo(scale, scale);

			tree.position.y = this.BOTTOM - 20 * (.25/scale) + 5;
			tree.position.x = 200 + Math.random() * (game.width - 200);
			this.trees.add(tree);
			tree.moveTween = this.add.tween(tree.position).to({x: -1 * tree.width}, tree.position.x / game.width * (this.ROADSPEED * .3/scale));
			tree.moveTween.start();
			tree.moveTween.onComplete.add(function(){
				tree.destroy();
			}.bind(this), this);
		}
		this.trees.sort('y', Phaser.Group.SORT_ASCENDING);
	},

	treeSpawner: function(){
		if(this.treeTime < this.TREETIMER){
			this.treeTime+= this.gameSpeed;			
		}
		else{
			var tree = this.add.sprite(this.game.width, this.BOTTOM, 'PLAY_TA2','tree');
			var scale = .1 + (Math.random() * .2);
			tree.anchor.setTo(0,1);
			tree.scale.setTo(scale, scale);

			tree.position.y = this.BOTTOM - 20 * (.25/scale) + 5;
			//tree.cropRect = new Phaser.Rectangle(0,0, tree.width, tree.height);
			//tree.updateCrop();
			
			this.trees.add(tree);
			tree.moveTween = this.add.tween(tree.position).to({x: -1 * tree.width}, this.ROADSPEED * .3/scale);
			tree.moveTween.start();
			tree.moveTween.timeScale = this.gameSpeed;
			tree.moveTween.onComplete.add(function(){
				tree.destroy();
			}.bind(this), this);
			this.treeTime = 0;
			this.TREETIMER = this.TREEDELAY[0] + (Math.random() * this.TREEDELAY[1]);
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
		acorn.moveTween.timeScale = Math.max(1,.7 * this.gameSpeed);
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
			var winterMod =.3;
			if(this.toon.isHyper || this.toon.isRiding)
				winterMod *= -1
			if(this.toon.isHurt)
				winterMod += .75;

			this.winterDistance -= winterMod;

			if(this.winterDistance < 0){
				if(this.caution.position.x > -80){
					this.caution.position.x = -80;
					this.cautionText.position.x = this.caution.position.x + this.caution.width/2;
					if(this.soundEnabled)
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
		
		var speedScalar = .1;
		var update = Math.floor(speedScalar * this.score/100)/10;
		if(update > this.gameSpeed && update<3){
			//console.log('GameSpeed: ' + this.gameSpeed + ' -> ' + update);
			this.adjustSpeed(update);
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
				if(Phaser.Rectangle.intersects(this.toon.hitbox, enemy.hitbox) && !this.toon.isHurt){
					//Start by performing the event specific to each enemy
					if(enemy == this.moleEnemy)
						this.collideMole();
					else if(enemy == this.baseball)
						this.collideBaseball();
					else if(enemy == this.crow)
						this.collideCrow();
					else if(enemy == this.car)
						this.collideCar();
					if(!this.toon.isRiding){
						//Make toon trip!
						this.toon.animations.stop(null, true);
						this.toon.frameName = 'Toon_Tripping';
						this.toon.isHurt = true;
					}
				}
		}.bind(this));

		//Now check to see if we collide with the car's hitbox
		if(Phaser.Rectangle.intersects(this.toon.hitbox, this.car.goodbox) && !this.toon.isHurt && !this.car.isMoving){
			this.rideCar();
		}

		//Also have to manually check for deer
		if(Phaser.Rectangle.intersects(this.toon.hitbox, this.deer.hitbox) && this.deer.zPos > 1){
			//Make toon trip!
			this.toon.animations.stop(null, true);
			this.toon.frameName = 'Toon_Tripping';
			this.toon.isHurt = true;

			if(this.soundEnabled)
				this.gongSound.play();
		}

		this.checkBonusCollisions();
	},

	checkBonusCollisions: function(){
		//check for acorn collisons
		this.sprites.acorns.forEach(function(item){
			var box = this.toon.hitbox;
			if(this.toon.isRiding)
					box = this.toon;
			if(Phaser.Rectangle.intersects(box, item)){
				this.scoreMult++;
				this.decayTime = 0;
				item.destroy();
				this.acornsCollected++;
				if(this.soundEnabled)
					this.popSound.play();
			}
		}.bind(this));


		//check for collision with energy drink
		if(Phaser.Rectangle.intersects(this.toon.hitbox, this.drink) && !this.toon.isRiding){
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
			this.enemySpawned = true;
			this.enemyTimer = 0;
			this.mole.y = this.BOTTOM;
			this.mole.cropRect.height = 0;
			this.mole.updateCrop();
			this.mole.hasHit = false;
			this.moleEnemy.moveTween = this.add.tween(this.moleEnemy).to({x:-1 * (this.game.width + this.mole.width + 100)}, this.ROADSPEED);
			this.moleEnemy.moveTween.onComplete.add(this.resetMole, this);
			this.moleEnemy.moveTween.start();
			this.moleEnemy.moveTween.timeScale = this.gameSpeed;
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
			this.enemySpawned = true;
			this.enemyTimer = 0;
			this.baseball.moveTime = this.BSPEED + Math.floor(Math.random() * 400)-200;
			this.baseball.moveTween = this.add.tween(this.baseball).to({x:-1 * this.baseball.width}, this.baseball.moveTime);
			this.baseball.moveTween.onComplete.add(this.resetBaseball, this);
			this.baseball.moveTween.start();
			this.baseball.moveTween.timeScale = this.gameSpeed;
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
		this.baseball.moveTween.stop();
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
			this.enemySpawned = true;
			this.enemyTimer = 0;
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
				 2000, Phaser.Easing.Linear.easeInOut, true, 0, 10);
				this.crow.yTween.interpolation(Phaser.Math.bezierInterpolation);
			 }


			this.crow.moveTween.timeScale = this.gameSpeed;
			this.crow.yTween.timeScale = Math.max(1,.6 * this.gameSpeed);
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
			this.car.startCar = this.add.tween(this.car).to({x: -30}, 3800, Phaser.Easing.Cubic.Out);
			this.car.startCar.start();
			this.car.startCar.onComplete.addOnce(this.idleCar, this);
			if(this.soundEnabled)
				this.honkSound.play();
		}
	},

	idleCar: function(){
		this.car.isIdle = true;
	},

	updateCar: function(){
		if(this.car.isIdle){
			if(this.idleTime < this.IDLETIMER){
				this.idleTime++;
			}
			else if(this.idleTime == this.IDLETIMER){
				this.moveCar();
				this.idleTime = 0;
			}
		}

	},

	moveCar: function(){
		this.car.isIdle = false;
		this.car.idleTime = 0;
		this.car.moveCar = this.add.tween(this.car).to({x: this.game.width}, 4000, Phaser.Easing.Quadratic.In);
		this.car.moveCar.onComplete.addOnce(this.resetCar, this);
		this.car.moveCar.start();
		if(this.soundEnabled && this.car.hitbox.y < this.game.height)
			this.engineSound.play();
		this.car.isMoving = true;
	},

	collideCar: function(){
		if(this.soundEnabled)
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
		this.toon.body.immovable = true;
		this.toon.body.allowGravity = false;
		this.toon.body.velocity.y = 0;
		this.car.hitbox.y = this.game.height;
		this.car.goodbox.y = this.game.height;
		this.toon.isRiding = true;


		if(this.car.isIdle){
			this.car.isIdle = false;
			this.car.idleTime = 0;
		}
		//since we cant ride while car is moving our only option is the car is starting
		else {
			this.car.startCar.stop();
		}
		this.car.rideTween = this.add.tween(this.car.position).to({x: 100}, 500);
		var toonX = this.toon.position.x - this.car.position.x;
		this.toon.rideTween  = this.add.tween(this.toon.position).to({x: 100 + toonX}, 500);
		this.toon.rideTween.start();
		this.car.rideTween.start();
		this.car.rideTween.onComplete.add(function(){this.adjustSpeed(2 * this.gameSpeed)}, this);
		if(this.soundEnabled)
				this.engineSound.play();
	},

	adjustSpeed: function(val){
		this.gameSpeed = Math.max(1,val);
		this.clouds.forEach(function(cloud){
			cloud.moveTween.timeScale = val;
		}, this);

		this.sprites.acorns.forEach(function(acorn){
			acorn.moveTween.timeScale = val;
		}, this);

		this.trees.forEach(function(tree){
			tree.moveTween.timeScale =val;
		}, this);

		if(!this.moleEnemy.isReset)
			this.moleEnemy.moveTween.timeScale = val;
		if(!this.crow.isReset){
			this.crow.moveTween.timeScale = val;
			this.crow.yTween.timeScale = Math.max(1, .6 * this.gameSpeed);
		}
		if(!this.baseball.isReset)
			this.baseball.moveTween.timeScale = val;
	},

	revertSpeeds: function(){
		this.adjustSpeed(1);
	},

	resetCar: function(){
		this.car.isMoving = false;
		this.car.hitbox.y = this.car.position.y + this.CARBOX[1];
		this.car.goodbox.y = this.car.position.y + this.CARBOX1[1];
		this.car.isReset = true;
	},

	deerStarter: function(){
		if(Math.random() < this.DEERCHANCE && this.deer.isReset){

			this.deer.isReset = false;
			this.deer.isStarting = true;
			if(this.soundEnabled)
				this.clipclopSound.play();
			
			this.deer.position.x =  150 + Math.random() * (game.width-200);

			
			this.deer.animations.play('running', 10, true);


			this.deersign = this.add.sprite(this.deer.position.x,this.game.height/2,'PLAY_TA2','deer_sign');
			this.deersign.anchor.setTo(.5,0);
			this.deersign.blinkTween = this.add.tween(this.deersign).to({alpha:0,},
			 100, Phaser.Easing.Exponential.Out, true, 1000, 3,true);
			this.deersign.blinkTween.repeatDelay(600);
			
			this.deer.startTween = this.add.tween(this.deer.position).to({y: this.game.height/2 + 100}, 1500);
			this.deer.startTween.onComplete.add(this.moveDeer, this);
			this.deer.startTween.start();
		}
	},

	moveDeer: function(){
			this.deer.isStarting = false;
			this.deer.isMoving = true;
			this.deer.scaleTween = this.add.tween(this.deer.scale).to({x:.1,y:.1}, 1500);
			this.deer.moveTween = this.add.tween(this.deer.position).to({y: this.BOTTOM - 50}, 1500,Phaser.Easing.Cubic.In);
			this.deer.moveTween.start();
			this.deer.scaleTween.start();
			this.deer.zPos = 3;
	},

	updateDeer: function(){
		if(this.deer.isMoving){
			this.deer.hitbox.x = this.deer.x - this.deer.width/2 + this.DEERBOX[0];
			this.deer.hitbox.y = this.deer.y+ this.DEERBOX[1];
			this.deer.hitbox.width = this.deer.width - this.DEERBOX[2] - this.DEERBOX[0];
		}
		else{
			this.deer.hitbox.y = -1000;
		}


		if(!this.deer.isReset){
			if(this.deer.scale.x < .5 && this.deer.zPos == 3){
				this.sprites.swap(this.deer, this.toon);
				this.deer.zPos--;
			}
			else if(this.deer.scale.x < .4 && this.deer.zPos ==2){
				this.deer.zPos--;
				this.sprites.swap(this.deer, this.enemies);
			}
			else if(this.deer.scale.x < .15 && this.deer.zPos == 1){
				this.sprites.swap(this.deer, this.trees);
				this.deer.zPos--;
			}
			else if(this.deer.scale.x <= .1){
				this.resetDeer();
			}
		}
	},

	resetDeer: function(){
		this.deer.isMoving = false;
		this.deer.zPos = 3;
		this.deer.scale.setTo(.6,.6);
		this.deer.position.y = this.game.height + 20;
		this.deer.animations.stop();
		this.sprites.setChildIndex(this.deer, 8);
		this.deer.isReset = true;
		this.deersign.destroy();
	},

	pauseListener: function(){
		if(this.PAUSEBUTTON.isDown && this.PAUSEBUTTON.canPress){
			this.togglePause();
			this.PAUSEBUTTON.canPress = false;
		}

		if(this.PAUSEBUTTON.isUp){
			this.PAUSEBUTTON.canPress = true;
		}
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
    	this.menu = this.add.sprite(this.game.width/2,this.game.height/2+30,'UI_TA2', 'PauseScreen');
    	this.menu.anchor.setTo(.5,.5);

    	this.pauseText = this.add.bitmapText(this.game.width/2, 120, 'zantroke', 'GAME PAUSED', 40);
    	this.pauseText.anchor.setTo(.5,.5);

    	this.musicText = this.add.bitmapText(280,200,'zantroke', 'MUSIC:', 30);
    	this.musicText.anchor.setTo(0,.5);
    	this.musicBox = this.add.button(450, 200, 'UI_TA2', this.toggleMusic, this, 'box','box','box');
    	this.musicBox.anchor.setTo(.5,.5);
    	if(BasicGame.musicEnabled){
    		this.musicCheck = this.add.sprite(this.musicBox.position.x, this.musicBox.position.y, 'UI_TA2', 'check');
    		this.musicCheck.anchor.setTo(.5,.5);
    	}

    	this.soundText = this.add.bitmapText(280,280,'zantroke', 'SOUND:', 30);
    	this.soundText.anchor.setTo(0,.5);
    	this.soundBox = this.add.button(450, 280, 'UI_TA2', this.toggleSound, this, 'box','box','box');
    	this.soundBox.anchor.setTo(.5,.5);
    	if(this.soundEnabled){
    		this.soundCheck = this.add.sprite(this.soundBox.position.x, this.soundBox.position.y, 'UI_TA2', 'check');
    		this.soundCheck.anchor.setTo(.5,.5);
    	}


    	this.pauseText2 = this.add.bitmapText(this.game.width/2, 390, 'zantroke', 'Unpause with :P: or the pause button', 18);
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
			this.baseball.moveTween.pause();
			this.baseball.yTween.pause();
		}
		if(!this.crow.isReset){
			this.crow.moveTween.pause();
			this.crow.yTween.pause();
		}

		if(!this.deer.isReset){
			this.deersign.blinkTween.pause();
			if(this.deer.isStarting){
				this.deer.startTween.pause();
			}
			else if(this.deer.isMoving){
				this.deer.moveTween.pause();
				this.deer.scaleTween.pause();
			}
		}

		if(!this.car.isReset){
			if(this.car.isMoving){
				this.car.moveCar.pause();
			}else if(!this.car.isIdle){
				this.car.startCar.pause();
			}
		}

		if(this.toon.isRiding){
			this.toon.rideTween.pause();
			this.car.rideTween.pause();
		}

		this.trees.forEach(function(tree){
			tree.moveTween.pause();
		}.bind(this));

		this.clouds.forEach(function(cloud){
			cloud.moveTween.pause();
		}.bind(this));
    },

    resumeTweens: function(){
    	//Unpause all acorns
		this.sprites.acorns.forEach(function(acorn){
			acorn.moveTween.resume();
		}.bind(this));

		this.trees.forEach(function(tree){
			tree.moveTween.resume();
		}.bind(this));

		this.clouds.forEach(function(cloud){
			cloud.moveTween.resume();
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
			this.baseball.moveTween.resume();
			this.baseball.yTween.resume();
		}
		if(!this.crow.isReset){
			this.crow.moveTween.resume();
			this.crow.yTween.resume();
		}

		if(!this.car.isReset){
			if(this.car.isMoving){
				this.car.moveCar.resume();
			}else if(!this.car.isIdle){
				this.car.startCar.resume();
			}
		}

		if(this.toon.isRiding){
			this.toon.rideTween.resume();
			this.car.rideTween.resume();
		}

		if(!this.deer.isReset){
			this.deersign.blinkTween.resume();
			if(this.deer.isStarting){
				this.deer.startTween.resume();
			}
			else if(this.deer.isMoving){
				this.deer.moveTween.resume();
				this.deer.scaleTween.resume();
			}
		}
    },

    toggleAnimations: function(pause){

    		this.toon.animations.paused = pause;
    		this.car.animations.paused = pause;
    		this.crow.animations.paused = pause;
    		if(!this.deer.isReset)
    			this.deer.animations.paused = pause;
    },

    toggleMusic: function(){
    	BasicGame.musicEnabled = !(BasicGame.musicEnabled);
    	//Save settings
    	localStorage["musicEnabled"] = BasicGame.musicEnabled.toString();

    	if(BasicGame.musicEnabled){
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
    	//Save settings
    	localStorage["soundEnabled"] = this.soundEnabled.toString();

    	if(this.soundEnabled){
    		this.soundCheck = this.add.sprite(this.soundBox.position.x, this.soundBox.position.y, 'UI_TA2', 'check');
    		this.soundCheck.anchor.setTo(.5,.5);
    		if(this.winterDistance < 0){
				this.windSound.play();
			}
    	}
    	else{
    		this.soundCheck.destroy();
    		if(this.winterDistance < 0){
				this.windSound.pause();
			}
    	}	
    },

    unpauseGame: function(){
    	this.pauseText.destroy();
    	this.menu.destroy();
    	this.musicBox.destroy();
    	this.musicText.destroy();
    	this.soundBox.destroy();
    	this.soundText.destroy();
    	if(BasicGame.musicEnabled)
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
		if(this.score > BasicGame.score){
			BasicGame.score = this.score;
			localStorage['score'] = this.score + '';
			kongregate.stats.submit("score",this.score);

		}
		BasicGame.acornsCollected = this.acornsCollected;
		if(BasicGame.musicEnabled)
			this.music.stop();
		if(this.soundEnabled){
			this.windSound.stop();
			if(!this.deer.isReset)
				this.clipclopSound.stop();
		}
		this.state.start('GameOver');
	},


};