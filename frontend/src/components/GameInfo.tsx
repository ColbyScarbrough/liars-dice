import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

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

interface GameInfoProps {
  gameState: GameState;
  id: number | null;
  playerName: string;
  dice: number[];
  setDice: React.Dispatch<React.SetStateAction<number[]>>;
  onStartGameClick: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  id,
  playerName,
  dice,
  onStartGameClick,
}) => {
  return (
    <Container
      className='game-info'
    >
      <div className='game-info-labels'>
        <h1>Liars Dice</h1>
        <h3>Your ID: {id}</h3>
        <p>Your Name: {playerName}</p>
        <p>Your Dice: {dice.length ? dice.join(', ') : 'Loading...'}</p>
      </div>
      {id === 0 && !gameState.started && (
        <Button
          variant="success"
          size="lg"
          onClick={onStartGameClick}
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
    </Container>
  );
};

export default GameInfo;