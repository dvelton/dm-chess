import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { INITIAL_GAME_STATE, GameState } from '@/lib/chess';
import ChessBoard from '@/components/ChessBoard';
import AsciiBoard from '@/components/AsciiBoard';
import GameControls from '@/components/GameControls';
import MoveHistory from '@/components/MoveHistory';
import HelpDialog from '@/components/HelpDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

function App() {
  // Use KV store to persist the game state between sessions
  const [persistedState, setPersistedState] = useKV<GameState | null>(
    'slack-chess-game-state', 
    null
  );
  
  // Local state for current game
  const [gameState, setGameState] = useState<GameState>(
    persistedState || JSON.parse(JSON.stringify(INITIAL_GAME_STATE))
  );

  // State for replay mode
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [replayState, setReplayState] = useState<GameState | null>(null);
  
  // Update both local state and persisted state
  const updateGameState = (newState: GameState) => {
    setGameState(newState);
    setPersistedState(newState);
    // When a new move is made, update the current move index to the latest
    setCurrentMoveIndex(newState.moveHistory.length);
  };
  
  // Reset the game to initial state
  const handleReset = () => {
    const newState = JSON.parse(JSON.stringify(INITIAL_GAME_STATE));
    updateGameState(newState);
    setCurrentMoveIndex(-1);
    setReplayState(null);
  };
  
  // Handle a move on the chess board
  const handleMove = (newState: GameState) => {
    updateGameState(newState);
  };
  
  // Import a game state from ASCII text
  const handleImport = (importedState: GameState) => {
    updateGameState(importedState);
    setCurrentMoveIndex(importedState.moveHistory.length);
  };

  // Handle move history replay
  const handleReplayMove = (moveIndex: number) => {
    setCurrentMoveIndex(moveIndex);
    
    if (moveIndex <= 0) {
      // If at the start, show initial board
      setReplayState(JSON.parse(JSON.stringify(INITIAL_GAME_STATE)));
      return;
    }
    
    if (moveIndex >= gameState.moveHistory.length) {
      // If at the end, show current board
      setReplayState(null);
      return;
    }
    
    // Otherwise, reconstruct the board state up to this move
    const replayGameState = JSON.parse(JSON.stringify(INITIAL_GAME_STATE));
    
    // Apply all moves up to the selected index
    for (let i = 0; i < moveIndex; i++) {
      const move = gameState.moveHistory[i];
      const [from, to] = move.split('-');
      
      // Convert algebraic notation to positions
      const fromCol = from.charCodeAt(0) - 'a'.charCodeAt(0);
      const fromRow = 8 - parseInt(from[1]);
      const toCol = to.charCodeAt(0) - 'a'.charCodeAt(0);
      const toRow = 8 - parseInt(to[1]);
      
      const fromPos = { row: fromRow, col: fromCol };
      const toPos = { row: toRow, col: toCol };
      
      // Apply move
      const piece = replayGameState.board[fromRow][fromCol];
      if (piece) {
        // Record capture if there is one
        const targetPiece = replayGameState.board[toRow][toCol];
        if (targetPiece) {
          replayGameState.capturedPieces[targetPiece.color].push(targetPiece.type);
        }
        
        // Move the piece
        replayGameState.board[toRow][toCol] = piece;
        replayGameState.board[fromRow][fromCol] = null;
        
        // Handle pawn promotion (always to queen for simplicity)
        if (piece.type === 'p') {
          if ((piece.color === 'w' && toRow === 0) || (piece.color === 'b' && toRow === 7)) {
            replayGameState.board[toRow][toCol] = { type: 'q', color: piece.color };
          }
        }
        
        // Record this move in the history
        replayGameState.moveHistory.push(move);
        
        // Update last move for highlighting
        replayGameState.lastMove = { from: fromPos, to: toPos };
      }
      
      // Switch turns after each move
      replayGameState.turn = replayGameState.turn === 'w' ? 'b' : 'w';
    }
    
    setReplayState(replayGameState);
  };

  // When game state changes, exit replay mode
  useEffect(() => {
    if (gameState.moveHistory.length <= currentMoveIndex) {
      setCurrentMoveIndex(gameState.moveHistory.length);
      setReplayState(null);
    }
  }, [gameState.moveHistory.length]);

  return (
    <div className="app-container min-h-screen py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Slack Chess</h1>
        <HelpDialog />
      </header>
      
      <main className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-6">
        <section>
          <Card>
            <CardContent className="p-4">
              <ChessBoard 
                gameState={gameState} 
                onMove={handleMove} 
                viewMode={replayState !== null}
                displayState={replayState || undefined}
              />
              {currentMoveIndex < gameState.moveHistory.length && replayState && (
                <div className="mt-3 p-2 bg-muted text-sm text-center rounded">
                  Viewing historical position (Move {currentMoveIndex} of {gameState.moveHistory.length})
                </div>
              )}
            </CardContent>
          </Card>
        </section>
        
        <section className="space-y-6">
          <GameControls 
            gameState={gameState} 
            onReset={handleReset} 
          />
          
          <Tabs defaultValue="share">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="share">Share</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="share" className="mt-2">
              <Card>
                <CardContent className="p-4">
                  <AsciiBoard 
                    gameState={gameState}
                    onImport={handleImport}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-2">
              <Card>
                <CardContent className="p-4">
                  <MoveHistory 
                    gameState={gameState}
                    onReplayMove={handleReplayMove}
                    currentMoveIndex={currentMoveIndex}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="instructions" className="mt-2">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-lg font-medium">How to Play</h3>
                  
                  <ol className="list-decimal list-inside space-y-3">
                    <li>
                      <p><strong>Make your move</strong> on the chess board by clicking a piece and then clicking its destination.</p>
                    </li>
                    <li>
                      <p><strong>Copy the text</strong> from the "Share" tab.</p>
                    </li>
                    <li>
                      <p><strong>Paste it in Slack</strong> to your opponent.</p>
                    </li>
                    <li>
                      <p>Your opponent should <strong>copy the text</strong> from Slack, <strong>paste it</strong> in their app, and click "Load Game".</p>
                    </li>
                    <li>
                      <p>After making their move, they'll send you the updated game text, and you'll repeat the process.</p>
                    </li>
                  </ol>
                  
                  <div className="text-sm text-muted-foreground mt-4">
                    <p>The game state is automatically saved in your browser, so you can close the tab and come back later.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Slack Chess - Play chess in Slack without authentication or third-party services.</p>
      </footer>
    </div>
  );
}

export default App;