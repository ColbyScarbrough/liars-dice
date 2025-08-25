import React, { useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';

interface DigitCounterProps {
  initialValue?: number; 
}

const DigitCounter: React.FC<DigitCounterProps> = ({ initialValue = 1 }) => {
  const [value, setValue] = useState(Math.max(1, Math.min(6, initialValue))); 
  const handleUp = () => {
    setValue(prev => Math.min(prev + 1, 6));
  };

  const handleDown = () => {
    setValue(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="digit-counter" style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1 style={{ fontSize: '48px', margin: '0' }}>{value}</h1>
      <Row className="mt-2">
        <Col>
          <Button variant="primary" onClick={handleUp}>Up</Button>
        </Col>
        <Col>
          <Button variant="primary" onClick={handleDown}>Down</Button>
        </Col>
      </Row>
    </div>
  );
};

export default DigitCounter;