const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const LiarsDiceGame = require('./game/liarsDice');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

const PORT = 3001;

const games = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

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
