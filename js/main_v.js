/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */
let game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');

let isPlaying = false;
// let ground;
let platforms;

let GameState = {
    preload: function () {
        game.load.image('sky', 'assets/images/sky.png');
        game.load.image('ground', 'assets/images/platform.png');
        game.load.image('star', 'assets/images/star.png');
        game.load.spritesheet('dude', 'assets/images/dude.png', 32, 48);
    },

    create: function() {
        game.canvas.addEventListener('mousedown', this.enablePlaying);

        // Physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Background
        game.add.sprite(0,0,'sky');

        platforms = game.add.group();
        // Ground
        this.ground = platforms.create(0, game.world.height - 64, 'ground');
        this.ground.scale.setTo(2,2);
        // ground.body.immovable = true;

        // Ledges
        this.ledge = platforms.create(400, 400, 'ground');
        // ledge.body.immovable = true;
        this.ledge = platforms.create(-150, 250, 'ground');
        // ledge.body.immovable = true;

        // Player
        this.player = game.add.sprite(32, game.world.height -150, 'dude');
        // game.physics.arcade.enable(player);

        // player.body.bounce.y = 0.2;
        // player.body.gravity.y = 300;
        // player.body.collideWorldBounds = true;

        this.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);

        this.cursors = game.input.keyboard.createCursorKeys();
    },

    update: function () {
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

        this.ground.body.immovable = true;
        this.ledge.body.immovable = true;
        this.ledge.body.immovable = true;
        game.physics.arcade.enable(this.player);
        this.player.body.bounce.y = 0.2;
        this.player.body.gravity.y = 300;
        this.player.body.collideWorldBounds = true;

        isPlaying = true;

    }

};

game.state.add('gameStart', GameState);
game.state.start('gameStart');