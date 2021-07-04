const express = require('express');
const socketio = require('socket.io');
const http = require('http')
const path = require('path');
const { generateMessageData } = require('./utils')
const { addUser, getUser, getUsersInRoom, removeUser, getAllUsers } = require('./users');

const port = process.env.PORT

const app = express()
const server  = http.createServer(app)
const io = socketio(server)

const publicDirPath = path.join(__dirname, '../public')
app.use(express.static(publicDirPath))

//do something when client connect to server
io.on('connection' /*built-in event*/, (socket)=> {

    //console.log('New websocket connection', "id:", socket.id);

    //do something when client join a room
    socket.on('join', ({username, room}, callback)=> {

        //store client/user
        const { user, error } = addUser({
            userid: socket.id,
            username,
            room
        })

        if(error) {
            return callback(generateMessageData(error))
        }

        console.log(getAllUsers())

        //set client to particular room
        socket.join(user.room)

        //send data to client who connects
        socket.emit('message', generateMessageData('Welcome!', 'Admin'))

        //emit to all except the one who joined using broadcast
        socket.broadcast.to(user.room).emit('message', generateMessageData(`${user.username} has joined the room`, 'Admin'))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    //listener on 'sendMessage' event (client send event)
    socket.on('sendMessage', (message, callback)=> {
        const user = getUser(socket.id)

        if(user) {
            //get data from the client who sent it and send to all client
            io.to(user.room).emit('message', generateMessageData(message, user.username))

            //server acknowledgment callback with response data to send to the client
            callback(generateMessageData('Message has been emitted to all client', 'Admin')) 
        }
        //send server acknowledgment to client who sent the message using callback
        //callback()
    })

    socket.on('sendLocation', (position, callback)=> {
        const user = getUser(socket.id)

        if(user) {
            io.to(user.room).emit('locationMessage', generateMessageData({
                message: `My Location: ${position.latitude}, ${position.longitude}`,
                url: `https://maps.google.com?q=${position.latitude},${position.longitude}`
            }, user.username))
            callback(generateMessageData('Geolocation has been emitted to all client', 'Admin'))
        }
    })

    //listener when client disconnect
    socket.on('disconnect' /*built-in event*/, ()=> {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessageData(`${user.username} has left`, 'Admin'))

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, ()=> {
    console.log('Chat App start at port ' + port)
})

