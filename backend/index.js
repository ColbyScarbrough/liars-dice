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

// Store game instances in memory: { roomId: LiarsDiceGame }
const games = {};

// Store UUID's in memory
const uuids = {};

// Utility to generate 6-character alphanumeric uppercase code
function generateroomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Utility to generate a code to represent players
function generatePlayerHash(roomId) {
  let uuid;
  do {
    uuid = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (uuids[roomId] && Object.values(uuids[roomId]).includes(uuid));
  return uuid;
}


// Handle socket connections
io.on('connection', (socket) => {

  // ===== Create a New Room =====
  socket.on('createRoom', () => {
    let roomId;
    do {
      roomId = generateroomId();
    } while (games[roomId]);
    uuids[roomId] = {};

    // Create game
    games[roomId] = new LiarsDiceGame();
    socket.join(roomId);

    // Generate hash to represent player
    let uuid = generatePlayerHash(roomId);
    uuids[roomId][uuid] = {uuid};

    console.log(`Room created: ${roomId}, UUID: ${uuid}`);
    // Send the room code and initial state back to the creator
    socket.emit('roomCreated', { roomId, uuid });
  });

  // ===== Initializer for New Rooms =====
  socket.on('initializeGame', ({ roomId, uuid }, callback) => {
    const socketId = socket.id;
    const game = games[roomId];
    if (!game) {
      callback({ error: 'Room not found' });
      return;
    }
    else socket.emit('gameState', game.getPublicState());

    uuids[roomId][uuid] = socketId;
  })

  // ===== Join an Existing Room =====
  socket.on('joinGame', ({ roomId }) => {
    const game = games[roomId];

    if (!game) {
      console.log(`Room not found: ${roomId}`);
      socket.emit('errorMessage', 'Room not found');
      return;
    }

    if (game.state.players.length >= 6) {
      console.log(`Room full: ${roomId}`);
      socket.emit('errorMessage', 'Room is full (max 6 players)');
      return;
    }

    socket.join(roomId);
  
    // Generate hash to represent player
    let uuid = generatePlayerHash(roomId);
    uuids[roomId][uuids[roomId].length] = uuid;

    console.log(`Player joined in room ${roomId}, UUID: ${uuid}`);
    socket.emit('joinedGame', { roomId, uuid });

    // Send updated state to everyone in room
    io.to(roomId).emit('gameState', game.getPublicState());
  });

  // ===== Player Enters Name =====
  socket.on('nameEntered', ({ roomId, playerName }, callback) => {
    const game = games[roomId];

    if (!game) {
      callback({ error: 'Room not found' });
      return;
    }

    const newId = game.state.players.length;
    game.state.players.push({
      id: newId,
      name: playerName,
      dice: game.generateDice(6),
      hasLost: false
    });
    console.log("Player " + playerName + " with ID " + newId + " has entered their name and was added to game " + roomId);
    callback({ gameId: newId });
  });

  // ===== Start a Game =====
  socket.on('startGame', ({ roomId }) => {
    const game = games[roomId];    

    if (!game) {
      callback({ error: 'Room not found' }); 
      return;
    }
    
    game.state.started = true;

    io.to(roomId).emit('gameState', game.getPublicState());
    io.to(roomId).emit('newTurn');

    console.log("Game " + roomId + " has been started");
  });

  // ===== Make a Bid =====
  socket.on('makeBid', ({ roomId, playerId, count, face }, callback) => {
    const game = games[roomId];
    if (!game) {
      callback({ error: 'Room not found' });
      return;
    }
    if (game.makeBid(playerId, count, face)) {
      io.to(roomId).emit('gameState', game.getPublicState());
      console.log("Player " + playerId + " placed bet " + count + " " + face + "'s");
      callback({ state: game.getPublicState() });
    } else {
      callback({ error: 'Invalid bid' });
    }
  });

  // ===== Call Liar =====
  socket.on('callLiar', ({ roomId, playerId }, callback) => {
    const game = games[roomId];
    if (!game) {
      callback({ error: 'Room not found' });
      return;
    }
    const result = game.callLiar(playerId);
    console.log(`Player ${result} lost the challenge`);
    if (result !== null) {
      io.to(roomId).emit('gameState', game.getPublicState());
      callback({ state: game.getPublicState(), loserId: result });
    } else {
      callback({ error: 'Invalid challenge' });
    }
    io.to(roomId).emit('newTurn');
  });

  // ===== Get Dice =====
  socket.on('getDice', ({ roomId, playerId }, callback) => {
    const game = games[roomId];
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

  // ===== Any Socket Disconnection =====
  socket.on('disconnect', () => {
    const removablesocketId = socket.id;
    console.log(`Socket disconnected: ${removablesocketId}`);
    const roomId = Object.keys(uuids).find(roomId =>
      Object.values(uuids[roomId]).includes(removablesocketId)
    );

    if(!roomId) return;

    for (const [uuid, socketId] of Object.entries(uuids[roomId])) {
      if (socketId === removablesocketId) {
        delete uuids[roomId][uuid];
        break;
      }
    }

    if (Object.values(uuids[roomId]).length === 0) {
      delete uuids[roomId];
      delete games[roomId];
    }

  });

  // ===== Debug =====
  socket.on('debug', ({ roomId }) => {
    console.log(games);
    console.log(uuids);
    if(games[roomId]) console.log(games[roomId].state.players);
  });

});

app.get('/', (req, res) => {
  res.send('Liars Dice Backend Running');
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});