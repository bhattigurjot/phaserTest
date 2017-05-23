/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */

"use strict";

// let obj = localStorage.getItem('all-items');
// let phaserJSON = null;
Client.requestDataFromJSON();

let GameState = {
    player: null,
    background: null,
    platforms: null,
    ground: null,
    cursors: null,
    playButton: null,
    isPlaying: false,
    sKey: null,
    phaserJSON: null,
    totalVersions: null,
    currentVersion: null,

    preload: function () {
        game.load.image('play', 'assets/images/play.png');
        game.load.image('pause', 'assets/images/pause.png');
        game.load.image('sky', 'assets/images/sky.png');
        game.load.image('ground', 'assets/images/platform.png');
        game.load.image('star', 'assets/images/star.png');
        // game.load.json('versions', 'assets/save.json');
        game.load.spritesheet('dude', 'assets/images/dude.png', 32, 48);
    },

    create: function() {
        let self = this;

        // Enable advanced timing to display FPS
        game.time.advancedTiming = true;

        // Read into json object
        // phaserJSON = game.cache.getJSON('versions');
        self.phaserJSON = Client.dataJSON;

        // Input
        self.cursors = game.input.keyboard.createCursorKeys();
        game.input.mouse.capture = true;

        self.sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
        self.sKey.onDown.add(self.writeJSON, self);

        // Disable right click context menu
        game.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };

        // Physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Background
        self.background = game.add.sprite(0,0,'sky');
        self.background.inputEnabled = true;
        self.background.events.onInputDown.add(self.addLedge, self);

        // Play button
        self.playButton = game.add.sprite(100, 15,'play');
        // playButton.scale.setTo(0.25,0.25);
        self.playButton.inputEnabled = true;
        self.playButton.events.onInputUp.add(self.enablePlaying, self);

        // Platforms group
        self.platforms = game.add.group();
        self.platforms.enableBody = true;
        self.platforms.inputEnableChildren = true;

        // Ground
        // self.ground = self.platforms.create(0, game.world.height - 64, 'ground');
        self.ground = game.add.sprite(0, game.world.height - 64, 'ground');
        game.physics.arcade.enable(self.ground);
        self.ground.scale.setTo(2,2);
        self.ground.enableBody = true;
        self.ground.body.immovable = true;

        // Ledges - drawn after reading JSON file and according to correct version
        self.totalVersions = self.phaserJSON.versions.length;
        self.readJSONAndChangeVersion(self.totalVersions);
        // localStorage.clear();

        // Player
        self.player = new Player(10,10);

        // Draw Tree View
        drawTree(self.phaserJSON);
    },

    update: function () {
        let self = this;

        if (self.isPlaying) {
            let hitPlatform = game.physics.arcade.collide(self.player, self.platforms);
            let hitGround = game.physics.arcade.collide(self.player, self.ground);

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

            //  Allow the player to jump if they are touching the ground or platform.
            if (self.cursors.up.isDown && self.player.body.touching.down && (hitPlatform || hitGround))
            {
                self.player.body.velocity.y = -350;
            }
        }

        // Display current version on screen
        game.debug.text("Current Version:" + self.currentVersion, 72, 14, "#000000");
    },

    render: function () {
        // Displays FPS on screen
        game.debug.text("FPS:" + game.time.fps, 2, 14, "#000000");
    },
    
    enablePlaying: function () {
        let self = this;

        // Flip the boolean value for playing condition
        self.isPlaying = !self.isPlaying;

        if (self.isPlaying) {
            switchDragging(false, self.platforms);
            // Change button texture to pause
            self.playButton.loadTexture('pause');
            // enable physics body on all ledges and make them immovable
            self.platforms.enableBody = true;
            self.platforms.forEach(function (item, index) {
                item.body.immovable = true;
            });

            // Allows player to move and add gravity to player
            self.player.body.moves = true;
            self.player.body.gravity.y = 300;
        } else {
            // Resets scene
            reset(self.playButton, self.player, self.platforms);
        }
    },

    addLedge: function (background, pointer) {
        let self = this;

        // Right click to place ledge on screen
        if (pointer.rightButton.isDown && !self.isPlaying) {
            self.platforms.add(Ledge(self.platforms, game.input.activePointer.x, game.input.activePointer.y));
        }
    },

    writeJSON: function () {
        let self = this;

        // let data, text, iter;

        // data = '{"items":[';
        // self.platforms.forEach(function(item,index) {
        //     text = '{"x":'+ item.x + ', "y":'+ item.y + '}';
        //     data += text + ", ";
        // });
        // data = data.substring(0, data.length - 2);
        // data += ']}';

        // localStorage.setItem('all-items', data);

        let arr = [];

        self.platforms.forEach(function(item,index) {
            let temp = {};
            temp.x = item.x;
            temp.y = item.y;
            arr.push(temp);
        });

        // Make sure to save only if the current version is different from the previous version
        self.phaserJSON.versions.forEach(function (item) {
            if (item.id === self.currentVersion && !self.isPlaying) {

                // CHeck if both versions are equal or not
                if (JSON.stringify(arr) !== JSON.stringify(item.items)) {
                    let tV = self.phaserJSON.versions.length;

                    self.phaserJSON.versions.push({
                        "id":(tV + 1),
                        "parent":self.currentVersion,
                        "items":arr
                    });

                    self.currentVersion = tV + 1;

                    Client.saveToJSON(self.phaserJSON);
                    changeVersion(self.currentVersion);
                    drawTree(self.phaserJSON);
                }
            }
        });

    },

    readJSONAndChangeVersion: function (id = 1) {
        let self = this;

        // deletes all the ledges
        self.platforms.removeAll(true);

        // read json file and draws ledges on screen
        if (self.phaserJSON === null) {
            self.currentVersion = 1;
            self.platforms.add(Ledge(self.platforms,100,100));
            self.platforms.add(Ledge(self.platforms,400,400));
            self.platforms.add(Ledge(self.platforms,10,250));
        } else {
            self.currentVersion = id;
            self.phaserJSON.versions.forEach(function (item) {
                if (item.id === self.currentVersion) {
                    item.items.forEach(function (i) {
                        self.platforms.add(Ledge(self.platforms,i.x,i.y));
                    });
                }

            });
        }
    }

};

// This resets the player position and makes ledges movable
function reset(playButton, player, ledges) {
    // change the playbutton texture to play
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

// This toggles the dragging of sprites
function switchDragging(switchDrag, ledges) {
    ledges.forEach(function (item, index) {
        item.inputEnabled = switchDrag;
    });

}

// This deletes the ledge sprite on which middle mouse is clicked
function destroySprite(sprite, pointer) {
    if (pointer.middleButton.isDown && !self.isPlaying) {
        sprite.destroy();
    }
}

// Player Factory function
function Player(x, y) {
    let player = game.add.sprite(x, y, 'dude');

    // Physics and options
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;

    // Player's animations
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    return player;
}

// Ledge Factory function
function Ledge(group,x,y) {
    let ledge = group.create(x, y, 'ground');
    ledge.scale.setTo(0.5,1);

    // Enable dragging and snapping
    ledge.input.enableDrag();
    ledge.input.enableSnap(32,32,true,true);

    // bind function to destroy the ledge
    ledge.events.onInputDown.add(destroySprite, this);

    return ledge;
}