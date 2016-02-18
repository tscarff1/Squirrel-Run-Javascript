var BasicGame = {};

BasicGame.Boot = function(game) {

};

BasicGame.Boot.prototype = {

    init: function() {
        //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
        this.input.maxPointers = 1;

        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        //this.stage.disableVisibilityChange = true;

       // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.setShowAll();
        this.scale.pageAlignHorizontally = false;
        this.scale.pageAlignVertically = false;
        //this.scale.setScreenSize(false);
        this.scale.refresh();
        this.game.stage.backgroundColor = '#006fe6';

    },

    preload: function() {

        //  Here we load the assets required for our preloader (in this case a background and a loading bar)
        this.load.atlas('PRELOAD_TA', 'assets/images/PRELOAD_TA.png', 'assets/json/PRELOAD_TA.json');

    },

    create: function() {

        //  By this point the preloader assets have loaded to the cache, we've set the game settings
        //  So now let's start the real preloader going
        this.state.start('Preloader');

    }

};