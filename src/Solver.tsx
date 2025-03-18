import React, { useState } from 'react';
import './App.css';
import { LetterState } from './types';

interface SquareProps {
  letter: string;
  state: LetterState;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ letter, state, onClick }) => {
  const getBackgroundColor = () => {
    switch (state) {
      case 'correct':
        return '#6aaa64';
      case 'present':
        return '#c9b458';
      case 'absent':
        return '#787c7e';
      default:
        return '#ffffff';
    }
  };

  return (
    <div
      className="square"
      style={{ backgroundColor: getBackgroundColor() }}
      onClick={onClick}
    >
      {letter}
    </div>
  );
};

interface RowProps {
  word: string;
  states: LetterState[];
  onSquareClick: (index: number) => void;
  isActive: boolean;
}

const Row: React.FC<RowProps> = ({ word, states, onSquareClick, isActive }) => {
  return (
    <div className="letter-row">
      {Array.from({ length: 5 }).map((_, i) => (
        <Square
          key={i}
          letter={word[i] || ''}
          state={states[i] || 'absent'}
          onClick={() => isActive && onSquareClick(i)}
        />
      ))}
    </div>
  );
};

interface Guess {
  word: string;
  states: LetterState[];
}

const Solver: React.FC = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [currentStates, setCurrentStates] = useState<LetterState[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSquareClick = (index: number) => {
    if (currentStates.length <= index) {
      setCurrentStates([...currentStates, 'absent']);
    } else {
      const newStates = [...currentStates];
      const currentState = newStates[index];
      switch (currentState) {
        case 'absent':
          newStates[index] = 'present';
          break;
        case 'present':
          newStates[index] = 'correct';
          break;
        case 'correct':
          newStates[index] = 'absent';
          break;
        default:
          newStates[index] = 'absent';
      }
      setCurrentStates(newStates);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentWord.length === 5) {
      const newGuess: Guess = {
        word: currentWord,
        states: [...currentStates],
      };
      setGuesses([...guesses, newGuess]);
      setCurrentWord('');
      setCurrentStates([]);
      // TODO: 调用你的词库筛选函数
      // const possibleWords = filterPossibleWords(guesses);
      // setSuggestions(possibleWords);
    }
  };

  return (
    <div className="solver-container">
      <h1 className="solver-title">Wordle Solver</h1>
      <div className="letter-grid">
        {guesses.map((guess, index) => (
          <Row
            key={index}
            word={guess.word}
            states={guess.states}
            onSquareClick={() => {}}
            isActive={false}
          />
        ))}
        <Row
          word={currentWord}
          states={currentStates}
          onSquareClick={handleSquareClick}
          isActive={true}
        />
      </div>
      <div className="solver-input">
        <input
          type="text"
          value={currentWord}
          onChange={(e) => setCurrentWord(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          placeholder="Enter a word..."
          maxLength={5}
        />
      </div>
      <div className="suggestions">
        <h2>Suggested Words:</h2>
        <div className="suggestion-list">
          {suggestions.map((word, index) => (
            <div key={index} className="suggestion-item">
              {word}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Solver; 