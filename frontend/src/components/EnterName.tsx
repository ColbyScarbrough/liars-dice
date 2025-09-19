import React, { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { Socket } from 'socket.io-client';

interface EnterNameProps {
  roomId: string | undefined;
  playerName: string;
  socket: Socket | null;
  handleSubmit: (name: string) => void;
}

const EnterName: React.FC<EnterNameProps> = ({
  roomId,
  socket,
  handleSubmit,
}) => {
  const [inputName, setInputName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
    setInputName(value);
    setError(null);
  };

  const onSubmit = () => {
    if (inputName.trim().length < 1) {
      setError("Please enter a valid name");
      return;
    }
    if (!socket) {
      setError("No connection to server");
      return;
    }
    handleSubmit(inputName);
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
            value={inputName}
            onChange={handleNameChange}
            className="text-center fs-3 p-3"
            maxLength={12}
          />
        </Col>
      </Row>
      {error && (
        <Row className="justify-content-center mb-4">
          <Col xs={12} md={10} lg={10}>
            <small className="text-danger">{error}</small>
          </Col>
        </Row>
      )}
      <Row className="justify-content-center">
        <Col xs="auto">
          <Button
            variant="primary"
            size="lg"
            onClick={onSubmit}
            disabled={inputName.trim().length < 1}
          >
            Continue
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default EnterName;