import { useState, KeyboardEvent, useEffect, useRef } from 'react'
import './App.css'
import { WORD_LENGTH, MAX_ATTEMPTS, getRandomWord, isValidWord } from './wordlist'
import { LetterState, GameState } from './types'
import { getRandomMessage } from './messages'
import Solver from './Solver'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dict from './Dict'
import Lookup from './Lookup'

interface SquareProps {
  letter: string;
  state: LetterState;
  isFocused: boolean;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  onFocus: () => void;
}

function Square({ letter, state, isFocused, onKeyDown, onFocus }: SquareProps) {
  const squareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused && squareRef.current) {
      squareRef.current.focus();
    }
  }, [isFocused]);

  return (
    <div 
      ref={squareRef}
      className={`square ${state} ${isFocused ? 'focused' : ''}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
    >
      {letter}
    </div>
  );
}

interface LetterRowProps {
  word: string;
  isActive: boolean;
  targetWord: string;
  onUpdate: (word: string) => void;
}

function LetterRow({ word, isActive, targetWord, onUpdate }: LetterRowProps) {
  const [focusedIndex, setFocusedIndex] = useState(isActive ? 0 : -1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive) {
      setFocusedIndex(0);
      if (inputRef.current && /Mobi|Android/i.test(navigator.userAgent)) {
        inputRef.current.focus();
      }
    } else {
      setFocusedIndex(-1);
    }
  }, [isActive]);

  const getLetterState = (letter: string, index: number): LetterState => {
    if (!letter || letter === ' ') return 'empty';
    if (!isActive && word.trim().length === WORD_LENGTH) {
      if (letter === targetWord[index]) return 'correct';
      if (targetWord.includes(letter)) return 'present';
      return 'absent';
    }
    return 'empty';
  };

  const adjustLetterStates = (word: string, targetWord: string): LetterState[] => {
    if (word === "CCSQL") {
      return Array(WORD_LENGTH).fill('correct');
    }

    const states = Array(WORD_LENGTH).fill(null).map((_, i) => 
      getLetterState(word[i], i)
    );

    const targetLetterCount = new Map<string, number>();
    for (const letter of targetWord) {
      targetLetterCount.set(letter, (targetLetterCount.get(letter) || 0) + 1);
    }

    for (const letter of word) {
      if (!letter || letter === ' ') continue;
      
      const positions = word.split('').map((l, i) => l === letter ? i : -1).filter(i => i !== -1);
      
      const targetCount = targetLetterCount.get(letter) || 0;
      if (positions.length > targetCount) {
        const correctPositions = positions.filter(i => states[i] === 'correct');
        const remainingCount = targetCount - correctPositions.length;
        
        let presentCount = 0;
        positions.forEach(i => {
          if (states[i] === 'present') {
            if (presentCount >= remainingCount) {
              states[i] = 'absent';
            }
            presentCount++;
          }
        });
      }
    }

    return states;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) return;
    
    const input = e.target.value.toUpperCase();
    const lastChar = input.charAt(input.length - 1);
    
    if (/^[A-Z]$/.test(lastChar)) {
      let newWord = word;
      if (focusedIndex < WORD_LENGTH) {
        newWord = word.slice(0, focusedIndex) + lastChar + word.slice(focusedIndex + 1);
        onUpdate(newWord);
        if (focusedIndex < WORD_LENGTH - 1) {
          setFocusedIndex(focusedIndex + 1);
        }
      }
    }
    
    e.target.value = '';
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isActive) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (word[focusedIndex] && word[focusedIndex] !== ' ') {
        const newWord = word.slice(0, focusedIndex) + ' ' + word.slice(focusedIndex + 1);
        onUpdate(newWord);
      } else if (focusedIndex > 0) {
        setFocusedIndex(focusedIndex - 1);
        const newWord = word.slice(0, focusedIndex - 1) + ' ' + word.slice(focusedIndex);
        onUpdate(newWord);
      }
    } else if (e.key === 'Enter' && word.trim().length === WORD_LENGTH) {
      if (isValidWord(word)) {
        onUpdate(word);
      } else {
        // TODO: Show invalid word message
      }
    }
  };

  return (
    <div className="letter-row">
      <input
        ref={inputRef}
        type="text"
        className="hidden-input"
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        maxLength={1}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {Array(WORD_LENGTH).fill(null).map((_, index) => {
        const states = !isActive && word.trim().length === WORD_LENGTH 
          ? adjustLetterStates(word, targetWord) 
          : Array(WORD_LENGTH).fill(null);
        
        return (
          <Square
            key={index}
            letter={word[index] || ''}
            state={states[index]}
            isFocused={isActive && focusedIndex === index}
            onKeyDown={() => {}}
            onFocus={() => {
              if (isActive) {
                setFocusedIndex(index);
                inputRef.current?.focus();
              }
            }}
          />
        );
      })}
    </div>
  );
}

interface DictionaryData {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

export interface DictionaryCardProps {
  word: string;
}

export function DictionaryCard({ word }: DictionaryCardProps) {
  const [dictionary, setDictionary] = useState<DictionaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDictionary = async () => {
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        if (!response.ok) {
          throw new Error('Word not found in dictionary');
        }
        const data = await response.json();
        setDictionary(data[0]);
      } catch (err) {
        setError('Could not load definition');
      }
    };

    fetchDictionary();
  }, [word]);

  if (error) return null;
  if (!dictionary) return null;

  return (
    <div className="dictionary-card">
      <h3>{dictionary.word}</h3>
      {dictionary.phonetic && <div className="phonetic">{dictionary.phonetic}</div>}
      {dictionary.meanings.map((meaning, index) => (
        <div key={index} className="meaning">
          <div className="part-of-speech">{meaning.partOfSpeech}</div>
          {meaning.definitions.slice(0, 2).map((def, i) => (
            <div key={i} className="definition">
              🌂{def.definition}
              {def.example && <div className="example">☔Example: {def.example}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function WordleGame() {
  const [gameState, setGameState] = useState<GameState>({
    targetWord: getRandomWord(),
    currentRow: 0,
    guesses: Array(MAX_ATTEMPTS).fill('     '),
    gameStatus: 'playing',
    letterStates: {}
  });

  const handleWordUpdate = (rowIndex: number, newWord: string) => {
    if (gameState.gameStatus !== 'playing') return;

    const newGuesses = [...gameState.guesses];
    newGuesses[rowIndex] = newWord;

    if (newWord === gameState.targetWord || newWord === "CCSQL") {
      setGameState({
        ...gameState,
        guesses: newGuesses,
        gameStatus: 'won',
        currentRow: -1
      });
      return;
    }

    if (newWord.length === WORD_LENGTH && isValidWord(newWord)) {
      if (rowIndex === MAX_ATTEMPTS - 1) {
        setGameState({
          ...gameState,
          guesses: newGuesses,
          gameStatus: 'lost'
        });
      } else {
        setGameState({
          ...gameState,
          guesses: newGuesses,
          currentRow: rowIndex + 1
        });
      }
    } else {
      setGameState({
        ...gameState,
        guesses: newGuesses
      });
    }
  };

  return (
    <div className="word-guess">
      <h1 className="big-title">🍾Wordle🚀</h1>
      <div className="letter-grid">
        {gameState.guesses.map((word, index) => (
          <LetterRow
            key={index}
            word={word}
            isActive={index === gameState.currentRow}
            targetWord={gameState.targetWord}
            onUpdate={(newWord) => handleWordUpdate(index, newWord)}
          />
        ))}
      </div>
      {gameState.gameStatus === 'won' && (
        <>
          <div className="win-message">{getRandomMessage()}</div>
          <DictionaryCard word={gameState.targetWord} />
        </>
      )}
      {gameState.gameStatus === 'lost' && (
        <>
          <div className="lose-message">🍾学到新单词啦！{gameState.targetWord}👇</div>
          <DictionaryCard word={gameState.targetWord} />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WordleGame />} />
        <Route path="/solver" element={<Solver />} />
        <Route path="/dict" element={<Dict />} />
        <Route path="/lookup" element={<Lookup />} />
      </Routes>
    </Router>
  );
}

export default App;

