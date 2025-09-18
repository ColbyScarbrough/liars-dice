import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

interface Player {
  id: number;
  name: string;
  diceCount: number;
  isSelf: boolean;
  hasLost: boolean;
  dice?: number[]; // Added for client's dice
}

interface GameState {
  players: Player[];
  currentPlayer: number;
  currentBid: { count: number; face: number } | null;
  started: boolean;
}

const GamePage: React.FC = () => {
  const { roomId, playerName } = useParams<{ roomId: string; playerName: string }>();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bidCount, setBidCount] = useState<number>(1);
  const [bidFace, setBidFace] = useState<number>(1);
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const id = gameState?.players.find(p => p.isSelf || p.name === playerName)?.id ?? 'Loading...';

  useEffect(() => {
    if (!roomId || !playerName) {
      setError('Missing roomId or playerName');
      return;
    }

    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);
    console.log('GamePage socket created:', newSocket.id);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('joinGame', { roomId: roomId.toUpperCase(), playerName });
    });

    newSocket.on('gameState', (state: GameState) => {
      console.log('Received game state:', state);
      setGameState(state);
      setError(null);
    });

    newSocket.on('gameStarted', ({ state }: { state: GameState }) => {
      console.log('Game started:', state);
      setGameState(state);
      setError(null);
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
  }, [roomId, playerName]);

  const handleStartGameClick = () => {
    console.log('Start Game clicked');
    if (roomId && id === 0 && socket) {
      socket.emit('startGame', { roomId, playerName }, (response: { state?: GameState; error?: string }) => {
        if (response.error) {
          setError(response.error);
        }
      });
    }
  };

  const handleCallLiarClick = () => {
    console.log('Call Liar clicked');
    if (roomId && id !== 'Loading...' && socket) {
      socket.emit('callLiar', { roomId, playerId: id }, (response: { state?: GameState; error?: string }) => {
        if (response.error) {
          setError(response.error);
        }
      });
    }
  };

  const handleMakeBidClick = () => {
    console.log('Make Bid clicked:', { count: bidCount, face: bidFace });
    if (roomId && id !== 'Loading...' && socket) {
      socket.emit('makeBid', { roomId, playerId: id, count: bidCount, face: bidFace }, (response: { state?: GameState; error?: string }) => {
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
      <p>Your Dice: {gameState.players.find(p => p.isSelf)?.dice?.join(', ') || 'Loading...'}</p>
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
        <Row>
          <Col>
            <h3>Game Actions</h3>
            <Form.Group className="mb-3">
              <Form.Label>Bid Count</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={bidCount}
                onChange={(e) => setBidCount(Number(e.target.value))}
                disabled={gameState.currentPlayer !== id}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bid Face (1-6)</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={6}
                value={bidFace}
                onChange={(e) => setBidFace(Number(e.target.value))}
                disabled={gameState.currentPlayer !== id}
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={handleMakeBidClick}
              disabled={gameState.currentPlayer !== id}
            >
              Make Bid
            </Button>
            <Button
              variant="danger"
              onClick={handleCallLiarClick}
              className="ms-2"
              disabled={gameState.currentPlayer !== id}
            >
              Call Liar
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default GamePage;