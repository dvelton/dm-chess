import { Button } from '@/components/ui/button';
import { INITIAL_GAME_STATE, GameState } from '@/lib/chess';
import { ArrowClockwise, Trophy, Flag } from '@phosphor-icons/react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface GameControlsProps {
  gameState: GameState;
  onReset: () => void;
}

export default function GameControls({ gameState, onReset }: GameControlsProps) {
  const { turn, check, checkmate, stalemate, capturedPieces } = gameState;
  
  const renderGameStatus = () => {
    if (checkmate) {
      return (
        <div className="flex items-center text-lg">
          <Trophy className="mr-2 text-accent" weight="fill" />
          <span className="font-semibold">{turn === 'w' ? 'Black' : 'White'} wins by checkmate!</span>
        </div>
      );
    }
    
    if (stalemate) {
      return (
        <div className="flex items-center text-lg">
          <Flag className="mr-2" weight="fill" />
          <span className="font-semibold">Game drawn by stalemate</span>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center">
          <Badge variant={turn === 'w' ? "outline" : "default"} className="mr-2">
            {turn === 'w' ? 'White to move' : 'Black to move'}
          </Badge>
          {check && <span className="check-status">Check!</span>}
        </div>
      </div>
    );
  };
  
  const renderCapturedPieces = (color: 'w' | 'b') => {
    const pieces = capturedPieces[color];
    if (pieces.length === 0) return null;
    
    const pieceSymbols: Record<string, string> = {
      p: '♟',
      r: '♜',
      n: '♞',
      b: '♝',
      q: '♛',
      k: '♚'
    };
    
    return (
      <div className={`flex flex-wrap ${color === 'w' ? 'text-primary' : 'text-foreground'}`}>
        {pieces.map((piece, index) => (
          <span key={index} className="text-lg mx-1" title={`Captured ${piece === 'p' ? 'pawn' : piece}`}>
            {pieceSymbols[piece]}
          </span>
        ))}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col space-y-4 p-4 bg-card rounded-md border shadow-sm">
      {renderGameStatus()}
      
      <Separator />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Captured by White</h4>
          {renderCapturedPieces('b') || <span className="text-muted-foreground text-sm">None</span>}
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-1">Captured by Black</h4>
          {renderCapturedPieces('w') || <span className="text-muted-foreground text-sm">None</span>}
        </div>
      </div>
      
      <Separator />
      
      <div className="flex justify-between items-center">
        <Button onClick={onReset} variant="outline" size="sm">
          <ArrowClockwise className="mr-2" />
          New Game
        </Button>
        
        <div className="text-sm text-muted-foreground">
          {gameState.moveHistory.length} {gameState.moveHistory.length === 1 ? 'move' : 'moves'} played
        </div>
      </div>
    </div>
  );
}