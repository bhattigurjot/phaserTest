/**
 * Created by Gurjot Bhatti on 6/2/2017.
 */
"use strict";

function RecordActionsParser() {
    let self = this;

    this.recordJSON = {};
    // this.STATE = 'Play';

    this.addFxn = function (item) {
        if (item.type === 'ground') {
            GameState.platforms.add(Ledge(GameState.platforms, 'ground', item.x, item.y));
        } else {
            GameState.spikes.add(Spike(GameState.spikes, 'spike', item.x, item.y));
        }
    };

    this.deleteFxn = function (item) {
        if (item.type === 'ground') {
            GameState.platforms.getChildAt(item.groupIndex).destroy();
        } else {
            GameState.spikes.getChildAt(item.groupIndex).destroy();
        }
    };

    this.moveFxn = function (item) {
        if (item.type === 'player') {
            GameState.player.x = item.x;
            GameState.player.y = item.y;
        } else if (item.type === 'firstAidBox') {
            GameState.firstAidBox.x = item.x;
            GameState.firstAidBox.y = item.y;
        } else if (item.type === 'ground') {
            GameState.platforms.getChildAt(item.groupIndex).x = item.x;
            GameState.platforms.getChildAt(item.groupIndex).y = item.y;
        } else if (item.type === 'spike') {
            GameState.spikes.getChildAt(item.groupIndex).x = item.x;
            GameState.spikes.getChildAt(item.groupIndex).y = item.y;
        }
    };

    this.undoFxn = function () {
        document.dispatchEvent(new KeyboardEvent('keydown',{'keyCode':'90', 'ctrlKey':true}));
    };

    this.redoFxn = function () {
        document.dispatchEvent(new KeyboardEvent('keydown',{'keyCode':'89', 'ctrlKey':true}));
    };

    this.saveFileFxn = function () {
        GameState.writeJSON('saveFile');
    };

    this.saveVersionFxn = function () {
        GameState.writeJSON('saveVersion');
    };

    this.changeVersionFxn = function (data) {

        let str = JSON.stringify(data.items);
        str = str.replace(/\\/g, '').slice(1, -1);

        GameState.phaserJSON.versions.forEach(function (item, index){
            if (JSON.stringify(item.items) === str) {
                undoManager.clear();
                GameState.readJSONAndChangeVersion(index+1);
            }
        });

    };

    this.read = function (STATE) {

        switch (STATE) {
            case 'Time':
                console.log("Time");

                let prev = null;
                let curr = null;
                this.recordJSON.actions.forEach(function (item, index) {
                    if (item.action === 'add') {
                        self.addFxn(item);
                    }
                    if (item.action === 'delete') {
                        self.deleteFxn(item);
                    }
                    if (item.action === 'move') {
                        self.moveFxn(item);
                    }
                    if (item.action === "undo") {
                        self.undoFxn();
                    }
                    if (item.action === "redo") {
                        self.redoFxn();
                    }
                    if (item.action === "change-version") {
                        self.changeVersionFxn(item);
                    }

                    if (index === 0) {
                        prev = new Date(item.timestamp);
                    }
                    curr = new Date(item.timestamp);
                    // for every 1 second
                    if ((curr.getTime() - prev.getTime())/1000 >= 1) {
                        self.saveVersionFxn();
                    }
                    prev = new Date(item.timestamp);
                });
                break;
            case 'Play':
                console.log("Play");
                this.recordJSON.actions.forEach(function (item) {
                    if (item.action === 'add') {
                        self.addFxn(item);
                    }
                    if (item.action === 'delete') {
                        self.deleteFxn(item);
                    }
                    if (item.action === 'move') {
                        self.moveFxn(item);
                    }
                    if (item.action === "play") {
                        self.saveVersionFxn();
                    }
                    if (item.action === "undo") {
                        self.undoFxn();
                    }
                    if (item.action === "redo") {
                        self.redoFxn();
                    }
                    if (item.action === "change-version") {
                        self.changeVersionFxn(item);
                    }
                });
                break;
            case 'Every-Change':
                console.log("Every-Change");
                this.recordJSON.actions.forEach(function (item) {
                    if (item.action === 'add') {
                        self.addFxn(item);
                        self.saveVersionFxn();
                    }
                    if (item.action === 'delete') {
                        self.deleteFxn(item);
                        self.saveVersionFxn();
                    }
                    if (item.action === 'move') {
                        self.moveFxn(item);
                        self.saveVersionFxn();
                    }
                    if (item.action === "undo") {
                        self.undoFxn();
                    }
                    if (item.action === "redo") {
                        self.redoFxn();
                    }
                    if (item.action === "change-version") {
                        self.changeVersionFxn(item);
                    }
                });
                break;
            case 'Explicit':
                console.log("Explicit");
                this.recordJSON.actions.forEach(function (item) {
                    if (item.action === 'add') {
                        self.addFxn(item);
                    }
                    if (item.action === 'delete') {
                        self.deleteFxn(item);
                    }
                    if (item.action === 'move') {
                        self.moveFxn(item);
                    }
                    if (item.action === "undo") {
                        self.undoFxn();
                    }
                    if (item.action === "redo") {
                        self.redoFxn();
                    }
                    // if (item.action === "saveFile") {
                    //     self.saveFileFxn();
                    // }
                    if (item.action === "saveVersion") {
                        self.saveVersionFxn();
                    }
                    if (item.action === "change-version") {
                        self.changeVersionFxn(item);
                    }
                });
                break;
            case '3-Changes':
                console.log("3 changes");
                let count = 0;
                this.recordJSON.actions.forEach(function (item) {
                    if (item.action === 'add') {
                        self.addFxn(item);
                        count += 1;
                    }
                    if (item.action === 'delete') {
                        self.deleteFxn(item);
                        count += 1;
                    }
                    if (item.action === 'move') {
                        self.moveFxn(item);
                        count += 1;
                    }
                    if (item.action === "undo") {
                        self.undoFxn();
                        count += 1;
                    }
                    if (item.action === "redo") {
                        self.redoFxn();
                        count += 1;
                    }
                    if (item.action === "change-version") {
                        self.changeVersionFxn(item);
                    }
                    if (count === 3) {
                        count = 0;
                        self.saveVersionFxn();
                    }

                });
                break;
            default:
                console.log('Sorry, ' + STATE + ' state not found.');
        }

    };

};

