const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// ==== Import your game logic ====
const { LiarsDiceGame } = require('./LiarsDice');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

const PORT = 3001;

// Store game instances in memory: { roomCode: { game: LiarsDiceGame, creator: string } }
const games = {};

// Utility to generate 6-character alphanumeric uppercase code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // ===== Create a Room =====
  socket.on('createRoom', ({ playerName }) => {
    let roomCode;
    do {
      roomCode = generateRoomCode();
    } while (games[roomCode]);

    // Create game and track creator
    games[roomCode] = { game: new LiarsDiceGame([playerName]), creator: playerName };
    socket.join(roomCode);

    console.log(`Room created: ${roomCode} by ${playerName}`);

    // Send the room code and initial state back to the creator
    socket.emit('roomCreated', { roomCode, state: games[roomCode].game.getPublicState(playerName) });
  });

  // ===== Join an Existing Room =====
  socket.on('joinGame', ({ roomId, playerName }) => {
    const roomCode = roomId.toUpperCase();
    const gameData = games[roomCode];

    if (!gameData) {
      socket.emit('errorMessage', 'Room not found');
      return;
    }

    if (gameData.game.state.players.length >= 6) {
      socket.emit('errorMessage', 'Room is full (max 6 players)');
      return;
    }

    // Check if playerName already exists in the room
    const existingPlayer = gameData.game.state.players.find(p => p.name === playerName);
    if (existingPlayer) {
      console.log(`${playerName} is already in room ${roomCode}, skipping join`);
      socket.join(roomCode);
      io.to(roomCode).emit('gameState', gameData.game.getPublicState(playerName));
      return;
    }

    // Add new player
    socket.join(roomCode);
    const newId = gameData.game.state.players.length;
    gameData.game.state.players.push({
      id: newId,
      name: playerName,
      dice: gameData.game.rollDice(6),
      hasLost: false
    });

    console.log(`${playerName} joined room ${roomCode}`);
    io.to(roomCode).emit('gameState', gameData.game.getPublicState(playerName));
  });

  // ===== Start Game =====
  socket.on('startGame', ({ roomId, playerName }) => {
    const roomCode = roomId.toUpperCase();
    const gameData = games[roomCode];

    if (!gameData) {
      socket.emit('errorMessage', 'Room not found');
      return;
    }

    if (playerName !== gameData.creator) {
      socket.emit('errorMessage', 'Only the room creator can start the game');
      return;
    }

    if (gameData.game.state.players.length < 2) {
      socket.emit('errorMessage', 'At least 2 players are required to start the game');
      return;
    }

    // Game can start, notify all players
    console.log(`Game started in room ${roomCode} by ${playerName}`);
    io.to(roomCode).emit('gameStarted', { state: gameData.game.getPublicState(playerName) });
  });

  // ===== Make a Bid =====
  socket.on('makeBid', ({ roomId, playerId, count, face }) => {
    const gameData = games[roomId.toUpperCase()];
    if (!gameData) return;
    if (gameData.game.makeBid(playerId, count, face)) {
      io.to(roomId.toUpperCase()).emit('gameState', gameData.game.getPublicState(''));
    } else {
      console.log(`Bid failed for player ${playerId} in room ${roomId}`);
    }
  });

  // ===== Call Liar =====
  socket.on('callLiar', ({ roomId, playerId }) => {
    const gameData = games[roomId.toUpperCase()];
    if (!gameData) return;
    const result = gameData.game.callLiar(playerId);
    if (result) {
      io.to(roomId.toUpperCase()).emit('gameState', gameData.game.getPublicState(''));
    } else {
      console.log(`Challenge failed for player ${playerId} in room ${roomId}`);
    }
  });

  // ===== Disconnect =====
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