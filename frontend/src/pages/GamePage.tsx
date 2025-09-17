import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom'; // Import useParams
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

const GamePage: React.FC = () => { // Remove props from FC type
  const { roomId, playerName } = useParams<{ roomId: string; playerName: string }>(); // Extract from URL
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !playerName) {
      setError('Missing roomId or playerName');
      return;
    }

    const socket = io('http://localhost:3001');

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
  }, [roomId, playerName]); // Add dependencies

  const handleCallLiarClick = () => {
    console.log('Call Liar clicked'); // Placeholder for now
  };

  if (error) return <div>Error: {error}</div>;
  if (!gameState) return <div>Loading players...</div>;

  return (
    <Container>
      <h1>Liars Dice</h1>
      <Row>
        <Col>
          <h3>Connected Players ({gameState.players.length}/6)</h3>
          {gameState.players.map(player => (
            <p key={player.id}>{player.name}</p>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default GamePage;