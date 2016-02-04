BasicGame.GameOver = function(game) {

};

BasicGame.GameOver.prototype = {

    init: function() {
        this.game.stage.backgroundColor = '#003975';

    },

    preload: function() {


    },

    create: function() {
        console.log(BasicGame.score);
        kongregate.stats.submit("Score",BasicGame.score); // The user collected a coin

        var theme = this.add.audio('GameOver Theme');
        theme.play();

        
        var tree1 = this.add.sprite(0,0,'PLAY_TA2', 'snowtree');
        this.sleepy = this.add.sprite(0,0,'UI_TA', 'Sleeping Toon');
        this.sleepy.anchor.setTo(.5,1);
        this.sleepy.position.x = this.game.width/2;
        this.sleepy.position.y = this.game.height - 10;


        var panel = this.add.sprite(0,0,'UI_TA2', 'PauseScreen');
        panel.scale.setTo(1.5,.9);
        panel.anchor.setTo(.5,0);
        panel.position.setTo(game.width/2, 20);

        this.scoreTxt = this.add.bitmapText(game.width/2, 60, 'zantroke', 'YOUR FINAL SCORE WAS: ', 30);
        this.scoreTxt.anchor.setTo(.5,.5);
        this.scoreTxt.tint = 0xff0000;
        this.numTxt = this.add.bitmapText(game.width/2, 
            130, 'zantroke', '' + BasicGame.score, 50);
        this.numTxt.anchor.setTo(.5,.5);


         this.startBtn = this.game.add.button(0,0, 'UI_TA', this.onClickFunction, this, 'button', 'button', 'button');
        this.startBtn.anchor.setTo(.5,.5);
        this.startBtn.position.setTo(3* this.game.width/8 - this.startBtn.width/2, 
            7 * this.game.height/8 - this.startBtn.height/2);

        this.startTxt = this.add.bitmapText(this.startBtn.position.x-5, this.startBtn.position.y, 'zantroke', 'START', 30);
        this.startTxt.anchor.setTo(.5,.5);

        this.startBtn.onInputOver.add(this.tiltButton, this, 0);
        this.startBtn.onInputOut.add(this.stopTilt, this, 0);

        this.tiltTween1;
        this.tiltTween2;

        this.menuBut = this.game.add.button(0,0, 'UI_TA', this.onClickFunction, this, 'button', 'button', 'button');
        this.menuBut.anchor.setTo(.5,.5);
        this.menuBut.position.setTo( 6* this.game.width/8 - this.menuBut.width/2,
                                      7 * this.game.height/8 - this.menuBut.height/2);

        this.menuTxt = this.game.add.bitmapText(this.menuBut.position.x -5, this.menuBut.position.y,
         'zantroke', 'Main Menu', 21);
        this.menuTxt.anchor.setTo(.5,.5);
        this.menuBut.onInputOver.add(this.tiltButton, this, 0);
        this.menuBut.onInputOut.add(this.stopTilt, this, 0);

    },

    onClickFunction: function(btn){
        if(btn == this.startBtn)
         this.game.state.start('Game');
        else
            this.game.state.start('MainMenu');
    },

     tiltButton: function(btn){
        var txt;
        if(btn == this.startBtn)
            txt = this.startTxt;
        else if(btn == this.menuBut)
            txt = this.menuTxt;

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
        else if(btn == this.menuBut)
            txt = this.menuTxt;
        this.tiltTween1.stop();
        this.tiltTween2.stop();
        stopTween = this.add.tween(btn).to({angle: 0},100);
        txtStopTween = this.add.tween(txt).to({angle: 0}, 100);
        txtStopTween.start();
        stopTween.start();
        
    }

};