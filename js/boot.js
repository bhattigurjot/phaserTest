/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */
let game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');

game.state.add('gameStart', GameState);
game.state.start('gameStart');