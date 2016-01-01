BasicGame.MainMenu = function(game) {

};

BasicGame.MainMenu.prototype = {

    preload: function() {
        //preload your stuff here
    },

    create: function() {
        //create your stuff here
        var bg = this.add.sprite(0, 0, 'ta0', 'assets1_bg.png');
        var startBtn = this.add.button(0, 0, 'ta0', btnClick, this, 'assets1_btn_play.png', 'assets1_btn_play.png', 'assets1_btn_play.png');
        startBtn.x = this.game.width * .5 - (startBtn.width * .5);
        startBtn.y = this.game.height * .5 - (startBtn.height * .5);

        var aboutBtn = this.add.button(0, 0, 'ta0', btnClick, this, 'assets1_btn_about.png', 'assets1_btn_about.png', 'assets1_btn_about.png');
        aboutBtn.x = this.game.width * .5 - (aboutBtn.width * .5);
        aboutBtn.y = this.game.height * .5 + aboutBtn.height;


        function btnClick(target) {

            if (target == startBtn) {
                this.game.state.start('Game');
            } else if (target == aboutBtn) {
                this.game.state.start('About');
            } else {
                console.log('FAIL');
            }
        }
    },

    update: function() {
        //Do some nice funky main menu stuff here

    }

};