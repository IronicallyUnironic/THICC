const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Store rooms, users, and messages
let rooms = [];  // List of active chat rooms
let users = {};  // Users mapping { username: { socket, room } }
let messages = {};  // { roomName: [messages] }

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Socket.io logic
io.on('connection', (socket) => {
  let currentUser = '';
  let currentRoom = '';

  console.log('A user connected: ', socket.id);

  // Listen for user joining a room
  socket.on('join room', (username, roomName) => {
    currentUser = username;
    currentRoom = roomName;

    // If room doesn't exist, create it
    if (!rooms.includes(roomName)) {
      rooms.push(roomName);
      messages[roomName] = []; // Create an empty message array for the new room
    }

    // Add the user to the room and the global users object
    users[username] = { socket, room: roomName };
    socket.join(roomName);

    // Emit room and user info to the connected user
    socket.emit('room info', { rooms, users: getUsersInRoom(roomName), messages: messages[roomName] });

    // Notify the room about the new user
    socket.to(roomName).emit('message', `${username} has joined the room`);
    console.log(`${username} joined room: ${roomName}`);
  });

  // Listen for chat messages
  socket.on('chat message', (msg) => {
    if (currentRoom) {
      const messageData = {
        username: currentUser,
        room: currentRoom,
        message: msg,
        timestamp: new Date().toISOString(),
      };
      messages[currentRoom].push(messageData);
      io.to(currentRoom).emit('message', messageData); // Broadcast to the room
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (currentUser) {
      console.log(`${currentUser} disconnected`);
      if (currentRoom) {
        socket.to(currentRoom).emit('message', `${currentUser} has left the room`);
      }
      delete users[currentUser];
    }
  });
});

// Utility function to get a list of users in a room
function getUsersInRoom(room) {
  return Object.keys(users)
    .filter((username) => users[username].room === room)
    .map((username) => username);
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
