import React, { useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';

interface DigitCounterProps {
  initialValue?: number; // Optional initial value, defaults to 1
  onChange?: (value: number) => void; // Callback for value changes
}

const DigitCounter: React.FC<DigitCounterProps> = ({ initialValue = 1, onChange }) => {
  const [value, setValue] = useState(Math.max(1, Math.min(6, initialValue))); // Clamp between 1 and 6

  const handleUp = () => {
    const newValue = Math.min(value + 1, 6);
    setValue(newValue);
    if (onChange) onChange(newValue);
  };

  const handleDown = () => {
    const newValue = Math.max(value - 1, 1);
    setValue(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <div className="digit-counter" style={{ textAlign: 'center', marginTop: '20px', display: 'inline-block', marginRight: '20px' }}>
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