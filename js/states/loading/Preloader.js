BasicGame.Preloader = function(game) {

    this.background = null;
    this.preloadBar = null;

    this.ready = false;

};

BasicGame.Preloader.prototype = {

    preload: function() {
        //setup the loader image that was loaded in Boot.js
     //   this.hyperBar = this.add.sprite(231, 58, 'UI_TA', 'Hyper Bar Meter');


       // this.load.setPreloadSprite(this.hyperBar);

        this.load.atlasJSONHash('Play_TA', 'assets/images/Play_TA.png', 'assets/json/Play_TA.json');
        this.load.atlasJSONHash('UI_TA', 'assets/images/UI_TA.png', 'assets/json/UI_TA.json');
        this.load.atlasJSONHash('UI_TA2', 'assets/images/UI_TA2.png', 'assets/json/UI_TA2.json');
        this.load.atlasJSONHash('PLAY_TA2', 'assets/images/PLAY_TA2.png', 'assets/json/PLAY_TA2.json');

        this.load.bitmapFont('zantroke', 'assets/fonts/zantroke_0.png', 'assets/fonts/zantroke.fnt');

        game.load.audio('Menu Theme', 'assets/audio/MenuTheme.mp3', 'assets/audio/MenuTheme.ogg');
        game.load.audio('Game Theme', 'assets/audio/Squirrel_Run_Theme.mp3','assets/audio/Squirrel_Run_Theme.ogg');
        game.load.audio('Ow','assets/audio/ow.ogg');
        game.load.audio('Boing', 'assets/audio/boing.mp3', 'assets/audio/boing.ogg');
        game.load.audio('Slide', 'assets/audio/slide_whistle.mp3', 'assets/audio/slide_whistle.ogg');
        game.load.audio('Crash', 'assets/audio/crash.mp3', 'assets/audio/crash.ogg');
        game.load.audio('Pop', 'assets/audio/pop.mp3', 'assets/audio/pop.ogg');
        game.load.audio('Engine', 'assets/audio/ferrari_engine_roar.mp3', 'assets/audio/ferrari_engine_roar.ogg');
        game.load.audio('Honk', 'assets/audio/honk.mp3', 'assets/audio/honk.ogg');
        game.load.audio('Wind', 'assets/audio/wind.mp3', 'assets/audio/wind.ogg');
        game.load.audio('Yihoo', 'assets/audio/yihoo.mp3', 'assets/audio/yihoo.ogg');
        game.load.audio('Clipclop', 'assets/audio/clipclop.mp3', 'assets/audio/clipclop.ogg');
        game.load.audio('Gong', 'assets/audio/gong.mp3', 'assets/audio/gong.ogg');
        game.load.audio('Bye', 'assets/audio/bye.mp3', 'assets/audio/bye.ogg')
        game.load.audio('GameOver Theme', 'assets/audio/GameOverTheme.mp3', 'assets/audio/GameOverTheme.ogg');
        //Without this there will be a delay in-game before the music starts
        this.music = this.add.audio('Game Theme');
    },

    create: function() {

        

    },
    update: function(){
        if(!this.music.isDecoding)
            this.state.start('MainMenu');
    }

};