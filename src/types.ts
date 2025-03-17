export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export interface LetterResult {
    letter: string;
    state: LetterState;
}

export interface GameState {
    targetWord: string;
    currentRow: number;
    guesses: string[];
    gameStatus: 'playing' | 'won' | 'lost';
    letterStates: { [key: string]: LetterState };
} 