import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import StartGameModal from '../components/StartGameModal';
import PlayerRow from '../components/PlayerRow';
import Hand from '../components/Hand';
import DigitCounter from '../components/DigitCounter';
import CallLiar from '../components/CallLiar';
import { io } from 'socket.io-client';

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
  const [showStartModal, setShowStartModal] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [betCount, setBetCount] = useState<number>(1); // First digit of current bet
  const [betFace, setBetFace] = useState<number>(1); // Second digit of current bet
  const [prevProduct, setPrevProduct] = useState<number>(0); // Previous bet product

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
      if (state.players.length > 0 && state.players.find(p => p.name === playerName && p.isSelf)) {
        setIsCreator(state.players[0].name === playerName);
      }
      // Update bet digits from currentBid if available
      if (state.currentBid) {
        setBetCount(state.currentBid.count);
        setBetFace(state.currentBid.face);
        setPrevProduct(state.currentBid.count * state.currentBid.face);
      }
    });

    socket.on('gameStarted', (data: { state: GameState }) => {
      console.log('Game started:', data.state);
      setGameState(data.state);
      setIsGameStarted(true);
      setShowStartModal(false);
      // Initialize bet digits with currentBid at game start
      if (data.state.currentBid) {
        setBetCount(data.state.currentBid.count);
        setBetFace(data.state.currentBid.face);
        setPrevProduct(data.state.currentBid.count * data.state.currentBid.face);
      }
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

  const handleCallLiarClick = () => {
    console.log('Call Liar clicked'); // Placeholder for now
  };

  if (error) return <div>Error: {error}</div>;
  if (!gameState) return <div>Loading players...</div>;

  const currentPlayer = gameState.players.find(p => p.isSelf);
  const isMyTurn = currentPlayer?.id === gameState.currentPlayer;
  const currentProduct = betCount * betFace;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
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

      {isCreator && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            fontSize: '18px',
            color: '#fff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '5px 10px',
            borderRadius: '4px',
            zIndex: 3,
          }}
        >
          Game Code: {roomId}
        </div>
      )}

      <Container style={{ position: 'relative', zIndex: 2, textAlign: 'center', paddingTop: '20px' }}>
        <h2>Current Player's Turn: {gameState.players.find(p => p.id === gameState.currentPlayer)?.name || 'N/A'}</h2>
        {isGameStarted && (
          <CallLiar
            currentBet={{ count: betCount, face: betFace }}
            onClick={handleCallLiarClick}
          />
        )}
        {isGameStarted && (
          <div style={{ marginTop: '20px' }}>
            <DigitCounter initialValue={betCount} onChange={(value) => setBetCount(value)} />
            <DigitCounter initialValue={betFace} onChange={(value) => setBetFace(value)} />
            <h1 style={{ fontSize: '48px', display: 'inline-block', margin: '0 20px' }}>{currentProduct}</h1>
            <p style={{ fontSize: '16px', marginTop: '5px' }}>Previous Bet Product: {prevProduct}</p>
          </div>
        )}
        {isGameStarted && currentPlayer && (
          <>
            <Button
              variant="primary"
              style={{ marginTop: '20px', marginBottom: '10px' }}
              disabled={!isMyTurn}
            >
              Place Bet
            </Button>
            <Hand player={currentPlayer} isVisible={true} />
          </>
        )}
        {!isGameStarted && isCreator && gameState.players.length >= 2 && (
          <Button variant="success" onClick={() => setShowStartModal(true)}>
            Start Game
          </Button>
        )}
      </Container>

      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 3,
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