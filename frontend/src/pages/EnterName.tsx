import React, { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import io from 'socket.io-client';

export default function EnterName() {
  const { roomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
    setPlayerName(value);
  };

  const handleSubmit = () => {
    if (playerName.trim().length < 1) return;
    const socket = io('http://localhost:3001');
    socket.emit(roomId ? 'joinGame' : 'createRoom', { roomId: roomId || '', playerName });
    socket.on('roomCreated', ({ roomCode }: { roomCode: string }) => {
      navigate(`/game/${roomCode}/${playerName}`);
    });
    socket.on('gameState', (state: any) => { // Replace 'any' with GameState if defined
      if (roomId) navigate(`/game/${roomId}/${playerName}`);
    });
    socket.on('errorMessage', (message: string) => {
      console.log(message); // Handle error (e.g., show alert)
    });
  };

  return (
    <Container className="text-center mt-5">
      <h1 className="mb-4">{roomId ? "Enter Your Name" : "Create Game - Enter Your Name"}</h1>
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={10} lg={10}>
          <Form.Control
            size="lg"
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={handleNameChange}
            className="text-center fs-3 p-3"
            maxLength={12}
          />
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs="auto">
          <Button
            variant="primary"
            size="lg"
            disabled={playerName.trim().length < 1}
            onClick={handleSubmit}
          >
            Continue
          </Button>
        </Col>
      </Row>
    </Container>
  );
}