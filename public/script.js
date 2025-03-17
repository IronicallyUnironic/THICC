const socket = io();

// DOM elements
const roomInput = document.getElementById('room-input');
const roomsList = document.getElementById('rooms');
const usersList = document.getElementById('users');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message');
const messagesContainer = document.getElementById('messages');
const joinRoomBtn = document.getElementById('join-room-btn');

// Get username from cookies or prompt for one
let username = getCookie('username') || prompt("Enter your username");

if (username) {
  setCookie('username', username, 365);  // Save username in cookies
}

// Join room functionality
joinRoomBtn.addEventListener('click', () => {
  const roomName = roomInput.value.trim();
  if (roomName && username) {
    socket.emit('join room', username, roomName);
    roomInput.value = '';  // Clear room input field
  }
});

// Send message
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value;
  if (message.trim()) {
    socket.emit('chat message', message);
    messageInput.value = '';  // Clear input field
  }
});

// Display messages
socket.on('message', (msg) => {
  const li = document.createElement('li');
  li.textContent = `${msg.username}: ${msg.message}`;
  messagesContainer.appendChild(li);
  messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto scroll to newest message
});

// Update room info
socket.on('room info', (data) => {
  // Update rooms list
  roomsList.innerHTML = '';
  data.rooms.forEach((room) => {
    const li = document.createElement('li');
    li.textContent = room;
    roomsList.appendChild(li);
  });

  // Update users list
  usersList.innerHTML = '';
  data.users.forEach((user) => {
    const li = document.createElement('li');
    li.textContent = user;
    usersList.appendChild(li);
  });

  // Display existing messages in the room
  messagesContainer.innerHTML = '';
  data.messages.forEach((msg) => {
    const li = document.createElement('li');
    li.textContent = `${msg.username}: ${msg.message}`;
    messagesContainer.appendChild(li);
  });
});

// Cookie helper functions
function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
