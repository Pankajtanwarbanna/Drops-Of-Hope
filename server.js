var express  = require('express');
var app = express();
var morgan = require('morgan');             // middleware to log http requests
var port = process.env.PORT || 8000;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = express.Router();
var apiRoutes = require('./app/routes/api')(router);

// server listening on port 8000
let server = app.listen(port, function () {
    console.log('Server running on port 8000');
});

const io = require('socket.io').listen(server);

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));
// diff. front end and backend routes
app.use('/api', apiRoutes);
global.__basedir = __dirname;

let Consultation = require(__dirname +'/app/models/consultation');

// connecting to mongo database
mongoose.connect('mongodb://localhost:27017/drops-of-hope', { useNewUrlParser: true, useUnifiedTopology: true  }, function (err, Database) {
    if(err) {
        console.log(err);
    } else {
        console.log('Successfully connected to database.');
    }
});

// Socket.io Communication
io.sockets.on('connection', function (socket) {
    socket.on('disconnect', function() {
        console.log("disconnected")
    });

    socket.on('connect', function() {
        console.log("connected")
    });

    socket.on('room', function(data) {
        console.log(data);
        socket.join(data.chatID);
        console.log(' Client joined the room and client id is ' + data.chatID);
    });

    // 'join event'
    socket.on('join', (data) => {
        socket.join(data.room);
    });
    // catching the message event
    socket.on('send message', (data) => {
        console.log(data);
        // emitting the 'new message' event to the clients in that room
        io.sockets.in(data.data.chatID).emit('new message', { data : data.data });

        // save the message in the 'messages' array of that chat-room
        Consultation.findOne({ _id : data.data.chatID }, function (err, consult) {
            if(err) {
                console.log(err);
            } else {
                console.log(consult);
                consult.chat.push(data.data);

                consult.save(function (err) {
                    if(err) {
                        console.log(err)
                    } else {
                        console.log('Chat is working.')
                    }
                })
            }
        });
    });
    // Event when a client is typing
    socket.on('typing', (data) => {
        // Broadcasting to all the users except the one typing
        socket.broadcast.in(data.room).emit('typing', {data: data, isTyping: true});
    });
});

// index page
app.get('*', function (req,res) {
    res.sendFile(__dirname + '/public/app/views/index.html');
});

