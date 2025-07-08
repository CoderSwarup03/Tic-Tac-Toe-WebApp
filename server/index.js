const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const { v4: uuidv4 } = require('uuid')


const app = express();
const server = http.createServer(app);
// create a empty object for store rooms
const rooms = {}

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
})

server.listen(5000, () => {
    console.log("Server is running on port 5000");
})

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('createRoom', (callback) => {
        const roomId = uuidv4().slice(0, 6); // generate a random room id
        rooms[roomId] = [socket.id];
        socket.join(roomId);
        callback(roomId)
    })
    socket.on('joinRoom', (roomId, callback) => {
        if (rooms[roomId] && rooms[roomId].length === 1) {
            rooms[roomId].push(socket.id);
            socket.join(roomId);
            callback({ success: true });
        } else {
            callback({ success: false });
        }
    })

    socket.on('makeMove', ({ player, roomId, index }) => {
        socket.to(roomId).emit("opponentMove", { player, index })
    })
 
    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
            if (rooms[roomId].length === 0) delete rooms[roomId];
        }
    })
    socket.on('rematch',(roomId) => {
        io.to(roomId).emit('rematch');
    })
});
