import React from 'react';

interface Player {
  id: number;
  name: string;
  diceCount: number;
  isSelf: boolean;
  hasLost: boolean;
}

interface PlayerRowProps {
  player: Player;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player }) => {
  return (
    <div
      className="player-row"
      style={{
        marginBottom: '10px',
        padding: '5px',
        border: '1px solid #ddd',
        borderRadius: '4px',
      }}
    >
      <span>{player.name}</span> - <span>{player.diceCount} dice{player.hasLost && ' (Lost)'}</span>
    </div>
  );
};

export default PlayerRow;