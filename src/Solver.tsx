import React, { useEffect, useState } from 'react';
import './App.css';
import { LetterState } from './types';
import { WORDS } from './wordlist';

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
      style={{ 
        backgroundColor: getBackgroundColor(),
        color: state === 'absent' ? '#ffffff' : '#ffffff'
      }}
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
  const [currentStates, setCurrentStates] = useState<LetterState[]>(Array(5).fill('absent'));
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [possibleWords, setPossibleWords] = useState<string[]>([]);

  useEffect(() => {
    setPossibleWords(WORDS);
  }, []);

  const handleSquareClick = (index: number) => {
    const newStates = [...currentStates];
    while (newStates.length <= index) {
      newStates.push('absent');
    }
    
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
        newStates[index] = 'present';
    }
    setCurrentStates(newStates);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentWord.length === 5) {
      const newGuess: Guess = {
        word: currentWord,
        states: [...currentStates],
      };
      setGuesses([...guesses, newGuess]);
      setCurrentWord('');
      setCurrentStates(Array(5).fill('absent'));
      // TODO: 调用你的词库筛选函数
      const newPossibleWords = filterPossibleWords(newGuess, possibleWords);
      setPossibleWords(newPossibleWords);
      setSuggestions(newPossibleWords);
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
        <h2>Suggested Words</h2>
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

function filterPossibleWords(newGuess: Guess, possibleWords: string[]) {
  console.log(newGuess);

  const newGuessWord = newGuess.word;
  const newGuessStates = newGuess.states.map((s, i) => ({ state: s, idx: i }));

  console.log(newGuessWord, newGuessStates);

  const correctLetters = newGuessStates.filter(s => s.state === 'correct').map(s => newGuessWord[s.idx]);
  const presentLetters = newGuessStates.filter(s => s.state === 'present').map(s => newGuessWord[s.idx])
                                       .filter(letter => !correctLetters.includes(letter));  
  const absentLetters = newGuessStates.filter(s => s.state === 'absent').map(s => newGuessWord[s.idx])
                                      .filter(letter => !presentLetters.includes(letter))
                                      .filter(letter => !correctLetters.includes(letter));
  console.log(correctLetters, presentLetters, absentLetters);

  const newPossibleWords = possibleWords.filter(word => !absentLetters.some(letter => word.includes(letter)))
                                        .filter(word => presentLetters.every(letter => word.includes(letter)))
                                        .filter(word => word.split('').every((letter, i) => !presentLetters.includes(letter) || letter !== newGuessWord[i]))
                                        .filter(word => word.split('').every((letter, i) => newGuessStates[i].state !== 'correct' || letter === newGuessWord[i]));

  return sortPossibleWords(newPossibleWords);
}

function sortPossibleWords(possibleWords: string[]) {
  const guessPossibleResults = possibleWords.map(word => {
    return possibleWords.map(ans => simpleLetterStates(word, ans))
  });
  
  const calculateScore = (scores: number[]) => {
    const freqMap = new Map<number, number>();
    scores.forEach(num => freqMap.set(num, (freqMap.get(num) || 0) + 1));
    const total = scores.length;
    let totalScore = 0;
    freqMap.forEach((count) => {
        const p_i = count / total;
        totalScore -= p_i * Math.log2(p_i);
    });
    return totalScore;
  }

  const scores = guessPossibleResults.map(calculateScore);
  const zippedScore = scores.map((score, index) => ({ score, word: possibleWords[index] }));
  const sortedScores = zippedScore.sort((a, b) => b.score - a.score); 
  const sortedPossibleWords = sortedScores.map(s => s.word);
  return sortedPossibleWords;
}

function simpleLetterStates(word: string, targetWord: string): number {
    const getLetterState = (letter: string, index: number): LetterState => {
        if (letter === targetWord[index]) return 'correct';
        if (targetWord.includes(letter)) return 'present';
        return 'absent';
    };
    const states = Array(5).fill(null).map((_, i) => 
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

  return states.map(s => {
    switch (s) {
      case 'correct':
        return 2 * 2;
      case 'present':
        return 2;
      case 'absent':
        return 1;
      default:
        return 0;
    }
  }).reduce((a, b) => a + b, 0);
};