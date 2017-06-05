/**
 * Created by Gurjot Bhatti on 6/2/2017.
 */
"use strict";

let RecordActionsParser = function() {
    let recordJSON = {
        "actions": [
            {
                "action": "move",
                "timestamp": "2017-06-05T18:34:35.622Z",
                "type": "ground",
                "groupIndex": 0,
                "x": 272,
                "y": 80
            },
            {
                "action": "add",
                "timestamp": "2017-06-05T18:34:36.609Z",
                "type": "ground",
                "x": 479,
                "y": 142
            },
            {
                "action": "delete",
                "timestamp": "2017-06-05T18:34:37.945Z",
                "type": "spike",
                "groupIndex": 2
            },
            {
                "action": "undo",
                "timestamp": "2017-06-05T18:34:40.779Z"
            }
        ]
    };
    let STATE = 'Play';

    read = function (STATE) {

        switch (STATE) {
            case 'Time':
                recordJSON.actions.forEach(function (item) {

                });
                break;
            case 'Play':
                recordJSON.actions.forEach(function (item) {
                    if (item.action === 'add') {
                        addFxn(item);
                    }
                    if (item.action === 'delete') {
                        deleteFxn(item);
                    }
                    if (item.action === 'move') {
                        moveFxn(item);
                    }
                    if (item.action = "play") {
                        saveVersionFxn();
                    }
                    if (item.action = "undo") {
                        undoFxn();
                    }
                    if (item.action = "redo") {
                        redoFxn();
                    }
                });
                break;
            default:
                console.log('Sorry, ' + STATE + ' state not found.');
        }

    };
    
    addFxn = function (item) {
        if (item.type === 'ground') {
            GameState.platforms.add(Ledge(GameState.platforms, 'ground', item.x, item.y));
        } else {
            GameState.spikes.add(Spike(GameState.spikes, 'spike', item.x, item.y));
        }
    };
    
    deleteFxn = function (item) {
        if (item.type === 'ground') {
            GameState.platforms.getChildAt(item.groupIndex).destroy();
        } else {
            GameState.spikes.getChildAt(item.groupIndex).destroy();
        }
    };

    moveFxn = function (item) {
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

    undoFxn = function () {
        document.dispatchEvent(new KeyboardEvent('keydown',{'keyCode':'90', 'ctrlKey':true}));
    };

    redoFxn = function () {
        document.dispatchEvent(new KeyboardEvent('keydown',{'keyCode':'89', 'ctrlKey':true}));
    };

    saveFileFxn = function () {
        GameState.writeJSON('saveFile');
    };

    saveVersionFxn = function () {
        GameState.writeJSON('saveVersion');
    };

};