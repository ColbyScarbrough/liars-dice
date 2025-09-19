import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import GameControls from '../components/GameControls';

interface Player {
  id: number;
  name: string;
  diceCount: number;
  isSelf: boolean;
  hasLost: boolean;
  dice?: number[];
}

interface GameState {
  players: Player[];
  currentPlayer: number;
  currentBid: { count: number; face: number } | null;
  started: boolean;
}

const GamePage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bidCount, setBidCount] = useState<number>(1);
  const [bidFace, setBidFace] = useState<number>(1);
  const [bidError, setBidError] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [dice, setDice] = useState<number[]>([]);
  const [playerName, setPlayerName] = useState<string>('');

  const id = gameState?.players.find(p => p.isSelf)?.id ?? 'Loading...';

  useEffect(() => {
    // Get playerName from localStorage or prompt
    let name = localStorage.getItem('playerName');
    if (!name) {
      name = prompt('Enter your name:') || `Player${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem('playerName', name);
    }
    setPlayerName(name);

    if (!roomId || !name) {
      setError('Missing roomId or playerName');
      return;
    }

    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);
    console.log('GamePage socket created:', newSocket.id);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('joinGame', { roomId: roomId.toUpperCase(), playerName: name });
    });

    newSocket.on('gameStarted', ({ state }: { state: GameState }) => {
      console.log('Game started:', state);
      setGameState(state);
      setError(null);
      setBidError(null);
    });

    newSocket.on('gameState', (state: GameState) => {
      console.log('Received game state:', state);
      setGameState(state);
    });

    newSocket.on('newTurn', () => {
      if (id !== 'Loading...') {
        newSocket.emit('getDice', { roomId, playerId: id }, (response: { dice?: number[]; error?: string }) => {
          if (response.error) {
            setError(response.error);
          } else if (response.dice) {
            setDice(response.dice);
          }
        });
      }
    });

    newSocket.on('errorMessage', (message: string) => {
      console.log('Error:', message);
      setError(message);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, id]);

  const handleStartGameClick = () => {
    console.log('Start Game clicked');
    if (roomId && id === 0 && socket) {
      socket.emit('startGame', { roomId }, (response: { state?: GameState; error?: string }) => {
        if (response.error) {
          setError(response.error);
        }
      });
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!gameState) return <div>Loading players...</div>;

  return (
    <Container>
      <h1>Liars Dice</h1>
      <h3>Your ID: {id}</h3>
      <p>Your Name: {playerName}</p>
      <p>Your Dice: {dice.length ? dice.join(', ') : 'Loading...'}</p>
      {id === 0 && !gameState.started && (
        <Button
          variant="success"
          size="lg"
          onClick={handleStartGameClick}
          disabled={gameState.players.length < 2}
        >
          Start Game
        </Button>
      )}
      <Row>
        <Col>
          <h3>Connected Players ({gameState.players.length}/6)</h3>
          {gameState.players.map(player => (
            <p key={player.id}>Name: {player.name}, ID: {player.id}, Dice: {player.diceCount}</p>
          ))}
        </Col>
      </Row>
      <Row>
        <Col>
          <p>Current Player: {gameState.players.find(p => p.id === gameState.currentPlayer)?.name || 'Unknown'}</p>
        </Col>
        <Col>
          <p>
            Current Bid: {gameState.currentBid 
              ? `${gameState.currentBid.count} x ${gameState.currentBid.face}` 
              : 'None'}
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>Game Status: {gameState.started ? 'Started' : 'Waiting to start'}</p>
        </Col>
      </Row>
      {gameState.started && (
        <GameControls
          gameState={gameState}
          id={id}
          roomId={roomId}
          socket={socket}
          bidCount={bidCount}
          bidFace={bidFace}
          setBidCount={setBidCount}
          setBidFace={setBidFace}
          bidError={bidError}
          setBidError={setBidError}
          callError={callError}
          setCallError={setCallError}
        />
      )}
    </Container>
  );
};

export default GamePage;