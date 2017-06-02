/**
 * Created by Gurjot Bhatti on 6/2/2017.
 */
"use strict";

let RecordActionsManager = function() {
    let recordJSON = {
        "actions": []
    };

    return {
        add: function (action) {
            recordJSON.actions.push(action);
        },

        saveFile: function () {
            Client.saveToJSON(recordJSON, 'actions');
        }
    };
};