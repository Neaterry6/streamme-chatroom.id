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
        origin: '*', // Restrict in production
        methods: ['GET', 'POST']
    }
});

// Serve static files
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve root route
app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, '/pages/index.html'));
});

// File upload setup
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

// In-memory storage
let chatrooms = [];
let users = [];
let messages = [];

io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    // Send initial data
    socket.emit('chatroomsUpdated', chatrooms);
    socket.emit('usersUpdated', users);

    // User connected
    socket.on('userConnected', (user) => {
        console.log('User connected:', user.username, socket.id);
        if (!users.find(u => u.username === user.username)) {
            users.push({ ...user, socketId: socket.id });
        } else {
            users = users.map(u => u.username === user.username ? { ...u, socketId: socket.id } : u);
        }
        io.emit('usersUpdated', users);
    });

    // User updated
    socket.on('userUpdated', (user) => {
        console.log('User updated:', user.username);
        users = users.map(u => u.username === user.username ? { ...user, socketId: u.socketId } : u);
        io.emit('usersUpdated', users);
    });

    // Create chatroom
    socket.on('createChatroom', ({ name }) => {
        console.log('Creating chatroom:', name);
        const id = 'chatroom-' + Math.random().toString(36).substr(2, 9);
        chatrooms.push({ id, name });
        socket.emit('chatroomCreated', { id, name });
        io.emit('chatroomsUpdated', chatrooms);
    });

    // Join chatroom
    socket.on('joinChatroom', (chatroomId) => {
        console.log('Joining chatroom:', chatroomId);
        const chatroom = chatrooms.find(c => c.id === chatroomId);
        if (chatroom) {
            socket.join(chatroomId);
            socket.emit('joinChatroom', chatroom);
        } else {
            console.error('Chatroom not found:', chatroomId);
            socket.emit('error', { message: 'Chatroom not found' });
        }
    });

    // Send message
    socket.on('sendMessage', (message) => {
        console.log('Message:', message);
        messages.push(message);
        if (message.chatroomId) {
            io.to(message.chatroomId).emit('message', message);
        } else if (messageDmId) {
            const dmId = message.dmId;
            const [user1, user2] = dmId.split(':');
            const user1Data = users.find(u => u.username === user1);
            const user2Data = users.find(u => u.username === user2);
            if (user1Data?.socketId) io.to(user1Data.socketId).emit('message', message);
            if (user2Data?.socketId) io.to(user2Data.socketId).emit('message', message);
        }
    });

    // Get messages
    socket.on('getMessages', ({ chatroomId, dmId }) => {
        console.log('Fetching messages:', { chatroomId, dmId });
        const filteredMessages = messages.filter(m => 
            (chatroomId && m.chatroomId === chatroomId) || 
            (dmId && m.dmId === dmId)
        );
        socket.emit('messages', filteredMessages);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected:', socket.id);
    });
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    console.log('Upload request');
    if (req.file) {
        res.json({ url: `/uploads/${req.file.filename}` });
    } else {
        console.error('Upload failed');
        res.status(400).json({ error: 'Upload failed' });
    }
});

// Export for Vercel
module.exports = app;