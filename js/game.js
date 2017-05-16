/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */

// let isPlaying = false;

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
        self.playButton.events.onInputUp.add(this.enablePlaying, this);

        // Platforms group
        self.platforms = game.add.group();
        self.platforms.enableBody = true;
        self.platforms.inputEnableChildren = true;

        // Ground
        self.ground = self.platforms.create(0, game.world.height - 64, 'ground');
        self.ground.scale.setTo(2,2);
        // ground.body.immovable = false;

        // Ledges
        self.ledge1 = self.platforms.create(400, 400, 'ground');
        self.ledge1.inputEnabled = true;
        self.ledge1.input.enableDrag();
        self.ledge1.input.enableSnap(32,32,true,true);
        // ledge1.body.immovable = false;
        self.ledge2 = self.platforms.create(-150, 250, 'ground');
        // ledge2.body.immovable = false;

        // Player
        self.player = game.add.sprite(10, 10, 'dude');
        game.physics.arcade.enable(self.player);

        self.player.body.bounce.y = 0.2;
        // player.body.gravity.y = 300;
        self.player.body.collideWorldBounds = true;

        self.player.animations.add('left', [0, 1, 2, 3], 10, true);
        self.player.animations.add('right', [5, 6, 7, 8], 10, true);

        self.cursors = game.input.keyboard.createCursorKeys();
    },

    update: function () {
        let self = this;

        if (game.input.activePointer.rightButton.isDown) {
            // addLedge();
        }

        if (self.isPlaying) {
            let hitPlatform = game.physics.arcade.collide(self.player, self.platforms);

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
            switchDragging(false, self.ledge1, self.ledge2);
            self.playButton.loadTexture('pause');
            self.platforms.enableBody = true;
            self.ground.body.immovable = true;
            self.ledge1.body.immovable = true;
            self.ledge2.body.immovable = true;
            self.player.body.moves = true;
            self.player.body.gravity.y = 300;
        } else {
            reset(self.playButton, self.player, self.ground, self.ledge1, self.ledge2);
        }
    }

};

function reset(playButton, player, ground, ledge1, ledge2) {
    playButton.loadTexture('play');

    player.position.x = 10;
    player.position.y = 10;
    player.body.moves = false;
    player.animations.stop();
    player.frame = 4;

    ground.body.immovable = false;
    ledge1.body.immovable = false;
    ledge2.body.immovable = false;

    switchDragging(true,ledge1,ledge2);
}

function switchDragging(switchDrag, ledge1, ledge2) {
    ledge1.inputEnabled = switchDrag;
    ledge2.inputEnabled = switchDrag;
}

function addLedge() {
    ledge = platforms.create(400, 400, 'ground');
    ledge.inputEnabled = true;
    ledge.input.enableDrag();
    ledge.input.enableSnap(32,32,true,true);
}
