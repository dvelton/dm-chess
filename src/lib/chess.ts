// Types
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type PieceColor = 'w' | 'b';
export type Piece = {
  type: PieceType;
  color: PieceColor;
};
export type Position = {
  row: number;
  col: number;
};
export type Square = Piece | null;
export type Board = Square[][];
export type GameState = {
  board: Board;
  turn: PieceColor;
  check: boolean;
  checkmate: boolean;
  stalemate: boolean;
  lastMove?: { from: Position; to: Position };
  moveHistory: string[];
  capturedPieces: { w: PieceType[], b: PieceType[] };
};

// Constants
export const INITIAL_BOARD: Board = [
  [{ type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' }, { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }],
  [{ type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [{ type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }],
  [{ type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' }, { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }]
];

export const INITIAL_GAME_STATE: GameState = {
  board: JSON.parse(JSON.stringify(INITIAL_BOARD)),
  turn: 'w',
  check: false,
  checkmate: false,
  stalemate: false,
  moveHistory: [],
  capturedPieces: { w: [], b: [] }
};

// ASCII representation functions
export function boardToAscii(board: Board): string {
  const pieces: Record<PieceType, string> = {
    p: 'p', r: 'r', n: 'n', b: 'b', q: 'q', k: 'k'
  };
  
  let ascii = "  a b c d e f g h\n";
  ascii += " +-+-+-+-+-+-+-+-+\n";

  for (let row = 0; row < 8; row++) {
    ascii += `${8 - row}|`;
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece === null) {
        ascii += ' ';
      } else {
        const pieceChar = pieces[piece.type];
        ascii += piece.color === 'w' ? pieceChar.toUpperCase() : pieceChar;
      }
      ascii += '|';
    }
    ascii += `${8 - row}\n +-+-+-+-+-+-+-+-+\n`;
  }
  ascii += "  a b c d e f g h\n";

  return ascii;
}

export function asciiToBoard(ascii: string): Board | null {
  try {
    const lines = ascii.trim().split("\n");
    
    // Check if the format seems correct
    if (lines.length !== 19) return null;
    
    const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    for (let i = 0; i < 8; i++) {
      const row = lines[2 + i * 2].substring(2).split('|');
      if (row.length !== 9) return null; // 8 cells + the row number
      
      for (let j = 0; j < 8; j++) {
        const cell = row[j + 1].trim();
        if (!cell) continue;
        
        const char = cell.charAt(0);
        if (char === ' ') continue;
        
        const isUpperCase = char === char.toUpperCase();
        const pieceType = char.toLowerCase() as PieceType;
        
        if (!['p', 'r', 'n', 'b', 'q', 'k'].includes(pieceType)) {
          return null; // Invalid piece character
        }
        
        board[i][j] = {
          type: pieceType,
          color: isUpperCase ? 'w' : 'b'
        };
      }
    }
    
    return board;
  } catch (error) {
    console.error("Error parsing ASCII board:", error);
    return null;
  }
}

export function boardToFEN(gameState: GameState): string {
  const { board, turn } = gameState;
  let fen = '';
  
  // Board position
  for (let row = 0; row < 8; row++) {
    let emptyCount = 0;
    
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      
      if (piece === null) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        
        const pieceChar = piece.type;
        fen += piece.color === 'w' ? pieceChar.toUpperCase() : pieceChar;
      }
    }
    
    if (emptyCount > 0) {
      fen += emptyCount;
    }
    
    if (row < 7) {
      fen += '/';
    }
  }
  
  // Active color
  fen += ` ${turn}`;
  
  // For simplicity, we'll use placeholder values for castling, en passant, etc.
  fen += ' KQkq - 0 1';
  
  return fen;
}

export function formatGameState(gameState: GameState): string {
  const asciiBoard = boardToAscii(gameState.board);
  const turn = gameState.turn === 'w' ? 'White' : 'Black';
  const status = gameState.checkmate 
    ? `Checkmate! ${gameState.turn === 'w' ? 'Black' : 'White'} wins.`
    : gameState.check 
      ? `${turn} is in check!` 
      : gameState.stalemate
        ? 'Stalemate!'
        : `${turn}'s turn`;
  
  const fen = boardToFEN(gameState);
  
  return `SLACK-CHESS-GAME\n${asciiBoard}\n${status}\nFEN:${fen}\n`;
}

export function parseGameState(text: string): GameState | null {
  try {
    // Check if this is our game format
    if (!text.includes('SLACK-CHESS-GAME')) {
      return null;
    }
    
    const lines = text.trim().split('\n');
    
    // Extract board ASCII
    let asciiStart = -1;
    let asciiEnd = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === '  a b c d e f g h') {
        asciiStart = i;
        break;
      }
    }
    
    if (asciiStart === -1) return null;
    
    // Find the end of ASCII board (second occurrence of coordinates)
    for (let i = asciiStart + 1; i < lines.length; i++) {
      if (lines[i] === '  a b c d e f g h') {
        asciiEnd = i;
        break;
      }
    }
    
    if (asciiEnd === -1) return null;
    
    const asciiBoard = lines.slice(asciiStart, asciiEnd + 1).join('\n');
    const board = asciiToBoard(asciiBoard);
    
    if (!board) return null;
    
    // Extract FEN if available
    const fenLine = lines.find(line => line.startsWith('FEN:'));
    let turn: PieceColor = 'w';
    
    if (fenLine) {
      const fen = fenLine.substring(4);
      const fenParts = fen.split(' ');
      if (fenParts.length >= 2) {
        turn = fenParts[1] as PieceColor;
      }
    }
    
    // Status line parsing (optional)
    const statusLine = lines[asciiEnd + 1];
    const inCheck = statusLine && statusLine.toLowerCase().includes('check');
    const checkmate = statusLine && statusLine.toLowerCase().includes('checkmate');
    const stalemate = statusLine && statusLine.toLowerCase().includes('stalemate');
    
    return {
      board,
      turn,
      check: inCheck,
      checkmate,
      stalemate,
      moveHistory: [],
      capturedPieces: { w: [], b: [] }
    };
  } catch (error) {
    console.error("Error parsing game state:", error);
    return null;
  }
}

