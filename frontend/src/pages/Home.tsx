import React, { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    setJoinCode(value.toUpperCase());
  };

  const handleJoin = () => {
    if (joinCode.length === 6) {
      navigate(`/enter-name/${joinCode}`);
    }
  };

  const handleCreate = () => {
    navigate("/enter-name");
  };

  return (
    <Container className="text-center mt-5">
      <h1 className="mb-4">Liars Dice</h1>

      {/* Enter Code */}
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8} lg={8}>
          <Form.Control
            size="lg"
            type="text"
            placeholder="Game Code"
            value={joinCode}
            onChange={handleCodeChange}
            className="text-center fs-3 p-3"
            maxLength={6}
          />
        </Col>
      </Row>

      {/* Join Button */}
      <Row className="justify-content-center mb-4">
        <Col xs="auto">
          <Button
            variant="primary"
            size="lg"
            disabled={joinCode.length !== 6}
            onClick={handleJoin}
          >
            Join Game
          </Button>
        </Col>
      </Row>

      {/* Create Room */}
      <Row className="justify-content-center">
        <Col xs="auto">
          <Button
            variant="success"
            size="lg"
            onClick={handleCreate}
          >
            Create Room
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
