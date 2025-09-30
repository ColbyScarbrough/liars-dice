import React from 'react';
import { Container, Button } from 'react-bootstrap';

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
  onStartGameClick: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  id,
  playerName,
  onStartGameClick,
}) => {
  return (
    <Container>
      <div>
        <h3>{playerName}</h3>
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
    </Container>
  );
};

export default GameInfo;