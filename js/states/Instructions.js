BasicGame.Instructions = function(game) {

};
//MAke sure to credit http://www.freesfx.co.uk and https://www.freesound.org
BasicGame.Instructions.prototype = {

    preload: function() {
        this.toonAnim = 0;
        this.page = 0;
        this.MAXPAGE = 3;
        this.DEMOBOX = [game.width/4, 160, 3*game.width/4, game.height-20];

        this.CURSORS = this.game.input.keyboard.createCursorKeys();

        this.instruct = ['Toon the Squirrel is trying to collect acorns before Winter!\n'+
                        'Move left and right with the arrow keys, and use space bar to jump.\n'+
                        'Winter is quickly approaching, make sure not to get caught in the storm!',

                        'Collect acorns to increase your score multiplier.\n'+
                        'Collect the rare energy drink for a x10 multiplier\n' + 
                        'and a massive movement boost!',

                        'If you get hit by enemy, you will trip and slide backwards.\n' +
                        'These are the four enemies, but be careful, each has a \n' +
                        'unique way of moving!',

                        'The car will enter the screen and pause for a time. While it \n' +
                        'is paused, you can jump on top and CATCH A RIDE! But be careful,\n' +
                        'you will trip if you get hit by the lower half!'];
        this.titles = ['MOVEMENT', 'BONUSES', 'ENEMIES', 'THE CAR'];
    },

    create: function() {
        this.game.stage.backgroundColor = '#006fe6';
        
        this.title= this.game.add.bitmapText(game.width/2, 20,
         'zantroke', 'INSTRUCTIONS', 40);
        this.title.anchor.setTo(.5,0);

        this.text1 = this.game.add.bitmapText(game.width/2, 80, 'zantroke', this.instruct[0], 20);
        this.text1.align = 'center';
        this.text1.anchor.setTo(.5,0);

        this.setupDemoBox();
        this.setupKeys();
        this.setupPage0();
        this.setupPage1();
        this.setupPage2();
        this.setupPage3();

        //Add event listeners to left and right key presses
        //An anonymous function is used to call changePage so changePage can be called with
        //an argument.
        this.CURSORS.left.onDown.add(function(){
            this.changePage('prev');
        }, this);
        this.CURSORS.right.onDown.add(function(){
            this.changePage('next');
        }, this);

        this.startBtn = this.game.add.button(this.DEMOBOX[2] + (game.width - this.DEMOBOX[2])/2,
            game.height - 50, 'UI_TA', this.onClickFunction, this, 'button', 'button', 'button');
        this.startBtn.anchor.setTo(.5,.5);

        this.startBtn.txt = this.add.bitmapText(this.startBtn.position.x-5, this.startBtn.position.y, 
            'zantroke', 'MENU', 30);
        this.startBtn.txt.anchor.setTo(.5,.5);

        this.startBtn.onInputOver.add(this.tiltButton, this, 0);
        this.startBtn.onInputOut.add(this.stopTilt, this, 0);
    },

    setupDemoBox: function(){
        var graphics = this.add.graphics(0,0);
        graphics.moveTo(this.DEMOBOX[0], this.DEMOBOX[1]);
        graphics.beginFill(0xcccccc);
        graphics.lineStyle(3,0x333333,1);
        graphics.lineTo(this.DEMOBOX[2], this.DEMOBOX[1]);
        graphics.lineTo(this.DEMOBOX[2],this.DEMOBOX[3]);
        graphics.lineTo(this.DEMOBOX[0], this.DEMOBOX[3]);
        graphics.lineTo(this.DEMOBOX[0], this.DEMOBOX[1]);
        graphics.endFill();
    },

    setupPage0: function(){
         this.toon = this.add.sprite(0,this.DEMOBOX[3],'Play_TA', 'Toon_Running_1');
        this.toon.scale.setTo(.6,.6);
        this.toon.anchor.setTo(.5,1);
        this.toon.position.setTo(game.width/2,this.DEMOBOX[3]);
        this.toon.animations.add('running', Phaser.Animation.generateFrameNames('Toon_Running_',1,3),3, true);
        this.toon.animations.play('running', 12, true);

        this.winterClouds = this.add.sprite(0,0,'Play_TA', 'Winter_1');
        this.winterClouds.position.setTo(game.width/4 + 3, 163);
        this.winterClouds.scale.setTo(.3,.4);
        this.winterClouds.anchor.setTo(0,0);

        //begin toon's animation for the first screen
        this.toon.moveTween = this.add.tween(this.toon).to({x: game.width/2 + 100}, 500);
        this.toon.moveTween.start();
        this.toon.moveTween.onComplete.add(this.nextToon, this);
    },

    setupPage1: function(){
        this.acorn = this.add.sprite(this.DEMOBOX[0] + (this.DEMOBOX[2] - this.DEMOBOX[0])/3,
            (this.DEMOBOX[1] + this.DEMOBOX[3])/2, 'Play_TA', 'acorn');
        this.acorn.anchor.setTo(.5,.5);
        this.acorn.visible = false;
        this.drink = this.add.sprite(this.DEMOBOX[0] + 2 * (this.DEMOBOX[2] - this.DEMOBOX[0])/3,
            (this.DEMOBOX[1] + this.DEMOBOX[3])/2,'Play_TA','EnergyDrink');
        this.drink.scale.setTo(.6,.6);
        this.drink.angle = -20;
        this.drink.anchor.setTo(.5,.5);
        this.drink.visible = false;

        this.drinkglow = this.add.sprite(this.drink.position.x,
            this.drink.position.y, 'Play_TA', 'EnergyDrink');
        this.drinkglow.anchor.setTo(.5,.5);
        this.drinkglow.alpha = .7;
        this.drinkglow.scale.setTo(.61,.61);
        this.glowtween = this.add.tween(this.drinkglow.scale).to({x: .75, y:.75}, 800, Phaser.Easing.Linear.Out, true, 0, -1, true);
        this.drinkglow.angle = -20;
        this.drinkglow.tint = 0xF2FF00
        this.drinkglow.blendMode = PIXI.blendModes.ADD;
        this.drinkglow.visible = false;
    },

    setupPage2: function(){
         this.mole = this.add.sprite(this.DEMOBOX[0] + (this.DEMOBOX[2] - this.DEMOBOX[0])/5,
                                    (this.DEMOBOX[1] + this.DEMOBOX[3])/2,'Play_TA', 'MoleEnemy');
        this.mole.anchor.setTo(.5,.5);
        this.mole.scale.setTo(.9,.9);

        this.mole.cropRect = new Phaser.Rectangle(0,0,this.mole.width, this.mole.height);
        this.mole.updateCrop();

        this.dirt = this.add.sprite(this.mole.position.x,
            this.mole.position.y + this.mole.height/2 - 10,'Play_TA', 'MoleDirt');
        this.dirt.anchor.setTo(.5,0);
        this.dirt.scale.setTo(.9,.9);
        this.mole.visible = false;
        this.dirt.visible = false;

        this.mole.moveTween = this.add.tween(this.mole).to({y:this.dirt.y}, 
            500,null, true, 100, -1, true);
        this.mole.moveTween.repeatDelay(1000);
        this.mole.cropTween = this.add.tween(this.mole.cropRect).to({height: 0}, 
            500, null, true, 100, -1, true);
        this.mole.cropTween.repeatDelay(1000);

        this.crow = this.add.sprite(this.DEMOBOX[0] + 2 * (this.DEMOBOX[2] - this.DEMOBOX[0])/5,
                                    (this.DEMOBOX[1] + this.DEMOBOX[3])/2,'Play_TA', 'Crow_1_1');
        this.crow.scale.setTo(.5,.5);
        this.crow.anchor.setTo(.5,.5);
        this.crow.visible = false;
        this.crow.animations.add('flying', Phaser.Animation.generateFrameNames('Crow_1_',1,2),2, true);

        this.baseball = this.add.sprite(this.DEMOBOX[0] + 3 * (this.DEMOBOX[2] - this.DEMOBOX[0])/5,
                                    (this.DEMOBOX[1] + this.DEMOBOX[3])/2, 'Play_TA', 'baseball');
        this.baseball.anchor.setTo(.5,.5);
        this.baseball.visible = false;
        this.baseball.yTween = this.add.tween(this.baseball).to(
            {y: [(this.DEMOBOX[1] + this.DEMOBOX[3])/3,(this.DEMOBOX[1] + this.DEMOBOX[3])/2]}, 
                1000,"Sine.easeInOut", true, 0 ,-1);
        this.baseball.yTween.repeatDelay(50);
        this.deer = this.add.sprite(this.DEMOBOX[0] + 4 * (this.DEMOBOX[2] - this.DEMOBOX[0])/5,
            (this.DEMOBOX[1] + this.DEMOBOX[3])/2, 'PLAY_TA2', 'deer_0');
        this.deer.scale.setTo(.5,.5);
        this.deer.anchor.setTo(.5,.5);
        this.deer.animations.add('running', Phaser.Animation.generateFrameNames('deer_', 0,1), 2, true);
        this.deer.visible = false;
    },

    setupPage3: function(){
        this.car = this.add.sprite((this.DEMOBOX[0] + this.DEMOBOX[2])/2,
            (this.DEMOBOX[1] + this.DEMOBOX[3])/2,'Play_TA', 'truck_0');
       this.car.scale.setTo(.9,.9);
       this.car.anchor.setTo(.5,.5);

       this.car.animations.add('standard', Phaser.Animation.generateFrameNames('truck_',0,1),2,true);
    this.car.animations.play('standard', 10, true);
       this.car.visible = false;
    },

    update: function() {
        this.baseball.angle--;
        this.mole.updateCrop();
    },

    setupKeys: function(){
        this.lkey = this.add.sprite(this.DEMOBOX[0]/2,(this.DEMOBOX[1] + this.DEMOBOX[3])/2,'UI_TA2', 'key');
        this.lkey.anchor.setTo(.5,.5);
        this.lkey.visible = false;
        this.larrow = this.add.sprite(this.lkey.position.x, this.lkey.position.y, 'UI_TA2', 'arrow');
        this.larrow.anchor.setTo(.5,.5);
        this.larrow.scale.setTo(-1,1);
        this.larrow.visible = false;
        
        this.rkey = this.add.sprite((this.DEMOBOX[2] + game.width)/2,(this.DEMOBOX[1] + this.DEMOBOX[3])/2,'UI_TA2', 'key');
        this.rkey.anchor.setTo(.5,.5);
        this.rarrow = this.add.sprite(this.rkey.position.x, this.rkey.position.y, 'UI_TA2', 'arrow');
        this.rarrow.anchor.setTo(.5,.5);

        this.lkey.moveTween = this.add.tween(this.lkey).to({y: this.lkey.position.y - 10}, 0, null, true, 20, -1, true);
        this.rkey.moveTween = this.add.tween(this.rkey).to({y: this.lkey.position.y - 10}, 0, null, true, 20, -1, true);
        this.larrow.moveTween = this.add.tween(this.larrow).to({y: this.lkey.position.y - 10}, 0, null, true, 20, -1, true);
        this.rarrow.moveTween  = this.add.tween(this.rarrow).to({y: this.lkey.position.y - 10}, 0, null, true, 20, -1, true);

    },

    nextToon: function(){
        if(this.toonAnim %3 ==  0){
            this.toon.moveTween = this.add.tween(this.toon).to({x: game.width/2}, 500, null, false, 250);
        }
        else if(this.toonAnim % 3 == 1){
            this.toon.animations.stop(null, true);
            this.toon.moveTween = this.add.tween(this.toon).to({y: [game.height/2 + 100, game.height - 20]}, 1000, 
                Phaser.Easing.Quadratic.inOut, false, 100);
        }
        else if(this.toonAnim % 3 == 2){
            this.toon.moveTween = this.add.tween(this.toon).to({x: game.width/2 + 100}, 500, null, false, 400);
            this.toon.animations.play('running', 12, true,250);
        }
        this.toon.moveTween.start();
        this.toon.moveTween.onComplete.add(this.nextToon, this);
        this.toonAnim++;
    },

    resetToon: function(){
        this.toon.position.setTo(game.width/2,this.DEMOBOX[3]);
        this.toon.animations.play('running', 12, true);
        this.toonAnim = 2;
        this.nextToon();
    },

    changePage: function(dir){
        var pageChanged = false;
        if(dir == 'prev' && this.page > 0){
            this.clearPage(this.page);
           this.page--;
           pageChanged = true;
        }
        else if(dir == 'next' && this.page <  this.MAXPAGE){
            this.clearPage(this.page);
            this.page++;
            pageChanged = true;
        }
        if(pageChanged)
            this.setupPage();
    },

    setupPage: function(){
        switch(this.page){
            case 0:
                this.lkey.visible = false;
                this.larrow.visible = false;
                this.toon.visible = true;
                this.winterClouds.visible = true;
                this.resetToon();
                
                break;
            case 1:
                //set up page 1!
                this.acorn.visible = true;
                this.drink.visible = true;
                this.drinkglow.visible = true;
                this.glowtween.resume();
                break;
            case 2:
                this.mole.visible =true;
                this.dirt.visible = true;
                this.crow.visible = true;
                this.baseball.visible = true;
                this.deer.visible = true;

                this.crow.animations.play('flying', 5, true);
                this.deer.animations.play('running', 10, true);
                break;
            case this.MAXPAGE:
                this.car.visible = true;
                this.car.animations.play('standard', 10, true);
                this.rkey.visible = false;
                this.rarrow.visible = false;
                break;
        }
        this.text1.setText(this.instruct[this.page]);
        this.title.setText(this.titles[this.page]);
    },

    clearPage: function(page){
        switch(page){
            case 0:
                this.toon.visible = false;
                this.toon.moveTween.stop();
                this.winterClouds.visible = false;
                this.lkey.visible = true;
                this.larrow.visible = true;
                break;
            case 1:
                this.acorn.visible = false;
                this.drink.visible = false;
                this.drinkglow.visible = false;
                this.glowtween.pause();
                break;
            case 2:
                this.mole.visible = false;
                this.dirt.visible = false;
                this.crow.visible = false;
                this.baseball.visible = false;
                this.deer.visible = false;

                this.crow.animations.stop();
                this.deer.animations.stop();
                break;
            case 3:
                this.car.visible = false;
                this.car.animations.stop();
                this.rkey.visible = true;
                this.rarrow.visible = true;
                break;
        }
    },

    onClickFunction: function(btn){
        if(btn == this.startBtn)
         this.game.state.start('MainMenu');
    },

    tiltButton: function(btn){
        btn.tiltTween = this.add.tween(btn).to({angle: -20}, 2000,
            function(t){
                return Math.sin(Math.PI * 2 * t);
            }, true, 0, -1);
        btn.tiltTween.start();
    
        btn.txt.tiltTween = this.add.tween(btn.txt).to({angle: -20}, 2000,
            function(t){
                return Math.sin(Math.PI * 2 * t);
            }, true, 0, -1);
        btn.txt.tiltTween.start();
    },

    stopTilt: function(btn){
        btn.tiltTween.stop();
        btn.txt.tiltTween.stop();
        stopTween = this.add.tween(btn).to({angle: 0},100);
        txtStopTween = this.add.tween(btn.txt).to({angle: 0}, 100);
        txtStopTween.start();
        stopTween.start();
        
    }
};