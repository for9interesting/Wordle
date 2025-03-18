import React, { useState, useEffect } from 'react';
import './App.css';
import { WORDS } from './wordlist';

const Lookup: React.FC = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [regexInput, setRegexInput] = useState('');

  // 过滤匹配的单词
  const filterWordsByPatterns = (): string[] => {
    try {
      const regex = new RegExp(regexInput || '^[A-Z]{5}$', 'i');
      return WORDS.filter(word => regex.test(word));
    } catch (error) {
      console.error('Invalid regex:', error);
      return [];
    }
  };

  // 当正则表达式输入改变时更新建议
  useEffect(() => {
    const matchedWords = filterWordsByPatterns();
    setSuggestions(matchedWords);
  }, [regexInput]);

  return (
    <div className="lookup-container">
      <h1 className="lookup-title">Wordle Lookup</h1>
      <div className="lookup-input">
        <input
          type="text"
          value={regexInput}
          onChange={(e) => setRegexInput(e.target.value)}
          placeholder="Enter regex pattern (e.g. ^[A-Z]{5}$)"
          className="regex-input"
        />
      </div>
      <div className="suggestions">
        <h2>Matched Words ({suggestions.length}):</h2>
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

export default Lookup;
