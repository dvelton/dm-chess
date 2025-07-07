import { useState } from 'react';
import { Board, GameState, Piece, Position, isValidMove, makeMove } from '@/lib/chess';
import { cn } from '@/lib/utils';
import { PawnTopFill, RookFill, KnightFill, BishopFill, QueenFill, KingFill } from '@phosphor-icons/react';

interface ChessBoardProps {
  gameState: GameState;
  onMove: (newState: GameState) => void;
}

export default function ChessBoard({ gameState, onMove }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<Position | null>(null);

  // Handle square selection for moving pieces
  const handleSquareClick = (row: number, col: number) => {
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

  // Render a chess piece based on its type and color
  const renderPiece = (piece: Piece | null) => {
    if (!piece) return null;
    
    const pieceColor = piece.color === 'w' ? 'text-white' : 'text-black';
    const size = 36;
    const weight = 'fill';
    
    switch (piece.type) {
      case 'p':
        return <PawnTopFill className={pieceColor} size={size} weight={weight} />;
      case 'r':
        return <RookFill className={pieceColor} size={size} weight={weight} />;
      case 'n':
        return <KnightFill className={pieceColor} size={size} weight={weight} />;
      case 'b':
        return <BishopFill className={pieceColor} size={size} weight={weight} />;
      case 'q':
        return <QueenFill className={pieceColor} size={size} weight={weight} />;
      case 'k':
        return <KingFill className={pieceColor} size={size} weight={weight} />;
      default:
        return null;
    }
  };
  
  // Check if a square is valid for the selected piece to move to
  const isValidMoveTarget = (row: number, col: number) => {
    return selectedSquare && isValidMove(gameState, selectedSquare, { row, col });
  };

  // Check if a square was involved in the last move
  const isLastMove = (row: number, col: number) => {
    const lastMove = gameState.lastMove;
    if (!lastMove) return false;
    
    return (
      (row === lastMove.from.row && col === lastMove.from.col) ||
      (row === lastMove.to.row && col === lastMove.to.col)
    );
  };

  return (
    <div className="board-container">
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full border border-border rounded overflow-hidden">
        {gameState.board.map((row, rowIndex) => (
          row.map((piece, colIndex) => {
            const isLightSquare = (rowIndex + colIndex) % 2 === 0;
            const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
            const isValidTarget = isValidMoveTarget(rowIndex, colIndex);
            const isHighlighted = isLastMove(rowIndex, colIndex);
            const isHovered = hoveredSquare?.row === rowIndex && hoveredSquare?.col === colIndex;
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "flex items-center justify-center relative",
                  isLightSquare ? "chess-square-light" : "chess-square-dark",
                  isSelected && "ring-2 ring-accent ring-inset",
                  isValidTarget && "bg-accent/25",
                  isHighlighted && "ring-1 ring-accent/70 ring-inset",
                  isHovered && "brightness-110"
                )}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                onMouseEnter={() => setHoveredSquare({ row: rowIndex, col: colIndex })}
                onMouseLeave={() => setHoveredSquare(null)}
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