import React, { useState } from 'react';
import './App.css';

const Solver: React.FC = () => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<string[]>([]);

  const handleSolve = () => {
    setResult(['Solving logic will be implemented here']);
  };

  return (
    <div className="solver-container">
      <h1>Wordle Solver</h1>
      <div className="solver-input">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Enter your word..."
          maxLength={5}
        />
        <button onClick={handleSolve}>Solve</button>
      </div>
      <div className="solver-result">
        {result.map((item, index) => (
          <div key={index} className="result-item">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Solver; 