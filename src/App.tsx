import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { INITIAL_GAME_STATE, GameState } from '@/lib/chess';
import ChessBoard from '@/components/ChessBoard';
import AsciiBoard from '@/components/AsciiBoard';
import GameControls from '@/components/GameControls';
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
  
  // Update both local state and persisted state
  const updateGameState = (newState: GameState) => {
    setGameState(newState);
    setPersistedState(newState);
  };
  
  // Reset the game to initial state
  const handleReset = () => {
    const newState = JSON.parse(JSON.stringify(INITIAL_GAME_STATE));
    updateGameState(newState);
  };
  
  // Handle a move on the chess board
  const handleMove = (newState: GameState) => {
    updateGameState(newState);
  };
  
  // Import a game state from ASCII text
  const handleImport = (importedState: GameState) => {
    updateGameState(importedState);
  };

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
              <ChessBoard gameState={gameState} onMove={handleMove} />
            </CardContent>
          </Card>
        </section>
        
        <section className="space-y-6">
          <GameControls 
            gameState={gameState} 
            onReset={handleReset} 
          />
          
          <Tabs defaultValue="share">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="share">Share Game</TabsTrigger>
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
            
            <TabsContent value="instructions" className="mt-2">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-lg font-medium">How to Play</h3>
                  
                  <ol className="list-decimal list-inside space-y-3">
                    <li>
                      <p><strong>Make your move</strong> on the chess board by clicking a piece and then clicking its destination.</p>
                    </li>
                    <li>
                      <p><strong>Copy the text</strong> from the "Share Game" tab.</p>
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