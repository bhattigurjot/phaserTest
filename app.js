/**
 * Created by Gurjot Bhatti on 5/17/2017.
 */
const express = require('express');
const app = express();
const port = 3000;

const fs = require('fs');

app.get('/', (request, response) => {
    response.render('index',fs);
});

console.log("Starting server in: " + __dirname + '/');
app.use(express.static(__dirname + '/'));

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
});