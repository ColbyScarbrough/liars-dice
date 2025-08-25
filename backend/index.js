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

  socket.on('createRoom', ({ playerName }, callback) => {
    let roomCode;
    do {
      roomCode = generateRoomCode();
    } while (games[roomCode]);

    games[roomCode] = { game: new LiarsDiceGame([playerName]), creator: playerName };
    socket.join(roomCode);

    console.log(`Room created: ${roomCode} by ${playerName}`);
    callback({ roomCode, state: games[roomCode].game.getPublicState(playerName) });
  });

  socket.on('joinGame', ({ roomId, playerName }, callback) => {
    const roomCode = roomId.toUpperCase();
    const gameData = games[roomCode];

    if (!gameData) {
      callback({ error: 'Room not found' });
      return;
    }

    if (gameData.game.state.players.length >= 6) {
      callback({ error: 'Room is full (max 6 players)' });
      return;
    }

    const existingPlayer = gameData.game.state.players.find(p => p.name === playerName);
    if (existingPlayer) {
      console.log(`${playerName} is already in room ${roomCode}, skipping join`);
      socket.join(roomCode);
      callback({ state: gameData.game.getPublicState(playerName) });
      return;
    }

    socket.join(roomCode);
    const newId = gameData.game.state.players.length;
    gameData.game.state.players.push({
      id: newId,
      name: playerName,
      dice: gameData.game.rollDice(6),
      hasLost: false,
    });

    console.log(`${playerName} joined room ${roomCode}`);
    io.to(roomCode).emit('gameState', gameData.game.getPublicState(playerName));
    callback({ state: gameData.game.getPublicState(playerName) });
  });

  socket.on('startGame', ({ roomId, playerName }, callback) => {
    const roomCode = roomId.toUpperCase();
    const gameData = games[roomCode];

    if (!gameData) {
      callback({ error: 'Room not found' });
      return;
    }

    if (playerName !== gameData.creator) {
      callback({ error: 'Only the room creator can start the game' });
      return;
    }

    if (gameData.game.state.players.length < 2) {
      callback({ error: 'At least 2 players are required to start the game' });
      return;
    }

    console.log(`Game started in room ${roomCode} by ${playerName}`);
    io.to(roomCode).emit('gameStarted', { state: gameData.game.getPublicState(playerName) });
    callback({ state: gameData.game.getPublicState(playerName) });
  });

  socket.on('makeBid', ({ roomId, playerId, count, face }, callback) => {
    const gameData = games[roomId.toUpperCase()];
    if (!gameData) {
      callback({ error: 'Room not found' });
      return;
    }
    if (gameData.game.makeBid(playerId, count, face)) {
      io.to(roomId.toUpperCase()).emit('gameState', gameData.game.getPublicState(''));
      callback({ state: gameData.game.getPublicState('') });
    } else {
      callback({ error: 'Invalid bid' });
    }
  });

  socket.on('callLiar', ({ roomId, playerId }, callback) => {
    const gameData = games[roomId.toUpperCase()];
    if (!gameData) {
      callback({ error: 'Room not found' });
      return;
    }
    const result = gameData.game.callLiar(playerId);
    if (result) {
      io.to(roomId.toUpperCase()).emit('gameState', gameData.game.getPublicState(''));
      callback({ state: gameData.game.getPublicState('') });
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