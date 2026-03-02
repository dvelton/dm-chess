import { useState, useEffect, useCallback } from 'react';
import { createInitialGameState, GameState, getStateAtMove, deserializeFromUrl, serializeForUrl } from '@/lib/chess';
import ChessBoard from '@/components/ChessBoard';
import AsciiBoard from '@/components/AsciiBoard';
import GameControls from '@/components/GameControls';
import MoveHistory from '@/components/MoveHistory';
import HelpDialog from '@/components/HelpDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

// Try to load game from URL on initial render
function loadFromUrl(): GameState | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const moves = params.get('moves');
    if (moves) return deserializeFromUrl(moves);
  } catch { /* ignore */ }
  return null;
}

const STORAGE_KEY = 'dm-chess-game-state';

function loadPersistedState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function persistState(state: GameState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    return loadFromUrl() || loadPersistedState() || createInitialGameState();
  });

  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [replayState, setReplayState] = useState<GameState | null>(null);

  const updateGameState = (newState: GameState) => {
    setGameState(newState);
    persistState(newState);
    setCurrentMoveIndex(newState.moveHistory.length);
  };

  const handleReset = () => {
    const newState = createInitialGameState();
    updateGameState(newState);
    setCurrentMoveIndex(-1);
    setReplayState(null);
    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleMove = (newState: GameState) => {
    updateGameState(newState);
  };

  const handleImport = (importedState: GameState) => {
    updateGameState(importedState);
    setCurrentMoveIndex(importedState.moveHistory.length);
  };

  const handleReplayMove = (moveIndex: number) => {
    setCurrentMoveIndex(moveIndex);

    if (moveIndex >= gameState.moveHistory.length) {
      setReplayState(null);
      return;
    }

    setReplayState(getStateAtMove(gameState.moveHistory, moveIndex));
  };

  const handleShareLink = async () => {
    const encoded = serializeForUrl(gameState);
    const url = new URL(window.location.href);
    url.search = encoded ? `?moves=${encoded}` : '';
    try {
      await navigator.clipboard.writeText(url.toString());
    } catch { /* fallback: silent */ }
    return url.toString();
  };

  useEffect(() => {
    if (gameState.moveHistory.length <= currentMoveIndex) {
      setCurrentMoveIndex(gameState.moveHistory.length);
      setReplayState(null);
    }
  }, [gameState.moveHistory.length]);

  return (
    <div className="app-container min-h-screen py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">DM-Chess</h1>
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
                    onShareLink={handleShareLink}
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
        <p>DM-Chess — play chess over DMs without accounts or third-party services.</p>
      </footer>
    </div>
  );
}

export default App;