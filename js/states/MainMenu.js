BasicGame.MainMenu = function(game) {

};
//MAke sure to credit http://www.freesfx.co.uk and https://www.freesound.org
BasicGame.MainMenu.prototype = {

    preload: function() {
        //preload your stuff here
    },

    create: function() {
        this.loadSettings();

        if(BasicGame.menutheme == null){
            BasicGame.menutheme = this.add.audio('Menu Theme',.6);
            BasicGame.menutheme.loop = true;
        }
        if(BasicGame.musicEnabled && !BasicGame.menutheme.isPlaying){
            BasicGame.menutheme.play();
        }


        this.game.stage.backgroundColor = '#006fe6';
        var toon = this.add.sprite(game.width,game.height, 'UI_TA', 'Toon the Squirrel Standing');
        toon.anchor.setTo(1,1);
        var title = this.add.sprite(100,100, 'UI_TA');
        title.frameName ='Title';
        title.scale.setTo(.8,.8);
        title.anchor.setTo(.5,.5);
        title.position.setTo(this.game.width/2, 2*this.game.height/5);


        this.startBtn = this.game.add.button(0,0, 'UI_TA', this.onClickFunction, this, 'button', 'button', 'button');
        this.startBtn.anchor.setTo(.5,.5);
        this.startBtn.position.setTo(3* this.game.width/8 - this.startBtn.width/2, 
            5 * this.game.height/6 - this.startBtn.height/2);

        this.startBtn.txt = this.add.bitmapText(this.startBtn.position.x-5, this.startBtn.position.y, 'zantroke', 'START', 30);
        this.startBtn.txt.anchor.setTo(.5,.5);

        this.startBtn.onInputOver.add(this.tiltButton, this, 0);
        this.startBtn.onInputOut.add(this.stopTilt, this, 0);

        this.instrBut = this.game.add.button(0,0, 'UI_TA', this.onClickFunction, this, 'button', 'button', 'button');
        this.instrBut.anchor.setTo(.5,.5);
        this.instrBut.position.setTo( 6* this.game.width/8 - this.instrBut.width/2,
                                      5 * this.game.height/6 - this.instrBut.height/2);

        this.instrBut.txt = this.game.add.bitmapText(this.instrBut.position.x -5, this.instrBut.position.y,
         'zantroke', 'INSTRUCTIONS', 18);
        this.instrBut.txt.anchor.setTo(.5,.5);
        this.instrBut.onInputOver.add(this.tiltButton, this, 0);
        this.instrBut.onInputOut.add(this.stopTilt, this, 0);

        if(BasicGame.score != undefined){
            var highscoreText = this.add.bitmapText(game.width/2, 7 * game.height/8,
            'zantroke', 'HIGHSCORE: ' + BasicGame.score, 30);
            highscoreText.anchor.setTo(.5,0);
        }

        this.creditText = this.add.bitmapText(game.width-5, 5, 'zantroke', 
            'SFX from freesfx.co.uk and freesound.org', 19);
        this.creditText.anchor.setTo(1,0);
    },

    loadSettings: function(){
        if(localStorage['soundEnabled'] != null){
            this.soundEnabled = (localStorage['soundEnabled'] == 'true');
        }

        if(localStorage['musicEnabled'] != null){
            BasicGame.musicEnabled = (localStorage['musicEnabled'] == 'true');
        }

        if(localStorage['score'] != null){
            BasicGame.score = parseInt(localStorage['score']);
        }
    },

    update: function() {
        //Do some nice funky main menu stuff here

    },

    onClickFunction: function(btn){
        if(btn == this.startBtn)
            this.game.state.start('Game');
        else if (btn == this.instrBut)
            this.game.state.start('Instructions');
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
        btn.stopTween = this.add.tween(btn).to({angle: 0},100);
        btn.txt.stopTween = this.add.tween(btn.txt).to({angle: 0}, 100);
        btn.txt.stopTween.start();
        btn.stopTween.start();
        
    }
};