/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */

let GameState = {
    player: null,
    platforms: null,
    ground: null,
    ledge1: null,
    ledge2: null,
    cursors: null,
    playButton: null,
    isPlaying: false,

    preload: function () {
        game.load.image('play', 'assets/images/play.png');
        game.load.image('pause', 'assets/images/pause.png');
        game.load.image('sky', 'assets/images/sky.png');
        game.load.image('ground', 'assets/images/platform.png');
        game.load.image('star', 'assets/images/star.png');
        game.load.spritesheet('dude', 'assets/images/dude.png', 32, 48);
    },

    create: function() {
        let self = this;

        // Disable right click context meny
        game.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };

        // Physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Background
        game.add.sprite(0,0,'sky');

        // Play button
        self.playButton = game.add.sprite(700, 10,'play');
        // playButton.scale.setTo(0.25,0.25);
        self.playButton.inputEnabled = true;
        self.playButton.events.onInputUp.add(self.enablePlaying, self);

        // Platforms group
        self.platforms = game.add.group();
        self.platforms.enableBody = true;
        self.platforms.inputEnableChildren = true;

        // Ground
        self.ground = self.platforms.create(0, game.world.height - 64, 'ground');
        self.ground.scale.setTo(2,2);

        // Ledges
        self.platforms.add(Ledge(self.platforms,100,100));
        self.platforms.add(Ledge(self.platforms,400,400));
        self.platforms.add(Ledge(self.platforms,-150,250));

        // Player
        self.player = new Player(10,10);

        self.cursors = game.input.keyboard.createCursorKeys();
    },

    update: function () {
        let self = this;

        if (game.input.activePointer.rightButton.isDown) {
            // addLedge();
        }

        if (self.isPlaying) {
            let hitPlatform = game.physics.arcade.collide(self.player, self.platforms);

            // self.player.stop();
            self.player.body.velocity.x = 0;

            if (self.cursors.left.isDown)
            {
                //  Move to the left
                self.player.body.velocity.x = -150;
                self.player.animations.play('left');
            }
            else if (self.cursors.right.isDown)
            {
                //  Move to the right
                self.player.body.velocity.x = 150;
                self.player.animations.play('right');
            }
            else
            {
                //  Stand still
                self.player.animations.stop();
                self.player.frame = 4;
            }

            //  Allow the player to jump if they are touching the ground.
            if (self.cursors.up.isDown && self.player.body.touching.down && hitPlatform)
            {
                self.player.body.velocity.y = -350;
            }
        }
    },
    
    enablePlaying: function () {
        let self = this;
        // game.physics.startSystem(Phaser.Physics.ARCADE);
        self.isPlaying = !self.isPlaying;

        if (self.isPlaying) {
            switchDragging(false, self.platforms);
            self.playButton.loadTexture('pause');
            self.platforms.enableBody = true;

            self.platforms.forEach(function (item, index) {
                item.body.immovable = true;
            });

            self.player.body.moves = true;
            self.player.body.gravity.y = 300;
        } else {
            reset(self.playButton, self.player, self.platforms);
        }
    }

};

function reset(playButton, player, ledges) {
    playButton.loadTexture('play');

    player.position.x = 10;
    player.position.y = 10;
    player.body.moves = false;
    player.animations.stop();
    player.frame = 4;

    ledges.forEach(function (item, index) {
        item.immovable = false;
    });

    switchDragging(true,ledges);
}

function switchDragging(switchDrag, ledges) {

    ledges.forEach(function (item, index) {
        item.inputEnabled = switchDrag;
    });

}

function Player(x, y) {
    let player = game.add.sprite(x, y, 'dude');
    game.physics.arcade.enable(player);

    player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    return player;
}

function Ledge(group,x,y) {
    let ledge = group.create(x, y, 'ground');
    ledge.input.enableDrag();
    ledge.input.enableSnap(32,32,true,true);
    bounds = new Phaser.Rectangle(100, 100, 500, 400);
    ledge.input.boundsRect = bounds;

    return ledge;
}