import React, { useState, useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';
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
  const { roomId, uuid } = useParams<{ roomId: string, uuid: string }>();
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [id, setId] = useState<number>(6);
  const [playerName, setPlayerName] = useState<string>('');
  const [nameEntered, setNameEntered] = useState<boolean>(false);
  const [bidCount, setBidCount] = useState<number>(1);
  const [bidFace, setBidFace] = useState<number>(1);
  const [bidError, setBidError] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [dice, setDice] = useState<number[]>([]);


  useEffect(() => {

    if (!roomId) {
      setError('Missing roomId');
      return;
    }

    const socket = io('http://localhost:3001');
    setSocket(socket);

    socket.on('connect', () => {
      console.log("Connected to Server");
      socket.emit('initializeGame', { roomId, uuid }, (response: { error?: string }) => {
        if (response.error) {
          setError(response.error);
        }
      });
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
  }, [roomId, uuid]);

  const handleSubmitName = (name: string) => {
    if (!socket) {
      setError('No socket connection');
      return;
    }
    if (!name.trim()) {
      setError('Player name is required');
      return;
    }
    console.log('Name Submitted:', name);
    setPlayerName(name);
    socket.emit('nameEntered', { roomId, playerName: name }, (response: { error?: string; gameId?: number }) => {
      console.log('nameEntered response:', response);
      if (response.error) {
        setError(response.error);
      } else if (response.gameId !== undefined) {
        setId(response.gameId);
        setNameEntered(true);
      }
    });
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
  
  const handleDebug = () => {
    if (!socket) return;
    socket.emit('initializeGame', { roomId, uuid });

  }

  if (error) return <div>Error: {error}</div>;
  if (!gameState) return <div>Loading players...</div>;

  return (
    <Container>
      <Button
        variant="primary"
        size="lg"
        onClick={handleDebug}
      >
        Debug
      </Button>
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