/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */

let gameDiv = document.getElementById('gameDiv');

let game = new Phaser.Game(700, 600, Phaser.AUTO, 'gameDiv');

game.state.add('gameStart', GameState);
game.state.start('gameStart');

function KeyPress(e) {
    let obj = window.event? event : e;
    if (obj.keyCode === 90 && obj.ctrlKey){
        obj.preventDefault();
        undoManager.undo();
        recordActionManager.add({
            "action": "undo",
            "timestamp": (new Date).toISOString(),
        });
        console.log("undo",undoManager.getIndex());
    }
    if (obj.keyCode === 89 && obj.ctrlKey) {
        obj.preventDefault();
        undoManager.redo();
        recordActionManager.add({
            "action": "redo",
            "timestamp": (new Date).toISOString(),
        });
        console.log("redo",undoManager.getIndex());
    }
    if (obj.keyCode === 82 && obj.ctrlKey) {
        obj.preventDefault();
        console.log("Refresh not alowed");
    }
    if (obj.keyCode === 32 && obj.ctrlKey) {
        obj.preventDefault();
        recordActionManager.saveFile();
        console.log("save actions file");
    }
    if (obj.keyCode === 83 && obj.ctrlKey && obj.shiftKey) {
        obj.preventDefault();
        GameState.writeJSON('saveVersion');
        console.log("save version");
    } else if (obj.keyCode === 83 && obj.ctrlKey) {
        obj.preventDefault();
        GameState.writeJSON('saveFile');
        console.log("save file");
    }
}

document.onkeydown = KeyPress;