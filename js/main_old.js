/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */
let game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');

let boxX, boxy, boxHeight, boxLength;

// let box = {
//     this.
// };

let GameState = {
    preload: function () {
        // this.load.image('cursor', 'assets/images/cursor.png');
        game.load.image('sky', 'assets/images/sky.png');
        game.load.image('ground', 'assets/images/platform.png');
        game.load.image('star', 'assets/images/star.png');
        game.load.spritesheet('dude', 'assets/images/dude.png', 32, 48);
    },

    create: function() {
        // game.stage.backgroundColor = '#59bcf9';
        // //game.canvas.addEventListener('mousedown', this.requestLock);
        //
        // this.cursor = game.add.sprite(game.world.centerX, game.world.centerY,'cursor');
        // this.cursor.scale.setTo(0.055,0.055);
        // // this.cursor.tint = 0x000000;
        //
        // //game.input.addMoveCallback(this.move, this);
        //
        // this.box = new Phaser.Graphics(this);
        // this.box.beginFill(0xffffff);
        // this.box.drawRectangle(this,0,0,0,200,640,);
        // this.box.endFill();
    },

    update: function () {
        // // this.cursor.add
        // if (game.input.activePointer.withinGame) {
        //     game.input.addMoveCallback(this.move, this);
        // }
    },

    // move: function (pointer, x, y, click) {
    //     //if (game.input.mouse.locked && !click) {
    //     //     this.cursor.x += game.input.mouse.event.movementX;
    //     //     this.cursor.y += game.input.mouse.event.movementY;
    //     //}
    //     this.cursor.x = pointer.x;
    //     this.cursor.y = pointer.y;
    // },
    //
    // requestLock: function() {
    //     game.input.mouse.requestPointerLock();
    // }

};

game.state.add('gameStart', GameState);
game.state.start('gameStart');