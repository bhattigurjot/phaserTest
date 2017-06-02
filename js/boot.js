/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */

let gameDiv = document.getElementById('gameDiv');
let treeDiv = document.getElementById('treeDiv');

let game = new Phaser.Game(700, 600, Phaser.AUTO, 'gameDiv');
// let game = new Phaser.Game('100%', 600, Phaser.AUTO, 'gameDiv');
// let tree = new Phaser.Game(treeDiv.clientWidth * window.devicePixelRatio, 600, Phaser.AUTO, 'treeDiv');

game.state.add('gameStart', GameState);
game.state.start('gameStart');

Client.sendTest();

// tree.state.add('treeStart', TreeState);
// tree.state.start('treeStart');

function KeyPress(e) {
    let obj = window.event? event : e;
    if (obj.keyCode === 90 && obj.ctrlKey){
        undoManager.undo();
        recordActionManager.add({
            "action": "undo",
        });
        console.log("undo",undoManager.getIndex());
    }
    if (obj.keyCode === 89 && obj.ctrlKey) {
        undoManager.redo();
        recordActionManager.add({
            "action": "redo",
        });
        console.log("redo",undoManager.getIndex());
    }
    if (obj.keyCode === 32 && obj.ctrlKey) {
        recordActionManager.saveFile();
        console.log("save file");
    }
}

document.onkeydown = KeyPress;