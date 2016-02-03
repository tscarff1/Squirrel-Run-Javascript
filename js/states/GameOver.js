BasicGame.GameOver = function(game) {

};

BasicGame.GameOver.prototype = {

    init: function() {
        this.game.stage.backgroundColor = '#003975';

    },

    preload: function() {


    },

    create: function() {
        var theme = this.add.audio('GameOver Theme');
        theme.play();
        var acorns = this.add.sprite(0,0, 'UI_TA', 'acorns');
        acorns.anchor.setTo(0,1);
        acorns.scale.setTo(1,1);
        acorns.position.y = this.game.height + 80;
        this.sleepy = this.add.sprite(0,0,'UI_TA', 'Sleeping Toon');
        this.sleepy.anchor.setTo(.5,1);
        this.sleepy.position.x = this.game.width/2;
        this.sleepy.position.y = this.game.height - 10;

        var panel = this.add.sprite(0,0,'UI_TA2', 'PauseScreen');
        panel.scale.setTo(1.5,.9);
        panel.anchor.setTo(.5,0);
        panel.position.setTo(game.width/2, 20);
    }

};