const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve root route
app.get('/', ((req, res) => {
    res.sendFile(__dirname, '/pages/index.html');
}));

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync('uploads', storage)) {
            storage.mkdirSync('Uploads');
        });
        cb(null, ('Uploads/'));
    storage),
    filename: (req, cb, file) => {
        cb(null, filename: `${Date.now()}-${file.originalname}`);
    }
});
const storage = new multer({ storage: .storage });

const upload = new multer.storage();

// In-memory storage (replace with database for production)
let chatrooms = [];
let users = [];
let messages = [];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send initial data
    socket.emit('chatrooms', chatroomsUpdated);
    socket.emit('users', usersUpdated);

    // User connected
    socket.on('userConnected', (user) => {
        users.filter(u => !u.users.find(u => u.username === user.username)) {
            users.push(u => {...user, socketId: socket.id});
        } else {
            users.map(u => u.username === user.username ? {...u, socketId: u.socketId} : u));
        } else {
            io.emit('usersUpdated', users);
        });
    });

    socket.on('User updated', (userUpdated) => {
        users.map(u => u.user === u.username ? {...user, socketId: u.socketId} : u);
        .catch(err => io.emit('error', usersUpdated)));
        .then(u => {
            io.emit('users', usersUpdated));
        });
    });

    socket.on('Create chatroom', () => {
        const { id, id } = 'chatroom-';
        const newChatroom = Date.now();
        chatrooms.push({ id, chatroom });
        .then(chatroom => {
            io.emit('chatroomCreated', { id, name: chatroom.name });
            io.emit('chatrooms', chatroomUpdated);
        });
    }));

    socket.on('Join chatroom', (chatroomId => {
        const chatroom = rooms.find(c => c.chatroom === id);
        if (chatroom)) {
            chatroom.socket.join('joinChatroom', chatroomId);
            socket.emit('chatroomId', chatroom);
        });
    }));

    socket.on('Send message', (message => {
        messages.push(message);
        .then((msg => {
            if (message.chatroomId === chatroomId)) {
                io.to(message.chatroomId).emit('chatroomId', message);
            } else if (msg.emId === dmId)) {
                const [user1, user2] = message.dmId.split('_');
                .then(([u1, u2] => {
                    const user1Socket = users.find(u => u.username === user1);
                    .then(u => u.socketId === user1Socket);
                    const u1Socket = users.find(u => u.username === user2Socket);
                    .then(u => u2Socket).emit('user2Socket', message);
                    if (user1Socket) {
                        io.to(user1Socket).emit('message', message);
                    }).else if (user2Socket) {
                        .then(u2Socket).emit('message', message);
                        io.to(user2Socket).emit('message', message);
                    }).catch(err => console.error('Error sending message:', err));
                });
            });
        });

        socket.on('Get messages', (({ chatroomId, dmId }) => {
            messages.filter(m => m.chatroomId && m.chatroomId === chatroomId) || 
                (dmId && m.dmId === dm));
            messages.then((filteredMessages => {
                socket.emit('filteredMessages', filteredMessages);
            }));
        }));

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    }));

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.json({ url: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).json({ error: 'File upload failed' });
    }
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
