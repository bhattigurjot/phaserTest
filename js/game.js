/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */

let obj = localStorage.getItem('all-items');
let phaserJSON = null;

let GameState = {
    player: null,
    background: null,
    platforms: null,
    ground: null,
    cursors: null,
    playButton: null,
    isPlaying: false,
    sKey: null,

    preload: function () {
        game.load.image('play', 'assets/images/play.png');
        game.load.image('pause', 'assets/images/pause.png');
        game.load.image('sky', 'assets/images/sky.png');
        game.load.image('ground', 'assets/images/platform.png');
        game.load.image('star', 'assets/images/star.png');
        game.load.json('versions', 'assets/save.json');
        game.load.spritesheet('dude', 'assets/images/dude.png', 32, 48);
    },

    create: function() {
        let self = this;

        // Enable advanced timing to display FPS
        game.time.advancedTiming = true;

        // Read into json object
        phaserJSON = game.cache.getJSON('versions');

        // Input
        self.cursors = game.input.keyboard.createCursorKeys();
        game.input.mouse.capture = true;

        sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
        sKey.onDown.add(self.writeJSON, self);

        // Disable right click context meny
        game.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };

        // document.onkeydown = function (e) {
        //     e = e || window.event;//Get event
        //     if (e.ctrlKey) {
        //         var c = e.which || e.keyCode;//Get key code
        //         switch (c) {
        //             case 83://Block Ctrl+S
        //             case 87://Block Ctrl+W --Not work in Chrome
        //                 e.preventDefault();
        //                 e.stopPropagation();
        //                 break;
        //         }
        //     }
        // };

        // Physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Background
        self.background = game.add.sprite(0,0,'sky');
        self.background.inputEnabled = true;
        self.background.events.onInputDown.add(self.addLedge, self);

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
        // self.ground = self.platforms.create(0, game.world.height - 64, 'ground');
        self.ground = game.add.sprite(0, game.world.height - 64, 'ground');
        game.physics.arcade.enable(self.ground);
        self.ground.scale.setTo(2,2);
        self.ground.enableBody = true;
        self.ground.body.immovable = true;

        // Ledges - drawn from local storage
        // localStorage.clear();
        this.readJSON();

        // Player
        self.player = new Player(10,10);


        // Draw Tree View
        drawTree();
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
    },

    render: function () {
        game.debug.text("FPS:" + game.time.fps, 2, 14, "#000000");
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

        self.writeJSON();
    },

    addLedge: function (background, pointer) {
        let self = this;
        if (pointer.rightButton.isDown && !self.isPlaying) {
        // if (game.input.activePointer.rightButton.isDown) {
            self.platforms.add(Ledge(self.platforms, game.input.activePointer.x, game.input.activePointer.y));
        }
    },

    writeJSON: function () {
        let self = this;

        let data, text, iter;

        data = '{"items":[';
        self.platforms.forEach(function(item,index) {
            // iter = index;
            text = '{"x":'+ item.x + ', "y":'+ item.y + '}';
            data += text + ", ";
            // console.log(self.platforms.length);
        });

        data = data.substring(0, data.length - 2);

        data += ']}';

        console.log(data);

        localStorage.setItem('all-items', data);
    },

    readJSON: function () {
        let self = this;

        // if (obj === null) {
        //     self.platforms.add(Ledge(self.platforms,100,100));
        //     self.platforms.add(Ledge(self.platforms,400,400));
        //     self.platforms.add(Ledge(self.platforms,10,250));
        //     // localStorage.clear();
        // } else {
        //     let data = JSON.parse(obj);
        //
        //     // console.log(obj);
        //     // console.log(data.items);
        //
        //     for (let i in data.items) {
        //         self.platforms.add(Ledge(self.platforms,data.items[i].x,data.items[i].y));
        //     }
        // }

        if (phaserJSON === null) {
            self.platforms.add(Ledge(self.platforms,100,100));
            self.platforms.add(Ledge(self.platforms,400,400));
            self.platforms.add(Ledge(self.platforms,10,250));
        } else {
            currentWorkingNode = 1;

            phaserJSON.versions.forEach(function (item) {
                if (item.id === currentWorkingNode) {
                    // console.log(item.items);
                    item.items.forEach(function (i) {
                        self.platforms.add(Ledge(self.platforms,i.x,i.y));
                    });
                }

            });
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
    ledge.scale.setTo(0.5,1);
    ledge.input.enableDrag();
    ledge.input.enableSnap(32,32,true,true);

    return ledge;
}