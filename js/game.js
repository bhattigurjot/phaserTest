/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */

"use strict";

let undoManager = new UndoManager();
const SNAP_GRID_SIZE = 16;

// let obj = localStorage.getItem('all-items');
// let phaserJSON = null;
Client.requestDataFromJSON();

let GameState = {
    player: null,
    playerVelocity: {x:150, y:320},
    gravity: 300,
    background: null,
    firstAidBox: null,
    platforms: null,
    previewGroup: null,
    spikes: null,
    ground: null,
    cursors: null,
    playButton: null,
    ledgeButton: null,
    spikeButton: null,
    toolbar: null,
    buttonHighlight: null,
    selectedSpriteToDraw: 'ground',
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
        game.load.image('groundPreview', 'assets/images/platform2.png');
        game.load.image('spike', 'assets/images/spikes.png');
        game.load.image('spikePreview', 'assets/images/spikes2.png');
        game.load.image('toolbar', 'assets/images/toolbar.png');
        game.load.image('star', 'assets/images/star.png');
        game.load.image('box', 'assets/images/firstaid.png');
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

        // Draw buttons
        self.drawToolbar();

        // Platforms group
        self.platforms = game.add.group();
        self.platforms.enableBody = true;
        self.platforms.inputEnableChildren = true;

        // Spikes group
        self.spikes = game.add.group();
        self.spikes.enableBody = true;
        self.spikes.inputEnableChildren = true;
        self.spikes.add(Spike(self.spikes, 'spike', 250, 250));

        // Ground
        // self.ground = self.platforms.create(0, game.world.height - 64, 'ground');
        self.ground = game.add.sprite(0, game.world.height - 64, 'ground');
        game.physics.arcade.enable(self.ground);
        self.ground.scale.setTo(2,2);
        self.ground.enableBody = true;
        self.ground.body.immovable = true;

        // For preview
        self.previewGroup = game.add.group();

        // Player
        self.player = new Player(10,10);
        // Health box
        self.firstAidBox = new FirstAidBox(500,500);

        // Ledges and spikes - drawn after reading JSON file and according to correct version
        self.totalVersions = self.phaserJSON.versions.length;
        self.readJSONAndChangeVersion(self.totalVersions);
        // localStorage.clear();

        // Draw Tree View
        drawTree(self.phaserJSON);
    },

    update: function () {
        let self = this;

        if (self.isPlaying) {
            let hitPlatform = game.physics.arcade.collide(self.player, self.platforms);
            let hitGround = game.physics.arcade.collide(self.player, self.ground);
            let hitSpike = game.physics.arcade.collide(self.player, self.spikes);
            game.physics.arcade.overlap(self.player, self.firstAidBox, self.finishGame, null, self);

            // self.player.stop();
            self.player.body.velocity.x = 0;

            if (self.cursors.left.isDown)
            {
                //  Move to the left
                self.player.body.velocity.x = -self.playerVelocity.x;
                self.player.animations.play('left');
            }
            else if (self.cursors.right.isDown)
            {
                //  Move to the right
                self.player.body.velocity.x = self.playerVelocity.x;
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
                self.player.body.velocity.y = -self.playerVelocity.y;
            }
            if (hitSpike) {
                self.enablePlaying();
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
        game.debug.text("Current Version:" + self.currentVersion, 72, 14, "#ffffff");
    },

    render: function () {
        // Displays FPS on screen
        game.debug.text("FPS:" + game.time.fps, 2, 14, "#ffffff");
    },

    drawToolbar: function () {
        let self = this;

        self.toolbar = game.add.group();

        let bg = game.add.sprite(605, 10,'toolbar');
        bg.scale.setTo(0.2,2);

        self.buttonHighlight = game.add.sprite(615, 15,'ground');
        self.buttonHighlight.tint = 0x000000;
        self.buttonHighlight.scale.setTo(0.15,1);
        self.buttonHighlight.alpha = 0.35;

        // Play button
        self.playButton = game.add.sprite(100, 15,'play');
        self.playButton.inputEnabled = true;
        self.playButton.events.onInputUp.add(self.enablePlaying, self);
        // Ledge button
        self.ledgeButton = game.add.sprite(620, 15,'ground');
        self.ledgeButton.width = 50;
        self.ledgeButton.height = 25;
        self.ledgeButton.inputEnabled = true;
        self.ledgeButton.events.onInputUp.add(function (data) {
            self.selectedSpriteToDraw = data.key;

            // set bg image's position
            self.buttonHighlight.position.x = self.ledgeButton.position.x - 5;
            self.buttonHighlight.position.y = self.ledgeButton.position.y;
        }, self);
        // Spike button
        self.spikeButton = game.add.sprite(620, 45,'spike', 0);
        self.spikeButton.width = 50;
        self.spikeButton.height = 25;
        self.spikeButton.inputEnabled = true;
        self.spikeButton.events.onInputUp.add(function (data) {
            self.selectedSpriteToDraw = data.key;

            // set bg image's position
            self.buttonHighlight.position.x = self.spikeButton.position.x - 5;
            self.buttonHighlight.position.y = self.spikeButton.position.y;
        }, self);

        self.toolbar.add(bg);
        self.toolbar.add(self.buttonHighlight);
        self.toolbar.add(self.ledgeButton);
        self.toolbar.add(self.spikeButton);
    },
    
    enablePlaying: function () {
        let self = this;

        // Flip the boolean value for playing condition
        self.isPlaying = !self.isPlaying;

        if (self.isPlaying) {
            switchDragging(false, self.platforms);
            switchDragging(false, self.spikes);
            // Change button texture to pause
            self.playButton.loadTexture('pause');
            // hide toolbar
            self.toolbar.visible = false;
            // enable physics body on all ledges and make them immovable
            self.platforms.enableBody = true;
            self.platforms.forEach(function (item, index) {
                item.body.immovable = true;
            });
            // enable physics body on all spikes and make them immovable
            self.spikes.enableBody = true;
            self.spikes.forEach(function (item, index) {
                item.body.immovable = true;
            });

            // Allows player to move and add gravity to player
            self.player.body.moves = true;
            self.player.body.gravity.y = self.gravity;

            // Disable input on player and firstAidBox
            self.player.inputEnabled = false;
            self.firstAidBox.inputEnabled = false;

            self.firstAidBox.enableBody = true;
            self.firstAidBox.body.moves = true;
        } else {
            // Resets scene
            reset(self.playButton, self.player, self.platforms, self.spikes);
            // un-hide toolbar
            self.toolbar.visible = true;

            // Disable input on player and firstAidBox
            self.player.inputEnabled = true;
            self.firstAidBox.inputEnabled = true;
        }
    },

    addLedge: function (background, pointer) {
        let self = this;

        // Right click to place ledge on screen
        // if (pointer.rightButton.isDown && !self.isPlaying) {
        //     self.platforms.add(Ledge(self.platforms, game.input.activePointer.x, game.input.activePointer.y));
        // }

        if (pointer.rightButton.isDown && !self.isPlaying) {
            let x = game.input.activePointer.x;
            let y = game.input.activePointer.y;
            let spriteToDraw = self.selectedSpriteToDraw;

            if (spriteToDraw === 'ground') {
                self.platforms.add(Ledge(self.platforms, 'ground', x, y));
            } else {
                self.spikes.add(Spike(self.spikes, 'spike', x, y));
            }

            undoManager.add({
                undo: function () {
                    if (spriteToDraw === 'ground') {
                        self.platforms.getChildAt(self.platforms.length - 1).destroy();
                    } else {
                        self.spikes.getChildAt(self.spikes.length - 1).destroy();
                    }
                },
                redo: function () {
                    if (spriteToDraw === 'ground') {
                        self.platforms.add(Ledge(self.platforms, 'ground', x, y));
                    } else {
                        self.spikes.add(Spike(self.spikes, 'spike', x, y));
                    }
                }
            });
        }
    },

    writeJSON: function () {
        let self = this;

        let ledgeArray = [];
        let spikeArray = [];

        self.platforms.forEach(function(item,index) {
            let temp = {};
            temp.x = item.x;
            temp.y = item.y;
            ledgeArray.push(temp);
        });

        self.spikes.forEach(function(item,index) {
            let temp = {};
            temp.x = item.x;
            temp.y = item.y;
            spikeArray.push(temp);
        });

        // To get the player pos object with only x and y values
        let playerPos = JSON.parse(JSON.stringify(self.player.position));
        delete playerPos.type;

        // To get the player pos object with only x and y values
        let firstAidBoxPos = JSON.parse(JSON.stringify(self.firstAidBox.position));
        delete firstAidBoxPos.type;

        // Make sure to save only if the current version is different from the previous version
        self.phaserJSON.versions.forEach(function (item) {
            if (item.id === self.currentVersion && !self.isPlaying && self.isSavingLevel) {

                // CHeck if both versions are equal or not
                if (JSON.stringify(ledgeArray) !== JSON.stringify(item.items.ledges) ||
                    JSON.stringify(spikeArray) !== JSON.stringify(item.items.spikes) ||
                    JSON.stringify(firstAidBoxPos) !== JSON.stringify(item.items.box) ||
                    JSON.stringify(playerPos) !== JSON.stringify(item.items.player)) {
                    // let tV = self.phaserJSON.versions.length;

                    self.phaserJSON.versions[item.id - 1].items.ledges = ledgeArray;
                    self.phaserJSON.versions[item.id - 1].items.spikes = spikeArray;
                    //
                    Client.saveToJSON(self.phaserJSON);

                    drawTree(self.phaserJSON);
                }
            }
            if (item.id === self.currentVersion && !self.isPlaying && self.isSavingVersion) {

                // Check if both versions are equal or not
                if (JSON.stringify(ledgeArray) !== JSON.stringify(item.items.ledges) ||
                    JSON.stringify(spikeArray) !== JSON.stringify(item.items.spikes) ||
                    JSON.stringify(firstAidBoxPos) !== JSON.stringify(item.items.box) ||
                    JSON.stringify(playerPos) !== JSON.stringify(item.items.player)) {
                    let tV = self.phaserJSON.versions.length;

                    self.phaserJSON.versions.push({
                        "id":(tV + 1),
                        "label":"Node " + (tV + 1),
                        "parent":self.currentVersion,
                        "items":{
                            "player":playerPos,
                            "box":firstAidBoxPos,
                            "ledges":ledgeArray,
                            "spikes":spikeArray
                        }
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

        // deletes all the ledges and spikes
        self.platforms.removeAll(true);
        self.spikes.removeAll(true);

        // read json file and draws ledges and spikes on screen
        if (self.phaserJSON === null) {
            self.currentVersion = 1;
            self.platforms.add(Ledge(self.platforms,'ground',100,100));
            self.platforms.add(Ledge(self.platforms,'ground',400,400));
            self.platforms.add(Ledge(self.platforms,'ground',10,250));
        } else {
            self.currentVersion = id;
            self.phaserJSON.versions.forEach(function (item) {
                if (item.id === self.currentVersion) {
                    if ('player' in item.items) {
                        self.player.position.x = item.items.player.x;
                        self.player.position.y = item.items.player.y;
                    }
                    if ('box' in item.items) {
                        self.firstAidBox.position.x = item.items.box.x;
                        self.firstAidBox.position.y = item.items.box.y;
                    }
                    if ('ledges' in item.items) {
                        item.items.ledges.forEach(function (i) {
                            self.platforms.add(Ledge(self.platforms,'ground',i.x,i.y));
                        });
                    }
                    if ('spikes' in item.items) {
                        item.items.spikes.forEach(function (i) {
                            self.spikes.add(Spike(self.spikes,'spike',i.x,i.y));
                        });
                    }
                }

            });
        }
    },

    previewLevel: function (id) {
        let self = this;

        // deletes all the ledges from preview
        self.previewGroup.removeAll(true);

        // read json file and draws ledges on screen
        if (self.phaserJSON === null) {

        } else {
            self.phaserJSON.versions.forEach(function (item) {
                // draw preview ledges if the selected node exists
                // and is not the current version
                // also not playing
                if (item.id === id && self.currentVersion !== id && !self.isPlaying) {

                    if ('player' in item.items) {
                        let tempPlayer = Player(item.items.player.x,item.items.player.y);
                        self.previewGroup.add(tempPlayer);
                        tempPlayer.position.x = item.items.player.x;
                        tempPlayer.position.y = item.items.player.y;
                        tempPlayer.tint = 0x000000;
                    }
                    if ('box' in item.items) {
                        let tempBox = FirstAidBox(item.items.box.x,item.items.box.y);
                        self.previewGroup.add(tempBox);
                        tempBox.position.x = item.items.box.x;
                        tempBox.position.y = item.items.box.y;
                        tempBox.tint = 0x000000;
                    }
                    if ('ledges' in item.items) {
                        item.items.ledges.forEach(function (i) {
                            self.previewGroup.add(Ledge(self.platforms,'groundPreview',i.x,i.y));
                        });
                    }
                    if ('spikes' in item.items) {
                        item.items.spikes.forEach(function (i) {
                            self.previewGroup.add(Spike(self.spikes,'spikePreview',i.x,i.y));
                        });
                    }

                }

            });

            game.world.bringToTop(self.previewGroup);

            self.previewGroup.forEach(function (item, index) {
                // item.tint = 0x000000;
                item.alpha = 0.6;
            });
        }
    },

    previewLevelDisabled: function () {
        let self = this;

        // deletes all the sprites from preview group
        self.previewGroup.removeAll(true);
    },

    finishGame: function () {
        let self = this;

        self.firstAidBox.kill();
        game.paused = true;
    }

};


// This resets the player position and makes ledges movable
function reset(playButton, player, ledges, spikes) {
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

    spikes.forEach(function (item, index) {
        item.immovable = false;
    });

    switchDragging(true,ledges);
    switchDragging(true,spikes);
}

// This toggles the dragging of sprites
function switchDragging(switchDrag, sprites) {
    sprites.forEach(function (item, index) {
        item.inputEnabled = switchDrag;
    });

}

// This deletes the ledge sprite on which middle mouse is clicked
function destroySprite(sprite, pointer) {
    // if (pointer.middleButton.isDown && !self.isPlaying) {
    //     sprite.destroy();
    // }

    if (pointer.middleButton.isDown && !self.isPlaying) {
        let x = sprite.x;
        let y = sprite.y;
        // get group
        let parentGroup = sprite.parent;
        // get ledge index in array for platforms
        let childIndex = parentGroup.getChildIndex(sprite);
        // get key for sprite - it identifies the type of sprite
        let key = sprite.key;

        sprite.destroy();

        undoManager.add({
            undo: function () {
                parentGroup.addChildAt(Ledge(parentGroup, key, x, y), childIndex);
            },
            redo: function () {
                parentGroup.getChildAt(childIndex).destroy();
            }
        });
    }
}

// Player Factory function
function Player(x, y) {
    let player = game.add.sprite(x, y, 'dude');
    player.positions = [];
    player.positions.push({
        "x": player.x,
        "y": player.y
    });
    player.positionIndex = 0;

    // initial pose
    player.frame = 4;

    // Physics and options
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;

    // Player's animations
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    // Enable drag and snap
    player.inputEnabled = true;
    player.input.enableDrag(true);
    player.input.enableSnap(SNAP_GRID_SIZE,SNAP_GRID_SIZE,true,true);

    player.events.onDragStop.add(function (data) {

        // Delete rest of positions if the redo changes after undo
        if (player.positionIndex < player.positions.length - 1) {
            player.positions.splice(player.positionIndex + 1);
        }

        player.positions.push({
            "x": player.x,
            "y": player.y
        });

        player.positionIndex = player.positions.length - 1;

        undoManager.add({
            undo: function () {
                player.positionIndex -= 1;
                if (player.positionIndex >= 0 && player.positionIndex < player.positions.length)
                {
                    player.x = player.positions[player.positionIndex].x;
                    player.y = player.positions[player.positionIndex].y;
                }

            },
            redo: function () {
                player.positionIndex += 1;
                if (player.positionIndex >= 0 && player.positionIndex < player.positions.length)
                {
                    player.x = player.positions[player.positionIndex].x;
                    player.y = player.positions[player.positionIndex].y;
                }
            }
        });
    });

    player.resetUndo = function () {
        player.positions = player.positions.splice(1, player.positions.length);
        console.log(player.positions);
    };

    return player;
}

// FirstAidBox Factory function
function FirstAidBox(x, y) {
    let firstAidBox = game.add.sprite(x, y, 'box');
    firstAidBox.positions = [];
    firstAidBox.positions.push({
        "x": firstAidBox.x,
        "y": firstAidBox.y
    });
    firstAidBox.positionIndex = 0;

    // Physics and options
    game.physics.arcade.enable(firstAidBox);
    firstAidBox.enableBody = true;

    // Enable dragging and snapping
    firstAidBox.inputEnabled = true;
    firstAidBox.input.enableDrag(true);
    firstAidBox.input.enableSnap(SNAP_GRID_SIZE,SNAP_GRID_SIZE,true,true);

    firstAidBox.events.onDragStop.add(function (data) {

        // Delete rest of positions if the redo changes after undo
        if (firstAidBox.positionIndex < firstAidBox.positions.length - 1) {
            firstAidBox.positions.splice(firstAidBox.positionIndex + 1);
        }

        firstAidBox.positions.push({
            "x": firstAidBox.x,
            "y": firstAidBox.y
        });

        firstAidBox.positionIndex = firstAidBox.positions.length - 1;

        undoManager.add({
            undo: function () {
                firstAidBox.positionIndex -= 1;
                if (firstAidBox.positionIndex >= 0 && firstAidBox.positionIndex < firstAidBox.positions.length)
                {
                    firstAidBox.x = firstAidBox.positions[firstAidBox.positionIndex].x;
                    firstAidBox.y = firstAidBox.positions[firstAidBox.positionIndex].y;
                }

            },
            redo: function () {
                firstAidBox.positionIndex += 1;
                if (firstAidBox.positionIndex >= 0 && firstAidBox.positionIndex < firstAidBox.positions.length)
                {
                    firstAidBox.x = firstAidBox.positions[firstAidBox.positionIndex].x;
                    firstAidBox.y = firstAidBox.positions[firstAidBox.positionIndex].y;
                }
            }
        });
    });

    firstAidBox.resetUndo = function () {
        firstAidBox.positions = firstAidBox.positions.splice(1, firstAidBox.positions.length);
    };

    return firstAidBox;
}

// Ledge Factory function
function Ledge(group, type ,x, y) {
    let ledge = group.create(x, y, type);
    ledge.positions = [];
    ledge.positions.push({
        "x": ledge.x,
        "y": ledge.y
    });
    ledge.positionIndex = 0;
    ledge.scale.setTo(0.2,1);

    // Enable dragging and snapping
    ledge.input.enableDrag(true);

    ledge.events.onDragStop.add(function (data) {

        // Delete rest of positions if the redo changes after undo
        if (ledge.positionIndex < ledge.positions.length - 1) {
            ledge.positions.splice(ledge.positionIndex + 1);
        }

        ledge.positions.push({
            "x": ledge.x,
            "y": ledge.y
        });

        ledge.positionIndex = ledge.positions.length - 1;

        undoManager.add({
            undo: function () {
                ledge.positionIndex -= 1;
                if (ledge.positionIndex >= 0 && ledge.positionIndex < ledge.positions.length)
                {
                    ledge.x = ledge.positions[ledge.positionIndex].x;
                    ledge.y = ledge.positions[ledge.positionIndex].y;
                }

            },
            redo: function () {
                ledge.positionIndex += 1;
                if (ledge.positionIndex >= 0 && ledge.positionIndex < ledge.positions.length)
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

    ledge.input.enableSnap(SNAP_GRID_SIZE,SNAP_GRID_SIZE,true,true);

    // bind function to destroy the ledge
    ledge.events.onInputDown.add(destroySprite, this);

    return ledge;
}

// Spike Factory function
function Spike(group, type ,x, y) {
    let spike = group.create(x, y, type);
    spike.positions = [];
    spike.positions.push({
        "x": spike.x,
        "y": spike.y
    });
    spike.positionIndex = 0;
    spike.scale.setTo(0.2,1);

    // Enable dragging and snapping
    spike.input.enableDrag(true);

    spike.events.onDragStop.add(function (data) {

        // Delete rest of positions if the redo changes after undo
        if (spike.positionIndex < spike.positions.length - 1) {
            spike.positions.splice(spike.positionIndex + 1);
        }

        spike.positions.push({
            "x": spike.x,
            "y": spike.y
        });

        spike.positionIndex = spike.positions.length - 1;

        undoManager.add({
            undo: function () {
                spike.positionIndex -= 1;
                if (spike.positionIndex >= 0 && spike.positionIndex < spike.positions.length)
                {
                    spike.x = spike.positions[spike.positionIndex].x;
                    spike.y = spike.positions[spike.positionIndex].y;
                }

            },
            redo: function () {
                spike.positionIndex += 1;
                if (spike.positionIndex >= 0 && spike.positionIndex < spike.positions.length)
                {
                    spike.x = spike.positions[spike.positionIndex].x;
                    spike.y = spike.positions[spike.positionIndex].y;
                }
            }
        });
    });

    spike.resetUndo = function () {
        spike.positions = spike.positions.splice(1, spike.positions.length);
        console.log(spike.positions);
    };

    spike.input.enableSnap(SNAP_GRID_SIZE,SNAP_GRID_SIZE,true,true);

    // bind function to destroy the spike
    spike.events.onInputDown.add(destroySprite, this);

    return spike;
}