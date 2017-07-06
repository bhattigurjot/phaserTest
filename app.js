/**
 * Created by Gurjot Bhatti on 5/17/2017.
 */

"use strict";

const express = require('express');
const app = express();
const router = express.Router();
const server = require('http').Server(app);
const port = 3000;
const io = require('socket.io').listen(server);
const fs = require('fs-extra');

let dataJSON = null;
let users = [];

function addUser(id) {
    console.log(id);
    try {
        fs.copySync('versions/template.json', 'versions/'+id+'/save.json');
        console.log('success!')
    } catch (err) {
        console.error(err)
    }

    dataJSON = readJSONFile('save', getID(id));
}

function getID(data) {
    for (let i in users) {
        if (users[i].id === data) {
            return users[i].clientID;
        }
    }
}

function getClientID(data) {
    for (let i in users) {
        if (users[i].clientID === data) {
            return users[i].id;
        }
    }
}

function readJSONFile(file, id) {
    // Read the file and send to the callback

    let cid = getClientID(id);

    let temp = JSON.parse(fs.readFileSync('versions/'+cid+'/'+file+'.json', 'utf8'));
    // console.log(file,temp);
    return temp;

}
function writeJSONFile(data, filename, id) {
    let cid = getClientID(id);

    fs.outputFile('versions/'+cid+'/'+filename+'.json', JSON.stringify(data, null, '\t'), 'utf8', function (err) {
        if (err) throw err;
    });
}

router.use(function (req,res,next) {
    console.log("/" + req.method);
    next();
});

router.get('/', (request, response) => {
    response.sendFile(__dirname+'/index.html');
});

router.get('/all', (request, response) => {
    response.sendFile(__dirname+'/allTrees.html');
});

module.exports = router;

app.use(express.static(__dirname + '/'), router);

app.use("*", (request, response) =>{
    response.send("404 not found");
});

server.listen(port, function () {
    console.log('Listening on ' + server.address().port);
});

io.on('connection', function (socket) {

    socket.on('addUser', function () {
        let thisID = users.length + 1;
        users.push({
            id: thisID,
            clientID: socket.id
        });
        addUser(thisID);
    });

    // socket.on('addUser', function (data) {
    //
    //     if (data === null) {
    //         // if localstorage is not set
    //         let thisID = users.length + 1;
    //         users.push({
    //             id: thisID,
    //             clientID: socket.id
    //         });
    //         addUser(thisID);
    //     } else {
    //         // if localstorage is set
    //         if (users.filter(function(e){return e.clientID === data;}).length > 0) {
    //             // if client id exists in users
    //         } else {
    //             // if client id does not exists in users
    //             let thisID = users.length + 1;
    //             users.push({
    //                 id: thisID,
    //                 clientID: data
    //             });
    //             addUser(thisID);
    //         }
    //     }
    //
    //     console.log(users);
    // });

    socket.on('getJsonData', function (fileName, id) {
        console.log('get', fileName);
        dataJSON = readJSONFile(fileName, id);
        socket.emit('jsonData', dataJSON);
    });
    socket.on('saveJsonData', function (d) {
        console.log('put', d);
        writeJSONFile(d.data, d.filename, d.id);
    });
});