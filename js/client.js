/**
 * Created by Gurjot Bhatti on 5/18/2017.
 */
let Client = {};
Client.socket = io.connect();
Client.dataJSON = null;

Client.sendTest = function () {
    console.log("test sent");
    Client.socket.emit('test');
};

Client.requestDataFromJSON = function () {
    console.log("request for json data");
    Client.socket.emit('getJsonData');
};

Client.socket.on('jsonData', function (data) {
    console.log("json data recieved");
    Client.dataJSON = data;
});

Client.saveToJSON = function (data) {
    console.log("request to save json data");
    Client.socket.emit('saveJsonData', data);
};