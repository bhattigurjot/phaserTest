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
            recordParser.recordJSON = JSON.parse(e.target.result);
            recordParser.read('Play');
            GameState.FILENAME = 'play';
            Client.requestDataFromJSON('play');
            localStorage.setItem('v-play', JSON.stringify(Client.dataJSON));
            GameState.restartLevel();

            console.log(Client.dataJSON);

            recordParser.read('Every-Change');
            GameState.FILENAME = 'everyChange';
            Client.requestDataFromJSON('everyChange');
            localStorage.setItem('v-every-change', JSON.stringify(Client.dataJSON));
            GameState.restartLevel();

            console.log(Client.dataJSON);

            alert("yo");

            window.location = '/allTrees.html';

            // window.open(
            //     "/allTrees.html",
            //     "DescriptiveWindowName",
            //     "resizable,scrollbars,status"
            // );
        };
    })(f);

    // Read in the image file as a data URL.
    reader.readAsText(f);


};