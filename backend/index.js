const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// ==== Import your game logic ====
const { LiarsDiceGame } = require('./LiarsDiceGame'); // make sure LiarsDiceGame.ts is compiled or in JS

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

const PORT = 3001;

// Store game instances in memory
const games = {};

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Player joins a game
  socket.on('joinGame', ({ roomId, playerName }) => {
    socket.join(roomId);

    // Create new game if it doesn't exist
    if (!games[roomId]) {
      games[roomId] = new LiarsDiceGame([playerName]);
    } else {
      const newId = games[roomId].state.players.length;
      games[roomId].state.players.push({
        id: newId,
        name: playerName,
        dice: games[roomId].rollDice(6),
        hasLost: false
      });
    }

    // Send updated game state to everyone in the room
    io.to(roomId).emit('gameState', games[roomId].getPublicState(playerName));
  });

  // Player makes a bid
  socket.on('makeBid', ({ roomId, playerId, count, face }) => {
    const game = games[roomId];
    if (!game) return;
    if (game.makeBid(playerId, count, face)) {
      io.to(roomId).emit('gameState', game.getPublicState(''));
    }
  });

  // Player calls liar
  socket.on('callLiar', ({ roomId, playerId }) => {
    const game = games[roomId];
    if (!game) return;
    const result = game.callLiar(playerId);
    io.to(roomId).emit('gameState', game.getPublicState(''));
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
