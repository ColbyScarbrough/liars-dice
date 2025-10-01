import React from 'react';
import { Container } from 'react-bootstrap';

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

interface CurrentPlayerAndBidProps {
  gameState: GameState;
}

const CurrentPlayerAndBid: React.FC<CurrentPlayerAndBidProps> = ({ gameState }) => {
  return (
    <Container>
      <p>Current Player: {gameState.players.find(p => p.id === gameState.currentPlayer)?.name || 'Unknown'}</p>
      <p>
        Current Bid: {gameState.currentBid 
          ? `${gameState.currentBid.count} x ${gameState.currentBid.face}` 
          : 'None'}
      </p>
    </Container>
  );
};

export default CurrentPlayerAndBid;