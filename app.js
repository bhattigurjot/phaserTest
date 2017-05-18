/**
 * Created by Gurjot Bhatti on 5/17/2017.
 */
const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = 3000;
const io = require('socket.io').listen(server);
const fs = require('fs');

let dataJSON = null;

readJSONFile();
// writeJSONFile();

function readJSONFile() {
    // Read the file and send to the callback
    fs.readFile('versions/save.json', function (err, data) {
        if (err) throw err;
        dataJSON = JSON.parse(data);
    });
}
function writeJSONFile(data) {
    fs.writeFile('versions/save.json', JSON.stringify(data), 'utf8', function (err) {
        if (err) throw err;
    });
}

app.use(express.static(__dirname + '/'));

app.get('/', (request, response) => {
    response.send(__dirname+'/index.html');
});

server.listen(port, function () {
    console.log('Listening on ' + server.address().port);
});

io.on('connection', function (socket) {
    socket.on('test', function () {
        console.log('test successful');
    });
    socket.on('getJsonData', function () {
        io.emit('jsonData', dataJSON);
    });
    socket.on('saveJsonData', function (data) {
        writeJSONFile(data);
    });
});