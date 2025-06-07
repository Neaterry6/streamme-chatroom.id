const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST']
    }
});

app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve root route
app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, '/pages/index.html'));
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync('uploads')) {
            console.log('Creating uploads directory');
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}_${file.originalname}`;
        console.log(`Uploading file: ${filename}`);
        cb(null, filename);
    }
});
const upload = multer({ storage });

let chatrooms = [];
let users = [];
let messages = [];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.emit('chatroomsUpdated', chatrooms);
    socket.emit('usersUpdated', users);

    socket.on('userConnected', (user) => {
        console.log('User connected event:', user);
        if (!users.find(u => u.username === user.username)) {
            users.push({ ...user, socketId: socket.id });
        } else {
            users = users.map(u => u.username === user.username ? { ...u, socketId: socket.id } : u);
        }
        io.emit('usersUpdated', users);
    });

    socket.on('userUpdated', (user) => {
        console.log('User updated:', user);
        users = users.map(u => u.username === user.username ? { ...user, socketId: u.socketId } : u);
        io.emit('usersUpdated', users);
    });

    socket.on('createChatroom', ({ name }) => {
        console.log('Creating chatroom:', name);
        const id = 'chatroom-' + Date.now();
        chatrooms.push({ id, name });
        socket.emit('chatroomCreated', { id, name });
        io.emit('chatroomsUpdated', chatrooms);
    });

    socket.on('joinChatroom', (chatroomId) => {
        console.log('Joining chatroom:', chatroomId);
        const chatroom = chatrooms.find(c => c.id === chatroomId);
        if (chatroom) {
            socket.join(chatroomId);
            socket.emit('joinChatroom', chatroom);
        } else {
            console.error('Chatroom not found:', chatroomId);
        }
    });

    socket.on('sendMessage', (message) => {
        console.log('Message received:', message);
        messages.push(message);
        if (message.chatroomId) {
            io.to(message.chatroomId).emit('message', message);
        } else if (message.dmId) {
            const [user1, user2] = message.dmId.split('_');
            const user1Socket = users.find(u => u.username === user1)?.socketId;
            const user2Socket = users.find(u => u.username === user2)?.socketId;
            if (user1Socket) io.to(user1Socket).emit('message', message);
            if (user2Socket) io.to(user2Socket).emit('message', message);
        }
    });

    socket.on('getMessages', ({ chatroomId, dmId }) => {
        console.log('Fetching messages for:', { chatroomId, dmId });
        const filteredMessages = messages.filter(m => 
            (chatroomId && m.chatroomId === chatroomId) || 
            (dmId && m.dmId === dmId)
        );
        socket.emit('messages', filteredMessages);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    console.log('Upload request received');
    if (req.file) {
        res.json({ url: `/uploads/${req.file.filename}` });
    } else {
        console.error('File upload failed');
        res.status(400).json({ error: 'File upload failed' });
    }
});

module.exports = app;
