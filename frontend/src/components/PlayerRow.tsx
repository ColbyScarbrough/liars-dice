import React from 'react';
import { Row, Col } from 'react-bootstrap';

interface Player {
  id: number;
  name: string;
  diceCount: number;
  isSelf: boolean;
  hasLost: boolean;
}

interface PlayerRowProps {
  player: Player;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player }) => {
  return (
    <Row
      className="player-row"
      style={{
        position: 'relative',
        marginBottom: '10px',
        padding: '5px',
        backgroundColor: player.isSelf ? '#e0f7fa' : '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '4px',
      }}
    >
      <Col xs={8}>
        <span>{player.name}</span>
      </Col>
      <Col xs={4} className="text-end">
        <span>{player.diceCount} dice{player.hasLost && ' (Lost)'}</span>
      </Col>
    </Row>
  );
};

export default PlayerRow;