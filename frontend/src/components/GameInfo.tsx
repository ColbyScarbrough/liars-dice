import React from 'react';
import { Container } from 'react-bootstrap';

interface GameInfoProps {
  id: number | null;
  playerName: string;
}

const GameInfo: React.FC<GameInfoProps> = ({
  id,
  playerName,
}) => {
  return (
    <Container className="game-info">
      <div className="game-info-labels">
        <h1>Liars Dice</h1>
        <h3>Your ID: {id}</h3>
        <p>Your Name: {playerName}</p>
      </div>
    </Container>
  );
};

export default GameInfo;