import React, { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";

export default function Home() {
  const [joinCode, setJoinCode] = useState("");

  const handleJoin = () => {
    console.log("Joining room:", joinCode);
    // TODO: Send join request via Socket.io or API
  };

  const handleCreate = () => {
    console.log("Creating room...");
    // TODO: Emit create-room to backend
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase(); // Make uppercase for consistency
    value = value.replace(/[^A-Z0-9]/gi, ""); // Remove non-alphanumeric chars
    if (value.length <= 6) {
      setJoinCode(value);
    }
  };

  return (
    <Container className="text-center mt-5">
      {/* Logo */}
      <Row className="justify-content-center mb-5">
        <Col xs={10} md={6}>
          <img
            src="/logo.png"
            alt="Liars Dice Logo"
            className="img-fluid rounded"
            style={{ maxHeight: "300px" }}
          />
        </Col>
      </Row>

      {/* Title */}
      <h1 className="mb-5 display-2 fw-bold">Liars Dice</h1>

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
            size="lg"
            variant="primary"
            onClick={handleJoin}
            className="px-5 py-3 fs-3"
            disabled={joinCode.length !== 6} // Disable unless exactly 6 chars
          >
            Join Game
          </Button>
        </Col>
      </Row>

      {/* Create Room */}
      <Row className="justify-content-center">
        <Col xs="auto">
          <Button
            size="lg"
            variant="success"
            onClick={handleCreate}
            className="px-5 py-3 fs-3"
          >
            Create Room
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
