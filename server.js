const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (HTML, uploads)
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve root route
app.get('/', (req, res) => {
    res.redirect('/pages/chatroom.html'); // Redirect to chatroom if no index.html
});

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// In-memory storage (replace with database for production)
let chatrooms = [];
let users = [];
let messages = [];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send initial data
    socket.emit('chatroomsUpdated', chatrooms);
    socket.emit('usersUpdated', users);

    // User connected
    socket.on('userConnected', (user) => {
        if (!users.find(u => u.username === user.username)) {
            users.push({ ...user, socketId: socket.id });
        } else {
            users = users.map(u => u.username === user.username ? { ...u, socketId: socket.id } : u);
        }
        io.emit('usersUpdated', users);
    });

    // User updated
    socket.on('userUpdated', (user) => {
        users = users.map(u => u.username === user.username ? { ...user, socketId: u.socketId } : u);
        io.emit('usersUpdated', users);
    });

    // Create chatroom
    socket.on('createChatroom', ({ name }) => {
        const id = 'chatroom-' + Date.now();
        chatrooms.push({ id, name });
        io.emit('chatroomCreated', { id, name });
        io.emit('chatroomsUpdated', chatrooms);
    });

    // Join chatroom
    socket.on('joinChatroom', (chatroomId) => {
        const chatroom = chatrooms.find(c => c.id === roomId);
        if (chatroom) {
            socket.join(chatroomId);
            socket.emit('joinChatroom', chatroom);
        }
    });

    // Send message
    socket.on('sendMessage', (message) => {
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

    // Get messages
    socket.on('getMessages', ({ chatroomId, dmId }) => {
        const filteredMessages = messages.filter(m => 
            (chatroomId && m.chatroomId === chatroomId) || 
            (dmId && m.dmId === dmId)
        );
        socket.emit('messages', messages);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

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
})
