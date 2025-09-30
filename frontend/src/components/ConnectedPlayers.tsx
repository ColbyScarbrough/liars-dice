import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';

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

interface ConnectedPlayersProps {
  gameState: GameState;
}

const ConnectedPlayers: React.FC<ConnectedPlayersProps> = ({ gameState }) => {
  return (
    <Container>
        <h3>Connected Players ({gameState.players.length}/6)</h3>
        {gameState.players.map(player => (
          <p key={player.id}>Name: {player.name}, ID: {player.id}, Dice: {player.diceCount}</p>
        ))}
    </Container>
  );
};

export default ConnectedPlayers;