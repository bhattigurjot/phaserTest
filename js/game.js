/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */

"use strict";

let undoManager = new UndoManager();

// let obj = localStorage.getItem('all-items');
// let phaserJSON = null;
Client.requestDataFromJSON();

let GameState = {
    player: null,
    background: null,
    platforms: null,
    platforms2: null,
    ground: null,
    cursors: null,
    playButton: null,
    isPlaying: false,
    sKey: null,
    phaserJSON: null,
    totalVersions: null,
    currentVersion: null,
    isSavingLevel: false,
    isSavingVersion: false,

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

        // For preview
        self.platforms2 = game.add.group();

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
        } else {
            if (game.input.keyboard.isDown(Phaser.Keyboard.CONTROL)) {
                self.isSavingLevel = true;
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.ALT)) {
                self.isSavingVersion = true;
            } else {
                self.isSavingLevel = false;
                self.isSavingVersion = false;
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
        // if (pointer.rightButton.isDown && !self.isPlaying) {
        //     self.platforms.add(Ledge(self.platforms, game.input.activePointer.x, game.input.activePointer.y));
        // }

        if (pointer.rightButton.isDown && !self.isPlaying) {
            console.log('here');
            let x = game.input.activePointer.x;
            let y = game.input.activePointer.y;
            self.platforms.add(Ledge(self.platforms, x, y));

            undoManager.add({
                undo: function () {
                    self.platforms.getChildAt(self.platforms.length - 1).destroy();
                    console.log('undo');
                },
                redo: function () {
                    self.platforms.add(Ledge(self.platforms, x, y));
                    console.log('redo');
                }
            });
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
            if (item.id === self.currentVersion && !self.isPlaying && self.isSavingLevel) {

                // CHeck if both versions are equal or not
                if (JSON.stringify(arr) !== JSON.stringify(item.items)) {
                    let tV = self.phaserJSON.versions.length;

                    // console.log(self.phaserJSON.versions[item.id-1]);
                    self.phaserJSON.versions[item.id - 1].items = arr;
                    //
                    Client.saveToJSON(self.phaserJSON);

                    drawTree(self.phaserJSON);
                }
            }
            if (item.id === self.currentVersion && !self.isPlaying && self.isSavingVersion) {

                // CHeck if both versions are equal or not
                if (JSON.stringify(arr) !== JSON.stringify(item.items)) {
                    let tV = self.phaserJSON.versions.length;

                    self.phaserJSON.versions.push({
                        "id":(tV + 1),
                        "label":"Node " + (tV + 1),
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
    },

    previewLevel: function (id) {
        let self = this;

        // deletes all the ledges from preview
        self.platforms2.removeAll(true);

        // read json file and draws ledges on screen
        if (self.phaserJSON === null) {

        } else {
            self.phaserJSON.versions.forEach(function (item) {
                // draw preview ledges if the selected node exists
                // and is not the current version
                // also not playing
                if (item.id === id && self.currentVersion !== id && !self.isPlaying) {

                    item.items.forEach(function (i) {
                        self.platforms2.add(Ledge(self.platforms,i.x,i.y));
                    });
                }

            });

            game.world.bringToTop(self.platforms2);

            self.platforms2.forEach(function (item, index) {
                item.tint = 0x000000;
                // item.alpha = 0.8;
            });
        }
    },

    previewLevelDisabled: function () {
        let self = this;

        // deletes all the ledges from preview
        self.platforms2.removeAll(true);
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
    ledge.positions = [];
    ledge.positions.push({
        "x": ledge.x,
        "y": ledge.y
    });
    ledge.positionIndex = 0;
    ledge.scale.setTo(0.5,1);

    // Enable dragging and snapping
    ledge.input.enableDrag();
    // ledge.events.onDragStart.add(onSpriteDragStart, this);

    ledge.events.onDragStop.add(function (data) {

        ledge.positions.push({
            "x": ledge.x,
            "y": ledge.y
        });

        ledge.positionIndex = ledge.positions.length - 1;

        undoManager.add({
            undo: function () {
                ledge.positionIndex -= 1;
                console.log("positions",ledge.positions);
                console.log("position index",ledge.positionIndex);
                if (ledge.positionIndex && ledge.positionIndex < ledge.positions.length)
                {
                    ledge.x = ledge.positions[ledge.positionIndex].x;
                    ledge.y = ledge.positions[ledge.positionIndex].y;
                }

            },
            redo: function () {
                ledge.positionIndex += 1;
                console.log("positions",ledge.positions);
                console.log("position index",ledge.positionIndex);
                if (ledge.positionIndex && ledge.positionIndex < ledge.positions.length)
                {
                    ledge.x = ledge.positions[ledge.positionIndex].x;
                    ledge.y = ledge.positions[ledge.positionIndex].y;
                }
            }
        });
    });

    ledge.resetUndo = function () {
        ledge.positions = ledge.positions.splice(1, ledge.positions.length);
        console.log(ledge.positions);
    };

    ledge.input.enableSnap(32,32,true,true);

    // bind function to destroy the ledge
    ledge.events.onInputDown.add(destroySprite, this);

    return ledge;
}