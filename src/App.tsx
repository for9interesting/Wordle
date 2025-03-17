import { useState, KeyboardEvent, useEffect, useRef } from 'react'
import './App.css'

interface SquareProps {
  letter: string;
  onLetterChange: (letter: string) => void;
  onBackspace: () => void;
  index: number;
  isFocused: boolean;
  onFocus: () => void;
}

function Square({ letter, onLetterChange, onBackspace, index, isFocused, onFocus }: SquareProps) {
  const squareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused && squareRef.current) {
      squareRef.current.focus();
    }
  }, [isFocused]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const key = e.key.toLowerCase();

    if (!isFocused) return;
    
    if (key === 'backspace') {
      onBackspace();
    } else if (/^[a-z]$/.test(key)) {
      onLetterChange(key.toUpperCase());
    }
  };

  return (
    <div 
      ref={squareRef}
      className={`square ${isFocused ? 'focused' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
    >
      {letter}
    </div>
  );
}

function LetterRow() {
  const [letters, setLetters] = useState<string[]>(Array(5).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleLetterChange = (index: number, newLetter: string) => {
    const newLetters = [...letters];
    newLetters[index] = newLetter;
    setLetters(newLetters);
  
    if (index < 4) {
      setFocusedIndex(index + 1);
    }
  };

  const handleBackspace = (index: number) => {
    if (letters[index] === '' && index > 0) {
      setFocusedIndex(index - 1);
    } else {
      const newLetters = [...letters];
      newLetters[index] = '';
      setLetters(newLetters);
      if (index > 0) {
        setFocusedIndex(index - 1);
      }
    }
  };

  return (
    <div className="letter-row">
      {letters.map((letter, index) => (
        <Square
          key={index}
          letter={letter}
          onLetterChange={(newLetter) => handleLetterChange(index, newLetter)}
          onBackspace={() => handleBackspace(index)}
          index={index}
          isFocused={focusedIndex === index}
          onFocus={() => setFocusedIndex(index)}
        />
      ))}
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <LetterRow />
    </div>
  );
}

export default App;

