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
            GameState.platforms.getChildAt(item.groupIndex - 1).x = item.x;
            GameState.platforms.getChildAt(item.groupIndex - 1).y = item.y;
        } else if (item.type === 'spike') {
            GameState.spikes.getChildAt(item.groupIndex - 1).x = item.x;
            GameState.spikes.getChildAt(item.groupIndex - 1).y = item.y;
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

    this.read = function (STATE) {

        switch (STATE) {
            case 'Time':
                this.recordJSON.actions.forEach(function (item) {

                });
                break;
            case 'Play':
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
                });
                break;
            case 'Every-Change':
                this.recordJSON.actions.forEach(function (item) {
                    if (item.action === 'add') {
                        console.log("add start");
                        self.addFxn(item);
                        console.log("add mid");
                        self.saveVersionFxn();
                        console.log("add pass");
                    }
                    if (item.action === 'delete') {
                        console.log("del start");
                        self.deleteFxn(item);
                        console.log("del mid");
                        self.saveVersionFxn();
                        console.log("del pass");
                    }
                    if (item.action === 'move') {
                        console.log("move start");
                        self.moveFxn(item);
                        console.log("move mid");
                        self.saveVersionFxn();
                        console.log("move pass");
                    }
                    if (item.action === "undo") {
                        self.undoFxn();
                    }
                    if (item.action === "redo") {
                        self.redoFxn();
                    }
                });
                break;
            case 'Explicit':
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
                    if (item.action === "saveVersion") {
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
            // Render thumbnail.
            console.log('game', GameState.spikes);
            localStorage.clear();
            // GameState.restartLevel();
            // console.log('fn', GameState.FILENAME);

            recordParser.recordJSON = JSON.parse(e.target.result);

            console.log(recordParser.recordJSON);

            console.log(2);

            GameState.FILENAME = 'everyChange';
            recordParser.read('Every-Change');
            // Client.requestDataFromJSON(GameState.FILENAME);
            // console.log('everyChange', Client.dataJSON);
            // console.log('fn', GameState.FILENAME);
            localStorage.setItem('v-every-change', JSON.stringify(GameState.phaserJSON));
            console.log('v-every-change', JSON.parse(localStorage.getItem('v-every-change')));
            GameState.restartLevel();

            console.log(2);


            console.log(1);

            GameState.FILENAME = 'play';
            recordParser.read('Play');
            // Client.requestDataFromJSON(GameState.FILENAME);
            // console.log('play', Client.dataJSON);
            // console.log('fn', GameState.FILENAME);
            localStorage.setItem('v-play', JSON.stringify(GameState.phaserJSON));
            console.log('v-play', JSON.parse(localStorage.getItem('v-play')));
            GameState.restartLevel();

            console.log(1);



            console.log(3);

            GameState.FILENAME = 'explicit';
            recordParser.read('Explicit');
            // Client.requestDataFromJSON(GameState.FILENAME);
            // console.log('explicit', Client.dataJSON);
            localStorage.setItem('v-explicit', JSON.stringify(GameState.phaserJSON));
            console.log('v-explicit', JSON.parse(localStorage.getItem('v-explicit')));
            GameState.restartLevel();

            // console.log(Client.dataJSON);

            console.log(3);
        };
    })(f);

    // Read in the image file as a data URL.
    reader.readAsText(f);

    setTimeout(function () {
        window.location = '/all';
    }, 2000);

};