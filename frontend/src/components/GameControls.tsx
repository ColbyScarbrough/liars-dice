import React from 'react';
import { Button, Container, Col, Row } from 'react-bootstrap';
import { Socket } from 'socket.io-client';

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

interface GameControlsProps {
  gameState: GameState;
  id: number | null;
  roomId: string | undefined;
  socket: Socket | null;
  bidCount: number;
  bidFace: number;
  setBidCount: React.Dispatch<React.SetStateAction<number>>;
  setBidFace: React.Dispatch<React.SetStateAction<number>>;
  bidError: string | null;
  setBidError: React.Dispatch<React.SetStateAction<string | null>>;
  callError: string | null;
  setCallError: React.Dispatch<React.SetStateAction<string | null>>;
  diceImages: string[];
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  id,
  roomId,
  socket,
  bidCount,
  bidFace,
  setBidCount,
  setBidFace,
  bidError,
  setBidError,
  callError,
  setCallError,
  diceImages,
}) => {
  let inputCount = 1;
  let inputFace = 1;

  const handleMakeBidClick = () => {
    console.log('Make Bid clicked:', { count: bidCount, face: bidFace });

    if (roomId && id !== null && socket) {
      socket.emit('makeBid', { roomId, playerId: id, count: bidCount, face: bidFace }, (response: { state?: GameState; error?: string }) => {
        if (response.error) {
          setBidError(response.error);
        } else {
          setBidError(null);
        }
      });
    } else {
      setBidError('Cannot make bid: missing room ID or socket');
    }
  };

  const handleCallLiarClick = () => {
    console.log('Call Liar clicked');
    if (roomId && id !== null && socket) {
      socket.emit('callLiar', { roomId, playerId: id }, (response: { state?: GameState; error?: string }) => {
        if (response.error) {
          setCallError(response.error);
        } else {
          setCallError(null);
        }
      });
    } else {
      setCallError('Cannot call liar: missing room ID or socket');
    }
  };

  return (
    <Container>
      <Row>
        <Col className='input-column'>
          <img
            src={diceImages[bidCount - 1]}
            style={{ width: '6rem', height: '6rem' }}
          />
        </Col>
        <Col className='input-column'>
          <img
            src={diceImages[bidFace - 1]}
            style={{ width: '6rem', height: '6rem' }}
          />
        </Col>
        <Col className='input-column'>
          <Button>
            Test
          </Button>
          <img
            src={diceImages[inputCount - 1]}
            style={{ width: '6rem', height: '6rem' }}
          />
        </Col>
        <Col className='input-column'>
          <img
            src={diceImages[inputFace - 1]}
            style={{ width: '6rem', height: '6rem' }}
          />
        </Col>
      </Row>
      <Row>
        <Col>
        
        </Col>
        <Col>
        
        </Col>
      </Row>
    </Container>

  );
};

export default GameControls;