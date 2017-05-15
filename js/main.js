/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */
let game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');

let isPlaying = false;
let ground, ledge1, ledge2;
let platforms, player, curors;
let playbutton;

let GameState = {
    preload: function () {
        game.load.image('play', 'assets/images/play.png');
        game.load.image('pause', 'assets/images/pause.png');
        game.load.image('sky', 'assets/images/sky.png');
        game.load.image('ground', 'assets/images/platform.png');
        game.load.image('star', 'assets/images/star.png');
        game.load.spritesheet('dude', 'assets/images/dude.png', 32, 48);
    },

    create: function() {
        // game.canvas.addEventListener('mousedown', this.enablePlaying);
        // Disable right click context meny
        game.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };

        // Physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Background
        game.add.sprite(0,0,'sky');

        // Play button
        playButton = game.add.sprite(700, 10,'play');
        // playButton.scale.setTo(0.25,0.25);
        playButton.inputEnabled = true;
        playButton.events.onInputUp.add(this.enablePlaying, this);

        // Platforms group
        platforms = game.add.group();
        platforms.enableBody = true;
        platforms.inputEnableChildren = true;

        // Ground
        ground = platforms.create(0, game.world.height - 64, 'ground');
        ground.scale.setTo(2,2);
        // ground.body.immovable = false;

        // Ledges
        ledge1 = platforms.create(400, 400, 'ground');
        ledge1.inputEnabled = true;
        ledge1.input.enableDrag();
        ledge1.input.enableSnap(32,32,true,true);
        // ledge1.body.immovable = false;
        ledge2 = platforms.create(-150, 250, 'ground');
        // ledge2.body.immovable = false;

        // Player
        player = game.add.sprite(10, 10, 'dude');
        game.physics.arcade.enable(player);

        player.body.bounce.y = 0.2;
        // player.body.gravity.y = 300;
        player.body.collideWorldBounds = true;

        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);

        cursors = game.input.keyboard.createCursorKeys();
    },

    update: function () {

        if (game.input.activePointer.rightButton.isDown) {
            addLedge();
        }

        if (isPlaying) {
            let hitPlatform = game.physics.arcade.collide(player, platforms);

            player.body.velocity.x = 0;

            if (cursors.left.isDown)
            {
                //  Move to the left
                player.body.velocity.x = -150;
                player.animations.play('left');
            }
            else if (cursors.right.isDown)
            {
                //  Move to the right
                player.body.velocity.x = 150;
                player.animations.play('right');
            }
            else
            {
                //  Stand still
                player.animations.stop();
                player.frame = 4;
            }

            //  Allow the player to jump if they are touching the ground.
            if (cursors.up.isDown && player.body.touching.down && hitPlatform)
            {
                player.body.velocity.y = -350;
            }
        }
    },
    
    enablePlaying: function () {
        // game.physics.startSystem(Phaser.Physics.ARCADE);
        isPlaying = !isPlaying;

        if (isPlaying) {
            switchDragging(false);
            playButton.loadTexture('pause');
            platforms.enableBody = true;
            ground.body.immovable = true;
            ledge1.body.immovable = true;
            ledge2.body.immovable = true;
            player.body.moves = true;
            player.body.gravity.y = 300;
        } else {
            reset();
        }

    }

};

function reset() {
    playButton.loadTexture('play');

    player.position.x = 10;
    player.position.y = 10;
    player.body.moves = false;
    player.animations.stop();
    player.frame = 4;

    ground.body.immovable = false;
    ledge1.body.immovable = false;
    ledge2.body.immovable = false;

    switchDragging(true);
}

function switchDragging(switchDrag) {
    ledge1.inputEnabled = switchDrag;
    ledge2.inputEnabled = switchDrag;
}

function addLedge() {
    ledge = platforms.create(400, 400, 'ground');
    ledge.inputEnabled = true;
    ledge.input.enableDrag();
    ledge.input.enableSnap(32,32,true,true);
}

game.state.add('gameStart', GameState);
game.state.start('gameStart');