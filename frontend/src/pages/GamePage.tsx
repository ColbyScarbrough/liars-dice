import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

import GameControls from '../components/GameControls';
import GameInfo from '../components/GameInfo';
import EnterName from '../components/EnterName';


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

const GamePage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [nameEntered, setNameEntered] = useState<boolean>(false);
  const [bidCount, setBidCount] = useState<number>(1);
  const [bidFace, setBidFace] = useState<number>(1);
  const [bidError, setBidError] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [dice, setDice] = useState<number[]>([]);

  const id = gameState?.players.find(p => p.isSelf)?.id ?? 'Loading...';

  useEffect(() => {

    if (!roomId) {
      setError('Missing roomId');
      return;
    }

    const socket = io('http://localhost:3001');
    setSocket(socket);

    socket.on('connect', () => {
      console.log("Connected to Server");
      console.log(roomId);
      socket.emit('initializeGame', { roomId });
    }) 

    socket.on('gameStarted', ({ state }: { state: GameState }) => {
      console.log('Game started:', state);
      setGameState(state);
      setError(null);
      setBidError(null);
    });

    socket.on('gameState', (state: GameState) => {
      console.log('Received game state:', state);
      setGameState(state);
    });

    socket.on('newTurn', () => {
      if (id !== 'Loading...') {
        socket.emit('getDice', { roomId, playerId: id }, (response: { dice?: number[]; error?: string }) => {
          if (response.error) {
            setError(response.error);
          } else if (response.dice) {
            setDice(response.dice);
          }
        });
      }
    });

    socket.on('errorMessage', (message: string) => {
      console.log('Error:', message);
      setError(message);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, id]);

  const handleSubmitName = (name: string) => {
    if (!name.trim()) {
      setError('Player name is required');
      return;
    }
    console.log('Name Submitted:', name);
    setPlayerName(name);
    socket?.emit('nameEntered', { roomId, playerName: name });
    setNameEntered(true);
  };

  const handleStartGameClick = () => {
    console.log('Start Game clicked');
    if (roomId && id === 0 && socket) {
      socket.emit('startGame', { roomId }, (response: { state?: GameState; error?: string }) => {
        if (response.error) {
          setError(response.error);
        }
      });
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!gameState) return <div>Loading players...</div>;

  return (
    <Container>
      {!nameEntered && (
        <EnterName
          roomId={roomId}
          playerName={playerName}
          socket={socket}
          setPlayerName={setPlayerName}
          handleSubmit={handleSubmitName}
        />
      )}
      {nameEntered && (
        <GameInfo
          gameState={gameState}
          id={id}
          playerName={playerName}
          dice={dice}
          onStartGameClick={handleStartGameClick}
        />
      )}
      {gameState.started && nameEntered && (
        <GameControls
          gameState={gameState}
          id={id}
          roomId={roomId}
          socket={socket}
          bidCount={bidCount}
          bidFace={bidFace}
          setBidCount={setBidCount}
          setBidFace={setBidFace}
          bidError={bidError}
          setBidError={setBidError}
          callError={callError}
          setCallError={setCallError}
        />
      )}
    </Container>
  );
};

export default GamePage;