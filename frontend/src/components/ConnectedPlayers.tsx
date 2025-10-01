import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import dies from '../assets/dice-shield.png';


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
    <Container className='player-info'>
        <h1>Connected Players ({gameState.players.length}/6)</h1>
        {gameState.players.map(player => (
          <h3 key={player.id}>{player.name}: {Array.from({ length: player.diceCount }).map((_, index) => (
          <img
            key={index}
            src={dies}
            alt="Dice Shield"
            className='dice-shield'
          />
        ))}</h3>
        ))}
    </Container>
  );
};

export default ConnectedPlayers;