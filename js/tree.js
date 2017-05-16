/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */

let TreeState = {
    background: null,
    playButton: null,

    preload: function () {
        tree.load.image('play', 'assets/images/play.png');
        tree.load.image('pause', 'assets/images/pause.png');
        tree.load.image('sky', 'assets/images/sky.png');
    },

    create: function() {
        let self = this;

        // Input
        // self.cursors = game.input.keyboard.createCursorKeys();
        tree.input.mouse.capture = true;

        // Disable right click context meny
        tree.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };

        // Background
        self.background = tree.add.sprite(0,0,'sky');
        self.background.tint = 0.4 * 0xffffff;

        // Play button
        self.playButton = tree.add.sprite(10, 10,'play');
        self.playButton.inputEnabled = true;
        self.playButton.events.onInputUp.add(self.enablePlaying, self);

    },

    update: function () {

    },

    enablePlaying: function () {
        GameState.enablePlaying();
    }

};

