import { GameState } from '@/lib/chess';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface MoveHistoryProps {
  gameState: GameState;
  onReplayMove: (moveIndex: number) => void;
  currentMoveIndex: number;
}

export default function MoveHistory({ gameState, onReplayMove, currentMoveIndex }: MoveHistoryProps) {
  const { moveHistory } = gameState;
  
  // Format the move for display, paired as white/black moves
  const formattedMoves = moveHistory.reduce<{ moveNum: number; white: string; black: string | null }[]>(
    (acc, move, index) => {
      const moveNum = Math.floor(index / 2) + 1;
      
      if (index % 2 === 0) {
        // White's move
        acc.push({ moveNum, white: move, black: null });
      } else {
        // Black's move - update the last entry
        if (acc.length > 0) {
          acc[acc.length - 1].black = move;
        }
      }
      
      return acc;
    },
    []
  );
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Move History</h3>
        <div className="flex space-x-1">
          <Button
            onClick={() => onReplayMove(0)}
            variant="outline"
            size="icon"
            disabled={moveHistory.length === 0 || currentMoveIndex === 0}
            title="Go to start"
            className="h-8 w-8"
          >
            <CaretLeft className="h-4 w-4" />
            <CaretLeft className="h-4 w-4 -ml-2" />
          </Button>
          <Button
            onClick={() => onReplayMove(Math.max(0, currentMoveIndex - 1))}
            variant="outline"
            size="icon"
            disabled={moveHistory.length === 0 || currentMoveIndex === 0}
            title="Previous move"
            className="h-8 w-8"
          >
            <CaretLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onReplayMove(Math.min(moveHistory.length, currentMoveIndex + 1))}
            variant="outline"
            size="icon"
            disabled={moveHistory.length === 0 || currentMoveIndex === moveHistory.length}
            title="Next move"
            className="h-8 w-8"
          >
            <CaretRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onReplayMove(moveHistory.length)}
            variant="outline"
            size="icon"
            disabled={moveHistory.length === 0 || currentMoveIndex === moveHistory.length}
            title="Go to current position"
            className="h-8 w-8"
          >
            <CaretRight className="h-4 w-4" />
            <CaretRight className="h-4 w-4 -ml-2" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[200px] border rounded-md p-2">
        {formattedMoves.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1 text-left font-medium">#</th>
                <th className="px-2 py-1 text-left font-medium">White</th>
                <th className="px-2 py-1 text-left font-medium">Black</th>
              </tr>
            </thead>
            <tbody>
              {formattedMoves.map((move, idx) => (
                <tr 
                  key={idx}
                  className={`hover:bg-muted/50 ${
                    (currentMoveIndex === idx * 2 + 1 && move.black === null) || 
                    currentMoveIndex === idx * 2 + 2 
                      ? 'bg-accent/10' 
                      : ''
                  }`}
                >
                  <td className="px-2 py-1 text-muted-foreground">{move.moveNum}.</td>
                  <td className="px-2 py-1">
                    <button
                      className={`hover:underline ${currentMoveIndex === idx * 2 + 1 ? 'font-medium text-accent' : ''}`}
                      onClick={() => onReplayMove(idx * 2 + 1)}
                    >
                      {move.white}
                    </button>
                  </td>
                  <td className="px-2 py-1">
                    {move.black && (
                      <button
                        className={`hover:underline ${currentMoveIndex === idx * 2 + 2 ? 'font-medium text-accent' : ''}`}
                        onClick={() => onReplayMove(idx * 2 + 2)}
                      >
                        {move.black}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No moves yet
          </div>
        )}
      </ScrollArea>
    </div>
  );
}