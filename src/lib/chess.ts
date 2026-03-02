import { Chess, type Square as ChessSquare, type PieceSymbol, type Color } from 'chess.js';

// Types — kept compatible with existing component interfaces
export type PieceType = PieceSymbol;
export type PieceColor = Color;
export type Piece = { type: PieceType; color: PieceColor };
export type Position = { row: number; col: number };
export type Square = Piece | null;
export type Board = Square[][];
export type GameState = {
  board: Board;
  turn: PieceColor;
  check: boolean;
  checkmate: boolean;
  stalemate: boolean;
  isDraw: boolean;
  lastMove?: { from: Position; to: Position };
  moveHistory: string[];       // SAN moves (e.g. "Nf3", "exd5")
  capturedPieces: { w: PieceType[]; b: PieceType[] };
  fen: string;                 // canonical FEN for serialization
  pgn: string;                 // PGN string
};

// Helper: convert chess.js square name ("e4") to row/col
function squareToPos(sq: ChessSquare): Position {
  return { row: 8 - parseInt(sq[1]), col: sq.charCodeAt(0) - 97 };
}

// Helper: convert row/col to chess.js square name
function posToSquare(pos: Position): ChessSquare {
  return (String.fromCharCode(97 + pos.col) + (8 - pos.row)) as ChessSquare;
}

// Build a GameState from a Chess instance
function chessToGameState(chess: Chess, prevCaptured?: { w: PieceType[]; b: PieceType[] }): GameState {
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const sq = posToSquare({ row, col });
      const p = chess.get(sq);
      if (p) board[row][col] = { type: p.type, color: p.color };
    }
  }

  const history = chess.history({ verbose: true });
  const sanHistory = chess.history();
  const lastVerbose = history.length > 0 ? history[history.length - 1] : null;

  // Compute captured pieces from full history
  const captured: { w: PieceType[]; b: PieceType[] } = prevCaptured
    ? structuredClone(prevCaptured)
    : { w: [], b: [] };
  if (!prevCaptured) {
    for (const move of history) {
      if (move.captured) {
        // The captured piece's color is the opponent of the moving player
        const capturedColor: PieceColor = move.color === 'w' ? 'b' : 'w';
        captured[capturedColor].push(move.captured);
      }
    }
  }

  return {
    board,
    turn: chess.turn(),
    check: chess.isCheck(),
    checkmate: chess.isCheckmate(),
    stalemate: chess.isStalemate(),
    isDraw: chess.isDraw(),
    lastMove: lastVerbose
      ? { from: squareToPos(lastVerbose.from as ChessSquare), to: squareToPos(lastVerbose.to as ChessSquare) }
      : undefined,
    moveHistory: sanHistory,
    capturedPieces: captured,
    fen: chess.fen(),
    pgn: chess.pgn(),
  };
}

// Create a fresh initial game state
export function createInitialGameState(): GameState {
  return chessToGameState(new Chess());
}

export const INITIAL_GAME_STATE: GameState = createInitialGameState();

// Create a Chess instance from a GameState (for move validation, etc.)
export function gameStateToChess(state: GameState): Chess {
  const chess = new Chess();
  // Replay all SAN moves to reconstruct full state (castling rights, en passant, etc.)
  for (const san of state.moveHistory) {
    chess.move(san);
  }
  return chess;
}

// ASCII representation (for Slack sharing)
export function boardToAscii(board: Board): string {
  let ascii = "  a b c d e f g h\n";
  ascii += " +-+-+-+-+-+-+-+-+\n";
  for (let row = 0; row < 8; row++) {
    ascii += `${8 - row}|`;
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) {
        ascii += ' ';
      } else {
        const ch = piece.type;
        ascii += piece.color === 'w' ? ch.toUpperCase() : ch;
      }
      ascii += '|';
    }
    ascii += `${8 - row}\n +-+-+-+-+-+-+-+-+\n`;
  }
  ascii += "  a b c d e f g h\n";
  return ascii;
}

