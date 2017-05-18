/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */

let gameDiv = document.getElementById('gameDiv');
let treeDiv = document.getElementById('treeDiv');

let game = new Phaser.Game('100%', 600, Phaser.AUTO, 'gameDiv');
// let tree = new Phaser.Game(treeDiv.clientWidth * window.devicePixelRatio, 600, Phaser.AUTO, 'treeDiv');

game.state.add('gameStart', GameState);
game.state.start('gameStart');

Client.sendTest();

// tree.state.add('treeStart', TreeState);
// tree.state.start('treeStart');

