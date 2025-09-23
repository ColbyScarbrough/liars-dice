import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';

export default function Home() {
  const [roomId, setJoinCode] = useState("");
  const navigate = useNavigate();
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    setJoinCode(value.toUpperCase());
  };

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('roomCreated', ({ roomId, uuid }: { roomId: string, uuid: string }) => {
      console.log('Room created:', roomId);
      navigate(`/game/${roomId}/${uuid}`);
    });

    newSocket.on('joinedGame', ({ roomId, uuid }: { roomId: string, uuid: string }) => {
      console.log('Joined room ' + roomId);
      navigate(`/game/${roomId}/${uuid}`);
    });

    newSocket.on('errorMessage', (message: string) => {
      console.log('Error:', message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  const handleCreate = () => {
    if (!socket) return;
    socket.emit('createRoom');
  };

  const handleJoin = () => {
    if (!socket) return;
    console.log('join game triggered')
    socket.emit('joinGame', { roomId: roomId });
  };

  const handleDebug = () => {
    if (!socket) return;
    socket.emit('debug', { roomId: roomId });
  }

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
            value={roomId}
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
            disabled={roomId.length !== 6}
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
          <Button
            variant="primary"
            size="lg"
            onClick={handleDebug}
          >
            Debug
          </Button>
        </Col>
      </Row>
    </Container>
  );
}