document.getElementById('files').addEventListener('change', handleFileSelect, false);

function handleFileSelect(evt) {
    let recordParser = new RecordActionsParser();
    let files = evt.target.files; // FileList object
    let f = files[0];
    let reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            recordParser.recordJSON = JSON.parse(e.target.result);

            GameState.FILENAME = 'saved/everyChange';
            recordParser.read('Every-Change');
            localStorage.setItem('v-every-change', JSON.stringify(GameState.phaserJSON));
            GameState.restartLevel();

            GameState.FILENAME = 'saved/play';
            recordParser.read('Play');
            localStorage.setItem('v-play', JSON.stringify(GameState.phaserJSON));
            GameState.restartLevel();

            GameState.FILENAME = 'saved/explicit';
            recordParser.read('Explicit');
            localStorage.setItem('v-explicit', JSON.stringify(GameState.phaserJSON));
            GameState.restartLevel();

            GameState.FILENAME = 'saved/3changes';
            recordParser.read('3-Changes');
            localStorage.setItem('v-3-changes', JSON.stringify(GameState.phaserJSON));
            GameState.restartLevel();

            GameState.FILENAME = 'saved/time';
            recordParser.read('Time');
            localStorage.setItem('v-time', JSON.stringify(GameState.phaserJSON));
            GameState.restartLevel();

        };
    })(f);

    // Read in the image file as a data URL.
    reader.readAsText(f);

    setTimeout(function () {
        window.location = '/all';
    }, 2000);

};