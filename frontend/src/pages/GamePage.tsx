import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

interface Player {
  id: number;
  name: string;
  diceCount: number;
  isSelf: boolean;
  hasLost: boolean;
}

interface GameState {
  players: Player[];
  currentPlayer: number;
  currentBid: { count: number; face: number } | null;
}

const GamePage: React.FC = () => {
  const { roomId, playerName } = useParams<{ roomId: string; playerName: string }>();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const id = gameState?.players.find(p => p.isSelf || p.name === playerName)?.id ?? 'Loading...';

  useEffect(() => {
    if (!roomId || !playerName) {
      setError('Missing roomId or playerName');
      return;
    }

    const socket = io('http://localhost:3001');
    console.log('GamePage socket created:', socket.id);

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('joinGame', { roomId: roomId.toUpperCase(), playerName });
    });

    socket.on('gameState', (state: GameState) => {
      console.log('Received game state:', state);
      setGameState(state);
      setError(null);
    });

    socket.on('errorMessage', (message: string) => {
      console.log('Error:', message);
      setError(message);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, playerName]);

  const handleCallLiarClick = () => {
    console.log('Call Liar clicked');
  };

  const handleStartGameClick = () => {
    console.log('Start Game clicked');
    if (roomId && playerName) {
      const socket = io('http://localhost:3001');
      socket.emit('startGame', { roomId, playerName }, (response: { state?: GameState; error?: string }) => {
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
      {id === 0 && (
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
            <p key={player.id}>Name: {player.name}, ID: {player.id}</p>
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
    </Container>
  );
};

export default GamePage;