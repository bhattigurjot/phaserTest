/**
 * Created by Gurjot Bhatti on 5/18/2017.
 */
"use strict";

let Client = {};
Client.socket = io.connect();
Client.dataJSON = null;

Client.requestDataFromJSON = function (fileName) {
    console.log("request for json data");
    Client.socket.emit('getJsonData', fileName);
};

Client.socket.on('jsonData', function (data) {
    console.log("json data recieved");
    Client.dataJSON = data;
});

Client.saveToJSON = function (d, f) {
    console.log("request to save json data");
    let obj = {data : d, filename: f};
    Client.socket.emit('saveJsonData', obj);
};