import React from 'react';

interface CallLiarProps {
  currentBet: { count: number; face: number } | null; // Current bid from game state
  onClick: () => void; // Click handler
  disabled?: boolean; // Optional disabled state
}

const CallLiar: React.FC<CallLiarProps> = ({ currentBet, onClick, disabled = false }) => {
  const diceCount = currentBet ? Math.min(currentBet.count, 6) : 0;
  const dieValue = currentBet ? currentBet.face : 1;

  return (
    <div
      style={{
        position: 'relative',
        width: '80vw',
        height: '16.67vh',
        backgroundColor: disabled ? '#ccc' : 'yellow', // Greyed out when disabled
        border: '2px solid #ff0',
        borderRadius: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        boxSizing: 'border-box',
        opacity: disabled ? 0.6 : 1, // Reduce opacity when disabled
      }}
      onClick={!disabled ? onClick : undefined} // Disable click when disabled
    >
      <span style={{ fontSize: '24px', marginRight: '20px', fontWeight: 'bold' }}>Call Liar</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {Array.from({ length: diceCount }, (_, index) => (
          <img
            key={index}
            src={`/die${dieValue}.png`}
            alt={`Die ${dieValue}`}
            style={{ width: '50px', height: '50px', marginRight: '5px' }}
          />
        ))}
      </div>
    </div>
  );
};

export default CallLiar;