import React, { useState } from 'react';
import './App.css';
import { DictionaryCard } from './App';

const Dict: React.FC = () => {
  const [word, setWord] = useState<string>('');
  const [showCard, setShowCard] = useState(false);

  const handleDict = () => {
    setShowCard(false);
    setTimeout(() => setShowCard(true), 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDict();
    }
  };

  return (
    <div className="dict-container">
      <h1 className="dict-title">Wordle Dictionary 📚</h1>
      <div className="dict-input">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a word..."
          maxLength={15}
        />
        <button onClick={handleDict}>Search</button>
      </div>
      <div className="dict-result">
        {showCard && <DictionaryCard word={word} />}
      </div>
    </div>
  );
};

export default Dict; 