import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface StartGameModalProps {
  show: boolean;
  onHide: () => void;
  onStart: () => void;
  playerCount: number;
}

const StartGameModal: React.FC<StartGameModalProps> = ({ show, onHide, onStart, playerCount }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Start Game</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to start the game with {playerCount} players?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onStart}>
          Start
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StartGameModal;