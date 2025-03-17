const socket = io();

// Admin Authentication (Simple password check)
const password = 'admin123';  // Set your admin password here
let isAuthenticated = false;

const roomList = document.getElementById('room-list');
const userList = document.getElementById('user-list');
const logoutButton = document.getElementById('logout');
const deleteRoomButton = document.getElementById('delete-room');
const kickUserButton = document.getElementById('kick-user');
const deleteMessagesButton = document.getElementById('delete-messages');

// Show login prompt for authentication
const adminPassword = prompt('Enter admin password:');
if (adminPassword !== password) {
  alert('Incorrect password!');
  window.location.href = '/'; // Redirect to homepage
} else {
  isAuthenticated = true;
  loadAdminPanel();
}

// Load rooms and users list
function loadAdminPanel() {
  socket.emit('get room list');
  socket.emit('get user list');
}

// Get the list of rooms
socket.on('room list', (rooms) => {
  roomList.innerHTML = ''; // Clear room list

  rooms.forEach(room => {
    const roomElement = document.createElement('li');
    roomElement.textContent = room;
    roomList.appendChild(roomElement);
  });
});

// Get the list of users
socket.on('user list', (users) => {
  userList.innerHTML = ''; // Clear user list

  users.forEach(user => {
    const userElement = document.createElement('li');
    userElement.textContent = user;
    userList.appendChild(userElement);
  });
});

// Delete a room
deleteRoomButton.addEventListener('click', () => {
  const selectedRoom = prompt('Enter room name to delete:');
  if (selectedRoom) {
    socket.emit('delete room', selectedRoom);
  }
});

// Kick a user
kickUserButton.addEventListener('click', () => {
  const userToKick = prompt('Enter username to kick:');
  if (userToKick) {
    socket.emit('kick user', userToKick);
  }
});

// Delete all messages
deleteMessagesButton.addEventListener('click', () => {
  const confirmDelete = confirm('Are you sure you want to delete all messages?');
  if (confirmDelete) {
    socket.emit('delete all messages');
  }
});

// Logout and redirect to home
logoutButton.addEventListener('click', () => {
  window.location.href = '/'; // Redirect to homepage
});

// Listen for server responses
socket.on('room deleted', (roomName) => {
  alert(`Room ${roomName} deleted successfully`);
  loadAdminPanel();  // Refresh the room list
});

socket.on('user kicked', (userName) => {
  alert(`${userName} has been kicked`);
  loadAdminPanel();  // Refresh the user list
});

socket.on('messages deleted', () => {
  alert('All messages have been deleted');
});
