import React from 'react';
import { Col, Row } from 'react-bootstrap';

interface Player {
  id: number;
  name: string;
  diceCount: number;
  isSelf: boolean;
  hasLost: boolean;
}

interface PlayersConnectedProps {
  players: Player[];
}

const PlayersConnected: React.FC<PlayersConnectedProps> = ({ players }) => {
  return (
    <Row>
      <Col>
        <h3>Connected Players ({players.length}/6)</h3>
        {players.map(player => (
          <p key={player.id}>{player.name}</p>
        ))}
      </Col>
    </Row>
  );
};

export default PlayersConnected;