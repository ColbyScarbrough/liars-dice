import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

import GameControls from '../components/GameControls';
import GameInfo from '../components/GameInfo';
import EnterName from '../components/EnterName';
import ConnectedPlayers from '../components/ConnectedPlayers';
import CurrentPlayerAndBid from '../components/CurrentPlayerAndBid';

// Import dice images
import dies from '../assets/dice-shield.png';
import die1 from '../assets/dice-six-faces-one.png';
import die2 from '../assets/dice-six-faces-two.png';
import die3 from '../assets/dice-six-faces-three.png';
import die4 from '../assets/dice-six-faces-four.png';
import die5 from '../assets/dice-six-faces-five.png';
import die6 from '../assets/dice-six-faces-six.png';


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
  const [winner, setWinner] = useState<string | null>(null);
  const [id, setId] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [nameEntered, setNameEntered] = useState<boolean>(false);
  const [bidCount, setBidCount] = useState<number>(1);
  const [bidFace, setBidFace] = useState<number>(1);
  const [bidError, setBidError] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [dice, setDice] = useState<number[]>([]);

  // Array of dice images for easy mapping
  const diceImages = [die1, die2, die3, die4, die5, die6];

  useEffect(() => {
    if (!roomId) {
      setError('Missing roomId');
      return;
    }

    const socket = io('http://localhost:3001');
    setSocket(socket);

    socket.on('connect', () => {
      console.log("Connected to Server");
      socket.emit('initializeGame', { roomId, uuid }, (response: { error?: string, id?: number }) => {
        if (response.error) {
          setError(response.error);
        }
      });
    }) 

    socket.on('gameStarted', ({ state }: { state: GameState }) => {
      console.log('Game started:', state);
      setGameState(state);
      setWinner(null);
      setError(null);
      setBidError(null);
    });

    socket.on('gameOver', (winner: string) => {
      setWinner(winner);
    })

    socket.on('gameState', (state: GameState) => {
      console.log('Received game state:', state);
      setGameState(state);
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

  useEffect(() => {
    if (!socket || id === null) return;

    const handleNewTurn = () => {
      console.log(`New turn, fetching dice for player ID: ${id}`);
      socket.emit('getDice', { roomId, playerId: id }, (response: { error?: string; dice?: number[] }) => {
        if (response.error) {
          console.log(`getDice error: ${response.error}`);
          setError(response.error);
        } else if (response.dice !== undefined) {
          console.log(`Received dice for player ${id}: ${response.dice}`);
          setDice(response.dice);
        }
      });
    };

    socket.on('newTurn', handleNewTurn);

    return () => {
      socket.off('newTurn', handleNewTurn);
    };
  }, [socket, id, roomId]);

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
    socket.emit('nameEntered', { roomId, uuid, playerName: name }, (response: { error?: string; gameId?: number }) => {
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
    console.log(id);
    socket.emit('getDice', { roomId, playerId: id }, (response: { error?: string, dice?: number[] }) => {
      if (response.error) {
        setError(response.error);
      } else if (response.dice !== undefined) setDice(response.dice);
    });
  }

  if (error) return <div>Error: {error}</div>;
  if (!gameState) return <div>Loading players...</div>;

  return (
    <Container className='game-page'>
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
        <div className='game-info'>
          <GameInfo
            gameState={gameState}
            id={id}
            playerName={playerName}
            onStartGameClick={handleStartGameClick}
          />
        </div>
      )}
      <div className='game'>
        <ConnectedPlayers gameState={gameState} />
        <CurrentPlayerAndBid gameState={gameState} />

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
        {winner && !gameState.started && (
          <p>{winner}</p>
        )}
        { nameEntered && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            {!gameState.started ? (
              <img
                src={dies}
                alt="Dice Shield"
                style={{ width: '50px', height: '50px' }}
              />
            ) : (
              dice.map((dieValue, index) => (
                <img
                  key={index}
                  src={diceImages[dieValue - 1]}
                  alt={`Die ${dieValue}`}
                  style={{ width: '50px', height: '50px' }}
                />
              ))
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

export default GamePage;