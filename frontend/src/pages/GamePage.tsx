import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import StartGameModal from '../components/StartGameModal';
import PlayerRow from '../components/PlayerRow';
import Hand from '../components/Hand';
import DigitCounter from '../components/DigitCounter';

interface Player {
  id: number;
  name: string;
  diceCount: number;
  isSelf: boolean;
  hasLost: boolean;
  dice?: number[]; // Add dice array to Player interface
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
  const [showStartModal, setShowStartModal] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

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
      console.log('Received game state:', state.players);
      setGameState(state);
      if (state.players.length > 0 && state.players[0].name === playerName) {
        setIsCreator(true);
      }
    });

    socket.on('gameStarted', (data: { state: GameState }) => {
      console.log('Game started:', data.state);
      setGameState(data.state);
      setIsGameStarted(true);
      setShowStartModal(false);
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

  const handleStartGame = () => {
    if (roomId && playerName) {
      const socket = io('http://localhost:3001');
      socket.emit('startGame', { roomId: roomId.toUpperCase(), playerName });
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!gameState) return <div>Loading players...</div>;

  const currentPlayer = gameState.players.find(p => p.isSelf);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Translucent darker grey overlay covering the entire screen */}
      {!isGameStarted && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1,
          }}
        />
      )}

      <Container style={{ position: 'relative', zIndex: 2 }}>
        <h1>Liars Dice</h1>
        {isGameStarted && currentPlayer && (
          <Hand player={currentPlayer} isVisible={true} />
        )}
        {!isGameStarted && isCreator && gameState.players.length >= 2 && (
          <Button variant="success" onClick={() => setShowStartModal(true)}>
            Start Game
          </Button>
        )}
        {isGameStarted && <DigitCounter />} {/* Add DigitCounter after game starts */}
      </Container>

      {/* Player rows stacked in lower left */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 3,
          maxHeight: '50vh',
          overflowY: 'auto',
        }}
      >
        {gameState.players.map(player => (
          <PlayerRow key={player.id} player={player} />
        ))}
      </div>

      <StartGameModal
        show={showStartModal}
        onHide={() => setShowStartModal(false)}
        onStart={handleStartGame}
        playerCount={gameState.players.length}
      />
    </div>
  );
};

export default GamePage;