import React, { useState } from 'react';
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
  const [inputCount, setInputCount] = useState(1); // State for inputCount
  const [inputFace, setInputFace] = useState(1); // State for inputFace

  const handleMakeBidClick = () => {
    console.log('Make Bid clicked:', { count: inputCount, face: inputFace });

    if (roomId && id !== null && socket) {
      socket.emit('makeBid', { roomId, playerId: id, count: inputCount, face: inputFace }, (response: { state?: GameState; error?: string }) => {
        if (response.error) {
          setBidError(response.error);
        } else {
          setBidError(null);
          // Optionally update bidCount and bidFace in parent state
          setBidCount(inputCount);
          setBidFace(inputFace);
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

  // Handlers for incrementing and decrementing inputCount and inputFace
  const handleIncrementCount = () => {
    setInputCount(prev => Math.min(prev + 1, diceImages.length)); // Cap at max diceImages length
  };

  const handleDecrementCount = () => {
    setInputCount(prev => Math.max(prev - 1, 1)); // Prevent going below 1
  };

  const handleIncrementFace = () => {
    setInputFace(prev => Math.min(prev + 1, diceImages.length)); // Cap at max diceImages length
  };

  const handleDecrementFace = () => {
    setInputFace(prev => Math.max(prev - 1, 1)); // Prevent going below 1
  };

  return (
    <Container className='input-dice'>
      <Row>
        <Col>
          <h3>Current Bid</h3>
        </Col>
        <Col>
          <h3>Your Bid</h3>
        </Col>
      </Row>
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
          <Button onClick={handleIncrementCount} className='input-button' disabled={!gameState.started}>+</Button>
          <img
            src={diceImages[inputCount - 1]}
            style={{ width: '6rem', height: '6rem' }}
          />
          <Button onClick={handleDecrementCount} className='input-button' disabled={!gameState.started}>-</Button>
        </Col>
        <Col className='input-column'>
          <Button onClick={handleIncrementFace} className='input-button' disabled={!gameState.started}>+</Button>
          <img
            src={diceImages[inputFace - 1]}
            style={{ width: '6rem', height: '6rem' }}
          />
          <Button onClick={handleDecrementFace} className='input-button' disabled={!gameState.started}>-</Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button onClick={handleMakeBidClick} className='turn-button' disabled={!gameState.started || gameState.currentPlayer != id}>Make Bid</Button>
        </Col>
        <Col>
          <Button onClick={handleCallLiarClick} className='turn-button' disabled={!gameState.started || gameState.currentPlayer != id}>Call Liar</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default GameControls;