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

    const existingPlayer = game.state.players.find(p => p.name === playerName);
    if (existingPlayer) {
      console.log(`${playerName} is already in room ${roomCode}, skipping join`);
      socket.join(roomCode);
      io.to(roomCode).emit('gameState', game.getPublicState(playerName));
      return;
    }

    socket.join(roomCode);
    const newId = game.state.players.length;
    game.state.players.push({
      id: newId,
      name: playerName,
      dice: game.generateDice(6),
      hasLost: false
    });

    console.log(`${playerName} joined room ${roomCode}`);

    // Send updated state to everyone in room
    io.to(roomCode).emit('gameState', game.getPublicState(playerName));
  });

  // ===== Start a Game =====
  socket.on('startGame', ({ roomId }) => {
    const roomCode = roomId.toUpperCase();
    const game = games[roomCode];    
    game.state.started = true;

    io.to(roomId.toUpperCase()).emit('gameState', game.getPublicState(''));
    console.log("Game " + roomCode + " has been started");
  });

  // ===== Make a Bid =====
  socket.on('makeBid', ({ roomId, playerId, count, face }, callback) => {
    const roomCode = roomId.toUpperCase();
    const game = games[roomCode];
    if (!game) {
      callback({ error: 'Room not found' });
      return;
    }
    if (game.makeBid(playerId, count, face)) {
      io.to(roomCode).emit('gameState', game.getPublicState(''));
      console.log("Player " + playerId + " placed bet " + count + " " + face + "'s");
      callback({ state: game.getPublicState('') });
    } else {
      callback({ error: 'Invalid bid' });
    }
  });

  // ===== Call Liar =====
  socket.on('callLiar', ({ roomId, playerId }, callback) => {
    const roomCode = roomId.toUpperCase();
    const game = games[roomCode];
    if (!game) {
      callback({ error: 'Room not found' });
      return;
    }
    const result = game.callLiar(playerId);
    console.log(`Player ${result} lost the challenge`);
    if (result !== null) {
      io.to(roomCode).emit('gameState', game.getPublicState(''));
      game.state.players.forEach(player => {
        if (!player.hasLost) {
          io.to(roomCode).emit('getDice', { dice: game.getPlayerDice(player.id) });
        }
      });
      callback({ state: game.getPublicState(''), loserId: result });
    } else {
      callback({ error: 'Invalid challenge' });
    }
  });

  // ===== Get Dice =====
  socket.on('getDice', ({ roomId, playerId }, callback) => {
    const roomCode = roomId.toUpperCase();
    const game = games[roomCode];
    if (!game) {
      callback({ error: 'Room not found' });
      return;
    }
    const player = game.state.players.find(p => p.id === playerId);
    if (!player) {
      callback({ error: 'Player not found' });
      return;
    }
    const dice = game.getPlayerDice(playerId);
    callback({ dice });
  });
});

app.get('/', (req, res) => {
  res.send('Liars Dice Backend Running');
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});