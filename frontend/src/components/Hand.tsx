import React from 'react';
import { Row, Col } from 'react-bootstrap';

interface Player {
  id: number;
  name: string;
  diceCount: number;
  isSelf: boolean;
  hasLost: boolean;
  dice?: number[]; 
}

interface HandProps {
  player: Player;
  isVisible: boolean;
}

const Hand: React.FC<HandProps> = ({ player, isVisible }) => {
  const displayDice = isVisible && player.dice?.slice(0, 4) ? player.dice.slice(0, 4) : Array(Math.min(player.diceCount, 4)).fill(1);
  const maxDisplay = 4;

  return (
    <Row className="hand-row" style={{ marginBottom: '10px' }}>
      {Array.from({ length: maxDisplay }, (_, index) => {
        const dieValue = displayDice[index] || 1;
        const dieImage = `./assets/dice-six-faces-${dieValue}.png`;
        return (
          <Col key={index} xs={3} style={{ textAlign: 'center' }}>
            {player.diceCount > 0 && index < Math.min(player.diceCount, maxDisplay) ? (
              <img
                src={dieImage}
                alt={`Die ${dieValue}`}
                style={{ width: '50px', height: '50px' }}
              />
            ) : (
              <div style={{ width: '50px', height: '50px', backgroundColor: '#ccc' }} />
            )}
          </Col>
        );
      })}
    </Row>
  );
};

export default Hand;