export function formatGameState(gameState: GameState): string {
  const asciiBoard = boardToAscii(gameState.board);
  const turn = gameState.turn === 'w' ? 'White' : 'Black';
  const status = gameState.checkmate
    ? `Checkmate! ${gameState.turn === 'w' ? 'Black' : 'White'} wins.`
    : gameState.check
      ? `${turn} is in check!`
      : gameState.stalemate || gameState.isDraw
        ? 'Draw!'
        : `${turn}'s turn`;

  return `SLACK-CHESS-GAME\n${asciiBoard}\n${status}\nFEN:${gameState.fen}\nMOVES:${gameState.moveHistory.join(',')}\n`;
}

export function parseGameState(text: string): GameState | null {
  try {
    if (!text.includes('SLACK-CHESS-GAME')) return null;

    const lines = text.trim().split('\n');

    // Try to reconstruct from MOVES line first (most accurate)
    const movesLine = lines.find(l => l.startsWith('MOVES:'));
    if (movesLine) {
      const movesStr = movesLine.substring(6).trim();
      if (movesStr) {
        const moves = movesStr.split(',');
        const chess = new Chess();
        for (const san of moves) {
          const result = chess.move(san.trim());
          if (!result) return null;
        }
        return chessToGameState(chess);
      }
      // Empty MOVES means starting position
      return createInitialGameState();
    }

    // Fallback: try FEN line
    const fenLine = lines.find(l => l.startsWith('FEN:'));
    if (fenLine) {
      const fen = fenLine.substring(4).trim();
      try {
        const chess = new Chess(fen);
        return chessToGameState(chess);
      } catch {
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing game state:", error);
    return null;
  }
}

// Check if a move from one position to another is valid
export function isValidMove(gameState: GameState, from: Position, to: Position): boolean {
  const chess = gameStateToChess(gameState);
  const fromSq = posToSquare(from);
  const toSq = posToSquare(to);
  const moves = chess.moves({ square: fromSq, verbose: true });
  return moves.some(m => m.to === toSq);
}

// Get all valid moves for a piece at a position
export function getValidMoves(gameState: GameState, from: Position): Position[] {
  const chess = gameStateToChess(gameState);
  const fromSq = posToSquare(from);
  const moves = chess.moves({ square: fromSq, verbose: true });
  return moves.map(m => squareToPos(m.to as ChessSquare));
}

// Make a move and return the new game state (with promotion defaulting to queen)
export function makeMove(gameState: GameState, from: Position, to: Position, promotion: PieceType = 'q'): GameState {
  const chess = gameStateToChess(gameState);
  const fromSq = posToSquare(from);
  const toSq = posToSquare(to);

  const result = chess.move({ from: fromSq, to: toSq, promotion });
  if (!result) throw new Error(`Invalid move: ${fromSq} → ${toSq}`);

  return chessToGameState(chess);
}

// Build a game state at a specific move index (for replay)
export function getStateAtMove(moveHistory: string[], moveIndex: number): GameState {
  const chess = new Chess();
  const movesToApply = moveHistory.slice(0, moveIndex);
  for (const san of movesToApply) {
    chess.move(san);
  }
  return chessToGameState(chess);
}

// Serialize game to a compact URL-safe string (comma-separated SAN moves)
export function serializeForUrl(gameState: GameState): string {
  if (gameState.moveHistory.length === 0) return '';
  return encodeURIComponent(gameState.moveHistory.join(','));
}

// Deserialize game from URL string
export function deserializeFromUrl(encoded: string): GameState | null {
  try {
    const decoded = decodeURIComponent(encoded);
    if (!decoded) return null;
    const moves = decoded.split(',');
    const chess = new Chess();
    for (const san of moves) {
      const result = chess.move(san.trim());
      if (!result) return null;
    }
    return chessToGameState(chess);
  } catch {
    return null;
  }
}