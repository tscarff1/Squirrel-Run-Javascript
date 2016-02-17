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
    },

    create: function() {
        this.game.stage.backgroundColor = '#006fe6';
        
        this.title= this.game.add.bitmapText(game.width/2, 20,
         'zantroke', 'INSTRUCTIONS', 40);
        this.title.anchor.setTo(.5,0);

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
                        'you will trip if you get hit by the tires!'];
        this.text1 = this.game.add.bitmapText(game.width/2, 80, 'zantroke', this.instruct[0], 20);
        this.text1.align = 'center';
        this.text1.anchor.setTo(.5,0);

        //creating the demo box
        var graphics = this.add.graphics(0,0);
        graphics.moveTo(this.DEMOBOX[0], this.DEMOBOX[1]);
        graphics.beginFill(0xffffff);
        graphics.lineStyle(3,0x333333,1);
        graphics.lineTo(this.DEMOBOX[2], this.DEMOBOX[1]);
        graphics.lineTo(this.DEMOBOX[2],this.DEMOBOX[3]);
        graphics.lineTo(this.DEMOBOX[0], this.DEMOBOX[3]);
        graphics.lineTo(this.DEMOBOX[0], this.DEMOBOX[1]);
        graphics.endFill();

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

        //setup sprites for screen two
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

        //Now for page 3
        this.mole = this.add.sprite(this.DEMOBOX[0] + (this.DEMOBOX[2] - this.DEMOBOX[0])/5,
                                    (this.DEMOBOX[1] + this.DEMOBOX[3])/2,'Play_TA', 'MoleEnemy');
        this.mole.anchor.setTo(.5,.5);
        this.dirt = this.add.sprite(this.mole.position.x,
            this.mole.position.y + this.mole.height/2 - 10,'Play_TA', 'MoleDirt');
        this.dirt.anchor.setTo(.5,.0);
        this.mole.visible = false;
        this.dirt.visible = false;

        this.CURSORS.left.onDown.add(function(){
            this.changePage('prev');
        }, this);
        this.CURSORS.right.onDown.add(function(){
            this.changePage('next');
        }, this);
    },

    update: function() {
        //Do some nice funky main menu stuff here

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
           this.page--;
           pageChanged = true;
        }
        else if(dir == 'next' && this.page <  this.MAXPAGE){
            this.page++;
            pageChanged = true;
        }
        else{
            console.log('error');
        }
        if(pageChanged)
            this.setupPage();
    },

    setupPage: function(){
        switch(this.page){
            case 0:
            this.title.setText('MOVEMENT');
                this.lkey.visible = false;
                this.larrow.visible = false;
                this.toon.visible = true;
                this.winterClouds.visible = true;
                this.resetToon();
                this.acorn.visible = false;
                this.drink.visible = false;
                break;
            case 1:
                this.title.setText('BONUSES');
                //Clear out page 1
                this.lkey.visible = true;
                this.larrow.visible = true;
                this.toon.visible = false;
                this.toon.moveTween.stop();
                this.winterClouds.visible = false;

                //Clear out page 2
                this.mole.visible = false;
                this.dirt.visible = false;

                //set up page 1!
                this.acorn.visible = true;
                this.drink.visible = true;
                break;
            case 2:
                this.title.setText('ENEMIES');
                //clear out page 1
                this.acorn.visible = false;
                this.drink.visible = false;

                //set up page 2
                this.mole.visible = true;
                this.dirt.visible = true;
                break;
            case this.MAXPAGE:
                //Clear out page 2
                this.mole.visible = false;
                this.dirt.visible = false;
                break;
        }
        this.text1.setText(this.instruct[this.page]);
    },

    onClickFunction: function(btn){
        if(btn == this.startBtn)
         this.game.state.start('Game');
    },

    tiltButton: function(btn){
        var txt;
        if(btn == this.startBtn)
            txt = this.startTxt;
        else if(btn == this.instrBut)
            txt = this.instrTxt;

        this.tiltTween1 = this.add.tween(btn).to({angle: -20}, 2000,
            function(t){
                return Math.sin(Math.PI * 2 * t);
            }, true, 0, -1);
        this.tiltTween1.start();
    
        this.tiltTween2 = this.add.tween(txt).to({angle: -20}, 2000,
            function(t){
                return Math.sin(Math.PI * 2 * t);
            }, true, 0, -1);
        this.tiltTween2.start();
    },

    stopTilt: function(btn){
        var txt;
        if(btn == this.startBtn)
            txt = this.startTxt;
        else if(btn == this.instrBut)
            txt = this.instrTxt;
        this.tiltTween1.stop();
        this.tiltTween2.stop();
        stopTween = this.add.tween(btn).to({angle: 0},100);
        txtStopTween = this.add.tween(txt).to({angle: 0}, 100);
        txtStopTween.start();
        stopTween.start();
        
    }
};