const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// ==== Import your game logic ====
const { LiarsDiceGame } = require('./LiarsDice'); // Ensure this matches the compiled JS file

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

const PORT = 3001;

// Store game instances in memory: { roomCode: LiarsDiceGame }
const games = {};

// Utility to generate 6-character alphanumeric uppercase code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('createRoom', ({ playerName }, callback) => {
    let roomCode;
    do {
      roomCode = generateRoomCode();
    } while (games[roomCode]);

    // Create game and add first player
    games[roomCode] = new LiarsDiceGame([playerName]);
    socket.join(roomCode);

    console.log(`Room created: ${roomCode} by ${playerName}`);

    // Send the room code and initial state back to the creator
    socket.emit('roomCreated', { roomCode, state: games[roomCode].getPublicState(playerName) });
  });

  socket.on('joinGame', ({ roomId, playerName }, callback) => {
    const roomCode = roomId.toUpperCase();
    const game = games[roomCode];

    if (!game) {
      socket.emit('errorMessage', 'Room not found');
      return;
    }

    if (game.state.players.length >= 6) {
      socket.emit('errorMessage', 'Room is full (max 6 players)');
      return;
    }

    // Check if playerName already exists in the room
    const existingPlayer = game.state.players.find(p => p.name === playerName);
    if (existingPlayer) {
      console.log(`${playerName} is already in room ${roomCode}, skipping join`);
      socket.join(roomCode); // Join to receive updates, but don't add again
      io.to(roomCode).emit('gameState', game.getPublicState(playerName));
      return;
    }

    socket.join(roomCode);
    const newId = game.state.players.length;
    game.state.players.push({
      id: newId,
      name: playerName,
      dice: game.rollDice(6),
      hasLost: false
    });

    console.log(`${playerName} joined room ${roomCode}`);

    // Send updated state to everyone in room
    io.to(roomCode).emit('gameState', game.getPublicState(playerName));
  });

  // ===== Make a Bid =====
  socket.on('makeBid', ({ roomId, playerId, count, face }) => {
    const game = games[roomId.toUpperCase()];
    if (!game) return;
    if (game.makeBid(playerId, count, face)) {
      io.to(roomId.toUpperCase()).emit('gameState', game.getPublicState(''));
    } else {
      callback({ error: 'Invalid bid' });
    }
  });

  // ===== Call Liar =====
  socket.on('callLiar', ({ roomId, playerId }) => {
    const game = games[roomId.toUpperCase()];
    if (!game) return;
    const result = game.callLiar(playerId);
    if (result) {
      io.to(roomId.toUpperCase()).emit('gameState', game.getPublicState(''));
    } else {
      callback({ error: 'Invalid challenge' });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Liars Dice Backend Running');
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});