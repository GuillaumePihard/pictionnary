// Load des modules
const express = require('express');
const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const index = '/index.html';

// Load le serveur
const server = express()
    .use((req, res)=>{
        res.sendFile(index, { root: __dirname})
    })
    .listen(port, ()=> {
        console.log(`Server started on port: ${port}`);
    })

// Set up socketIO, sur base du serveur
const io = socketIO(server);

let users = [];
let currentPlayer = null;
let timeout = null;

io.on('connection', (socket)=> {
    socket.on('username', (username)=> {
        console.log(`${username} joined the game.`);

        socket.username = username;

        users.push(socket);
        sendUsers();

        if(users.length === 1){
            currentPlayer = socket;
            switchPlayer();
        }
    });
    socket.on('disconnect', ()=> {
        users = users.filter((user)=> {
            return user !== socket
        });
        sendUsers();
    });

    socket.on('line', (data) => {
        socket.broadcast.emit('line', data);
    });
});

function sendUsers (){
    const usersData = users.map((user) => {
        return {
            username : user.username,
            isActive : user === currentPlayer
        }
    });
    io.emit('users', usersData);
}

function switchPlayer (){
    timeout = setTimeout(switchPlayer, 15000);

    const indexCurrentPlayer = users.indexOf(currentPlayer);
    currentPlayer = users[(indexCurrentPlayer + 1) % users.length];

    sendUsers();
}