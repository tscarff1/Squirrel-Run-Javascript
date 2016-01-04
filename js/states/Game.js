"use strict"
BasicGame.Game = function(game){
	
}

BasicGame.Game.prototype = {
	preload: function(){
		this.score = 0;
		this.scoreMult = 1;
		this.SCORETIMER = 30;
		this.ROADHEIGHT = 3*this.game.height/5;
		this.BOTTOM = 7*this.game.height/8;
		this.JUMPBUTTON = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.canJump = false;
		this.ACORNCHANCE = .005;
		this.ACORNMINY = this.game.height/2;
	},

	create: function(){
		//place the Display stuff
		var panel = this.add.sprite(0,0,'UI_TA', 'panel');
		panel.anchor.setTo(.5,.5);
		panel.position.setTo(6*this.stage.width/11 - panel.width/2, this.game.height/10);
		panel.scale.setTo(2.7,1.6);

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

		//set up physics
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.physics.arcade.gravity.y = 800;
		this.physics.arcade.enable([this.toon, this.botBound]);
		//this.botBound.body.setSize(0,this.BOTTOM,this.game.width, this.BOTTOM+1);
		this.botBound.body.immovable = true;
		this.botBound.body.allowGravity = false;


		//Now let's set up acorns
		this.acorns = this.add.group();

	//var bg = this.add.tileSprite(game,0,0,this.game.width, this.game.height,'Play_TA', 'hills');
	},

	update: function(){
		this.updateScore();
		console.log(this.score);
		this.physics.arcade.collide(this.toon, this.botBound, this.landing, null, this);

		if(this.JUMPBUTTON.isDown && this.canJump){
			this.toon.body.velocity.y = -400
			this.canJump = false;
			this.toon.animations.stop(null, true);
		}

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
	},

	// ----- TOON BASED FUNCTIONS -----
	landing: function(toon, ground){
		if(!this.canJump){
			this.canJump = true;
			this.toon.animations.play('running');
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
		if(this.game.time.now % this.SCORETIMER == 0){
			this.score += 1 * this.scoreMult;
		}
	}

};