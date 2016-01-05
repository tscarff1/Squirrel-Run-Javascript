BasicGame.MainMenu = function(game) {

};

BasicGame.MainMenu.prototype = {

    preload: function() {
        //preload your stuff here
    },

    create: function() {
        
        this.add.sprite(0,0, 'UI_TA').frameName ='Toon the Squirrel Standing';
        var title = this.add.sprite(100,100, 'UI_TA');
        title.frameName ='Title';
        title.scale.setTo(.8,.8);
        title.anchor.setTo(.5,.5);
        title.position.setTo(this.game.width/2, 2*this.game.height/5);


        this.startBtn = this.game.add.button(0,0, 'UI_TA', this.onClickFunction, this, 'button', 'button', 'button');
        this.startBtn.anchor.setTo(.5,.5);
        this.startBtn.position.setTo(3* this.game.width/8 - this.startBtn.width/2, 
            7 * this.game.height/8 - this.startBtn.height/2);

        this.startTxt = this.add.bitmapText(this.startBtn.position.x-5, this.startBtn.position.y, 'zantroke', 'START', 30);
        this.startTxt.anchor.setTo(.5,.5);
    },

    update: function() {
        //Do some nice funky main menu stuff here

    },

    onClickFunction: function(btn){
        this.game.state.start('Game');
    }

};