import React from 'react';
import { Button, Form, Col, Row } from 'react-bootstrap';
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
}) => {
  const handleMakeBidClick = () => {
    console.log('Make Bid clicked:', { count: bidCount, face: bidFace });
    console.log('Make Bid clicked:', { id, roomId, socket });

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
    <Row>
      <Col>
        <h3>Game Actions</h3>
        <Form.Group className="mb-3">
          <Form.Label>Bid Count</Form.Label>
          <Form.Control
            type="number"
            min={1}
            max={6}
            value={bidCount}
            onChange={(e) => setBidCount(Number(e.target.value))}
            disabled={gameState.currentPlayer !== id}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Bid Face (1-6)</Form.Label>
          <Form.Control
            type="number"
            min={1}
            max={6}
            value={bidFace}
            onChange={(e) => setBidFace(Number(e.target.value))}
            disabled={gameState.currentPlayer !== id}
          />
        </Form.Group>
        <Button
          variant="primary"
          onClick={handleMakeBidClick}
          disabled={gameState.currentPlayer !== id || !roomId || !socket}
        >
          Make Bid
        </Button>
        {bidError && (
          <small className="text-danger d-block mt-2">{bidError}</small>
        )}
        <Button
          variant="danger"
          onClick={handleCallLiarClick}
          className="ms-2"
          disabled={gameState.currentPlayer !== id || !roomId || !socket}
        >
          Call Liar
        </Button>
        {callError && (
          <small className="text-danger d-block mt-2">{callError}</small>
        )}
      </Col>
    </Row>
  );
};

export default GameControls;