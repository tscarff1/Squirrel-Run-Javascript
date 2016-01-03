BasicGame.Game = function(game){
	
}

BasicGame.Game.prototype = {
	preload: function(){
		this.score = 0;
		this.ROADHEIGHT = 3*this.game.height/5;
		this.BOTTOM = 7*this.game.height/8;
		this.JUMPBUTTON = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.canJump = false;
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
		this.physics.arcade.gravity.y = 600;
		this.physics.arcade.enable([this.toon, this.botBound]);
		//this.botBound.body.setSize(0,this.BOTTOM,this.game.width, this.BOTTOM+1);
		this.botBound.body.immovable = true;
		this.botBound.body.allowGravity = false;

	//var bg = this.add.tileSprite(game,0,0,this.game.width, this.game.height,'Play_TA', 'hills');
	},

	update: function(){
		this.physics.arcade.collide(this.toon, this.botBound, this.landing, null, this);

		if(this.JUMPBUTTON.isDown && this.canJump){
			this.toon.body.velocity.y = -400
			this.canJump = false;
			this.toon.animations.stop(null, true);
		}
	},

	landing: function(toon, ground){
		if(!this.canJump){
			this.canJump = true;
			this.toon.animations.play('running');
		}
	}
};