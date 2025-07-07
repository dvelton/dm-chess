import { useState } from 'react';
import { Board, GameState, Piece, Position, isValidMove, makeMove } from '@/lib/chess';
import { cn } from '@/lib/utils';

interface ChessBoardProps {
  gameState: GameState;
  onMove: (newState: GameState) => void;
  viewMode?: boolean;
  displayState?: GameState;
}

export default function ChessBoard({ gameState, onMove, viewMode = false, displayState }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<Position | null>(null);
  
  // Use displayState if provided (for move history replay), otherwise use gameState
  const boardToDisplay = displayState || gameState;

  // Handle square selection for moving pieces
  const handleSquareClick = (row: number, col: number) => {
    // Don't allow moves in view mode
    if (viewMode) return;
    
    const clickedPosition = { row, col };
    
    // If a square is already selected
    if (selectedSquare) {
      // Attempt to make a move
      if (isValidMove(gameState, selectedSquare, clickedPosition)) {
        const newState = makeMove(gameState, selectedSquare, clickedPosition);
        onMove(newState);
      }
      
      // Clear selection regardless of move validity
      setSelectedSquare(null);
    } else {
      // Select the square if it has a piece of the current player's color
      const piece = gameState.board[row][col];
      if (piece && piece.color === gameState.turn) {
        setSelectedSquare(clickedPosition);
      }
    }
  };

  // Render a chess piece based on its type and color using Unicode characters
  const renderPiece = (piece: Piece | null) => {
    if (!piece) return null;
    
    const pieceColor = piece.color === 'w' ? 'text-white' : 'text-black';
    
    // Unicode chess pieces
    const unicodePieces = {
      w: {
        p: '♙', // white pawn
        r: '♖', // white rook
        n: '♘', // white knight
        b: '♗', // white bishop
        q: '♕', // white queen
        k: '♔', // white king
      },
      b: {
        p: '♟', // black pawn
        r: '♜', // black rook
        n: '♞', // black knight
        b: '♝', // black bishop
        q: '♛', // black queen
        k: '♚', // black king
      }
    };
    
    return (
      <div className={cn(
        "text-4xl", 
        pieceColor,
        "select-none cursor-grab active:cursor-grabbing",
        viewMode && "cursor-default"
      )}>
        {unicodePieces[piece.color][piece.type]}
      </div>
    );
  };
  
  // Check if a square is valid for the selected piece to move to
  const isValidMoveTarget = (row: number, col: number) => {
    return !viewMode && selectedSquare && isValidMove(gameState, selectedSquare, { row, col });
  };

  // Check if a square was involved in the last move
  const isLastMove = (row: number, col: number) => {
    const lastMove = boardToDisplay.lastMove;
    if (!lastMove) return false;
    
    return (
      (row === lastMove.from.row && col === lastMove.from.col) ||
      (row === lastMove.to.row && col === lastMove.to.col)
    );
  };

  return (
    <div className="board-container">
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full border border-border rounded overflow-hidden">
        {boardToDisplay.board.map((row, rowIndex) => (
          row.map((piece, colIndex) => {
            const isLightSquare = (rowIndex + colIndex) % 2 === 0;
            const isSelected = !viewMode && selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
            const isValidTarget = isValidMoveTarget(rowIndex, colIndex);
            const isHighlighted = isLastMove(rowIndex, colIndex);
            const isHovered = !viewMode && hoveredSquare?.row === rowIndex && hoveredSquare?.col === colIndex;
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "flex items-center justify-center relative",
                  isLightSquare ? "chess-square-light" : "chess-square-dark",
                  isSelected && "ring-2 ring-accent ring-inset",
                  isValidTarget && "bg-accent/25",
                  isHighlighted && "ring-1 ring-accent/70 ring-inset",
                  isHovered && "brightness-110",
                  viewMode ? "cursor-default" : ""
                )}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                onMouseEnter={() => !viewMode && setHoveredSquare({ row: rowIndex, col: colIndex })}
                onMouseLeave={() => !viewMode && setHoveredSquare(null)}
              >
                <div className={cn("chess-piece", piece && "z-10")}>
                  {renderPiece(piece)}
                </div>
                
                {/* Coordinates on the edges of the board */}
                {colIndex === 0 && (
                  <div className="absolute left-1 top-0 text-xs opacity-70">
                    {8 - rowIndex}
                  </div>
                )}
                {rowIndex === 7 && (
                  <div className="absolute bottom-0 right-1 text-xs opacity-70">
                    {String.fromCharCode(97 + colIndex)}
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}