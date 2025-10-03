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
  uuid: number;
  playerName: string;
  onStartGameClick: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  id,
  uuid,
  playerName,
  onStartGameClick,
}) => {
  return (
    <div className='game-info'>
      <div>
        <h3>{playerName}</h3>
        <br/>
        <h3>Room Code: {uuid}</h3>
        <br/>
      </div>
      {id === 0 && (
        <Button
          className='submit'
          size="lg"
          onClick={onStartGameClick}
          disabled={gameState.players.length < 2 || gameState.started}
        >
          Start Game
        </Button>
      )}
    </div>
  );
};

export default GameInfo;