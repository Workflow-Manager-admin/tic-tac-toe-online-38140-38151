import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Color palette
 * Accent: #f44336
 * Primary: #1976d2
 * Secondary: #ff9800
 * Light/minimalistic theme
 */

// Square component for the board cells
const Square = ({ value, onClick, isWinning, disabled }) => (
  <button
    className={`ttt-square${isWinning ? ' ttt-square--winner' : ''}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={value ? `Cell ${value}` : 'Empty cell'}
    tabIndex={0}
    style={{
      color: value === "X" ? '#f44336' : value === "O" ? '#1976d2' : '#282c34',
    }}
  >
    {value}
  </button>
);

// Tic Tac Toe Board (3x3 grid)
const Board = ({ squares, onSquareClick, winLine, disabled }) => (
  <div className="ttt-board">
    {squares.map((val, i) => (
      <Square
        key={i}
        value={val}
        onClick={() => onSquareClick(i)}
        isWinning={winLine && winLine.includes(i)}
        disabled={disabled || Boolean(val)}
      />
    ))}
  </div>
);

const PLAYER_MARKS = ["X", "O"];
const MODES = [
  { key: "pvp", label: "Player vs Player" },
  { key: "ai", label: "Player vs AI" }
];

// Calculate the winner and return win line if present
function calculateWinner(squares) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] && 
      squares[a] === squares[b] && 
      squares[a] === squares[c]
    ) return { winner: squares[a], winLine: line };
  }
  if (!squares.includes(null)) return { winner: "Draw", winLine: [] };
  return null;
}

// AI move: naive random for now
function getRandomEmptyIndex(squares) {
  const empties = squares.map((x,i)=> x ? null : i).filter((x)=>x !== null);
  if (empties.length === 0) return null;
  return empties[Math.floor(Math.random() * empties.length)];
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [mode, setMode] = useState("pvp");
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [step, setStep] = useState(0);
  const [isXNext, setIsXNext] = useState(true);
  const [status, setStatus] = useState("");
  const [winLine, setWinLine] = useState(null);

  // Set palette for theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Game winner detection
  useEffect(() => {
    const result = calculateWinner(squares);
    if (result) {
      setStatus(result.winner === "Draw" ? "It's a Draw!" : `Winner: ${result.winner}`);
      setWinLine(result.winLine);
    } else {
      setStatus(`Current: ${isXNext ? 'X' : 'O'}`);
      setWinLine(null);
    }
  }, [squares, isXNext]);

  // AI Move effect for PvAI/AI's turn
  useEffect(() => {
    if (
      mode === "ai" &&
      !winLine &&
      !isXNext // If it's O's turn (AI plays O)
    ) {
      const t = setTimeout(() => {
        const index = getRandomEmptyIndex(squares);
        if (index === null) return;
        handleSquare(index, "O");
      }, 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line
  }, [mode, isXNext, winLine, squares]);

  // Handle square click for user move
  const handleSquare = (i, markOverride) => {
    // If game over or cell occupied, ignore
    if (winLine || squares[i]) return;
    const mark = markOverride || (isXNext ? 'X' : 'O');
    if (mode === 'ai' && !isXNext && !markOverride) return; // AI turn only for itself
    const nextSquares = squares.slice();
    nextSquares[i] = mark;
    setSquares(nextSquares);
    setStep(step + 1);
    setIsXNext(!isXNext);
  };

  // PUBLIC_INTERFACE
  const handleModeChange = (modeKey) => {
    setMode(modeKey);
    handleReset();
  };

  // PUBLIC_INTERFACE
  const handleReset = () => {
    setSquares(Array(9).fill(null));
    setStep(0);
    setIsXNext(true);
    setStatus("Current: X");
    setWinLine(null);
  };

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App" style={{ minHeight: "100vh" }}>
      <header className="ttt-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <h1 className="ttt-title">
          <span role="img" aria-label="Tic Tac Toe" style={{fontSize: "1.3em"}}>❌⭕️</span>
          {" "}
          Tic Tac Toe
        </h1>
        <div className="ttt-mode-switch">
          {MODES.map(({ key, label }) => (
            <button
              key={key}
              className={`ttt-mode-btn${mode === key ? " ttt-mode-btn--active" : ""}`}
              style={{ 
                backgroundColor: mode === key ? "#1976d2" : "#f8f9fa",
                color: mode === key ? "#fff" : "#282c34"
              }}
              onClick={() => handleModeChange(key)}
              aria-pressed={mode === key}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="ttt-status" aria-live="polite">
          {status}
        </div>
      </header>

      <main className="ttt-main-area">
        <Board
          squares={squares}
          onSquareClick={i => handleSquare(i)}
          winLine={winLine}
          disabled={Boolean(winLine)}
        />
        <div className="ttt-controls">
          <button className="ttt-btn-reset" style={{background: "#ff9800", color: "#fff"}} onClick={handleReset}>
            Reset Game
          </button>
        </div>
        <div className="ttt-player-info">
          <span>
            Player X&nbsp;
            <span style={{ color: "#f44336", fontWeight: 'bold', fontSize: '1.2em' }}>X</span>
            {mode === "ai" ? " (You)" : ""}
          </span>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <span>
            Player O&nbsp;
            <span style={{ color: "#1976d2", fontWeight: 'bold', fontSize: '1.1em' }}>O</span>
            {mode === "ai" ? " (AI)" : ""}
          </span>
        </div>
        <div className="ttt-footer-tip" style={{
          marginTop: "2em",
          color: "#ff9800a8",
          fontSize: "0.95em"
        }}>
         {mode === "ai" ? "Try to beat the simple AI! 😃" : "Play against a friend or switch to AI mode."}
        </div>
      </main>
    </div>
  );
}

export default App;
