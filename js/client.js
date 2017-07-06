/**
 * Created by Gurjot Bhatti on 5/18/2017.
 */
"use strict";

let Client = {};
Client.socket = io.connect();
Client.dataJSON = null;

Client.socket.on('connect', function () {
    Client.socket.emit('addUser');
    Client.requestDataFromJSON('save', Client.socket.id);
    localStorage.setItem('clientId', Client.socket.id);
});

Client.socket.on('reconnect', function () {
    let clientID = localStorage.getItem('clientId');

    if (clientID) {
        Client.socket.id = clientID;
    }

    // localStorage.setItem('clientId', Client.socket.id);
});

Client.requestDataFromJSON = function (fileName, id) {
    console.log("request for json data", fileName);
    Client.socket.emit('getJsonData', fileName, id);
    Client.socket.on('jsonData', function (data) {
        console.log("json data recieved");
        Client.dataJSON = data;
    });
};

Client.saveToJSON = function (d, f) {
    console.log("request to save json data", f);
    Client.socket.emit('saveJsonData', {data : d, filename: f, id: Client.socket.id});
};