// This is a simplistic move validation for the core piece movements
// A full chess engine would need more complex logic for check detection, etc.
export function isValidMove(gameState: GameState, from: Position, to: Position): boolean {
  const { board, turn } = gameState;
  const piece = board[from.row][from.col];
  
  // Basic validation
  if (!piece || piece.color !== turn) return false;
  
  const targetPiece = board[to.row][to.col];
  if (targetPiece && targetPiece.color === turn) return false;
  
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  
  // Simple movement validation per piece type
  switch (piece.type) {
    case 'p': // Pawn
      const direction = piece.color === 'w' ? -1 : 1;
      const startRow = piece.color === 'w' ? 6 : 1;
      
      // Regular move
      if (colDiff === 0 && to.row === from.row + direction && !targetPiece) {
        return true;
      }
      
      // Double move from start
      if (colDiff === 0 && from.row === startRow && 
          to.row === from.row + 2 * direction && 
          !board[from.row + direction][from.col] &&
          !targetPiece) {
        return true;
      }
      
      // Capture
      if (colDiff === 1 && to.row === from.row + direction && targetPiece) {
        return true;
      }
      
      return false;
      
    case 'r': // Rook
      if (rowDiff === 0 || colDiff === 0) {
        // Check for pieces in the way
        const rowStep = rowDiff === 0 ? 0 : (to.row > from.row ? 1 : -1);
        const colStep = colDiff === 0 ? 0 : (to.col > from.col ? 1 : -1);
        
        let currentRow = from.row + rowStep;
        let currentCol = from.col + colStep;
        
        while (currentRow !== to.row || currentCol !== to.col) {
          if (board[currentRow][currentCol]) return false;
          currentRow += rowStep;
          currentCol += colStep;
        }
        
        return true;
      }
      return false;
      
    case 'n': // Knight
      return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      
    case 'b': // Bishop
      if (rowDiff === colDiff) {
        // Check for pieces in the way
        const rowStep = to.row > from.row ? 1 : -1;
        const colStep = to.col > from.col ? 1 : -1;
        
        let currentRow = from.row + rowStep;
        let currentCol = from.col + colStep;
        
        while (currentRow !== to.row) {
          if (board[currentRow][currentCol]) return false;
          currentRow += rowStep;
          currentCol += colStep;
        }
        
        return true;
      }
      return false;
      
    case 'q': // Queen (combination of rook and bishop)
      if (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) {
        // Check for pieces in the way
        const rowStep = rowDiff === 0 ? 0 : (to.row > from.row ? 1 : -1);
        const colStep = colDiff === 0 ? 0 : (to.col > from.col ? 1 : -1);
        
        let currentRow = from.row + rowStep;
        let currentCol = from.col + colStep;
        
        while (currentRow !== to.row || currentCol !== to.col) {
          if (board[currentRow][currentCol]) return false;
          currentRow += rowStep;
          currentCol += colStep;
        }
        
        return true;
      }
      return false;
      
    case 'k': // King
      return rowDiff <= 1 && colDiff <= 1;
      
    default:
      return false;
  }
}

// Make a move and return the new game state
export function makeMove(gameState: GameState, from: Position, to: Position): GameState {
  // Clone the current state to avoid mutation
  const newState: GameState = JSON.parse(JSON.stringify(gameState));
  const { board } = newState;
  
  const piece = board[from.row][from.col];
  const targetPiece = board[to.row][to.col];
  
  // Record capture if there is one
  if (targetPiece) {
    newState.capturedPieces[targetPiece.color].push(targetPiece.type);
  }
  
  // Move the piece
  board[to.row][to.col] = piece;
  board[from.row][from.col] = null;
  
  // Handle pawn promotion (always to queen for simplicity)
  if (piece.type === 'p') {
    if ((piece.color === 'w' && to.row === 0) || (piece.color === 'b' && to.row === 7)) {
      board[to.row][to.col] = { type: 'q', color: piece.color };
    }
  }
  
  // Record the move
  const colNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const fromNotation = `${colNames[from.col]}${8 - from.row}`;
  const toNotation = `${colNames[to.col]}${8 - to.row}`;
  newState.moveHistory.push(`${fromNotation}-${toNotation}`);
  
  // Update last move for highlighting
  newState.lastMove = { from, to };
  
  // Switch turns
  newState.turn = newState.turn === 'w' ? 'b' : 'w';
  
  // For simplicity, we're not implementing full check/checkmate detection
  // In a complete implementation, you would analyze the board here
  newState.check = false;
  newState.checkmate = false;
  
  return newState;
}

// Convert algebraic notation to board position
export function notationToPosition(notation: string): Position | null {
  if (notation.length !== 2) return null;
  
  const col = notation.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(notation.charAt(1));
  
  if (col < 0 || col > 7 || row < 0 || row > 7) return null;
  
  return { row, col };
}