import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatGameState, parseGameState, GameState } from '@/lib/chess';
import { Copy, PasteClipboard, CheckCircle } from '@phosphor-icons/react';

interface AsciiBoardProps {
  gameState: GameState;
  onImport: (gameState: GameState) => void;
}

export default function AsciiBoard({ gameState, onImport }: AsciiBoardProps) {
  const [asciiText, setAsciiText] = useState<string>(formatGameState(gameState));
  const [copied, setCopied] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  
  // Update ASCII text when game state changes
  if (formatGameState(gameState) !== asciiText) {
    setAsciiText(formatGameState(gameState));
  }
  
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(asciiText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  const handleImport = () => {
    try {
      const parsedState = parseGameState(asciiText);
      
      if (parsedState) {
        onImport(parsedState);
        setImportSuccess(true);
        setImportError(null);
        setTimeout(() => setImportSuccess(false), 2000);
      } else {
        setImportError("Invalid game format. Please paste a valid Slack Chess game.");
        setTimeout(() => setImportError(null), 3000);
      }
    } catch (err) {
      console.error('Error importing game: ', err);
      setImportError("Error parsing the game. Please check the format and try again.");
      setTimeout(() => setImportError(null), 3000);
    }
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAsciiText(e.target.value);
    
    // Clear any errors/success when the user starts typing
    setImportError(null);
    setImportSuccess(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Share via Slack</h3>
        <div className="space-x-2">
          <Button
            onClick={handleCopyToClipboard}
            size="sm"
            variant={copied ? "outline" : "secondary"}
          >
            {copied ? <CheckCircle className="mr-1" /> : <Copy className="mr-1" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            onClick={handleImport}
            size="sm"
            variant={importSuccess ? "outline" : "default"}
          >
            {importSuccess ? <CheckCircle className="mr-1" /> : <PasteClipboard className="mr-1" />}
            {importSuccess ? "Loaded!" : "Load Game"}
          </Button>
        </div>
      </div>
      
      <Textarea
        value={asciiText}
        onChange={handleTextChange}
        className="ascii-board h-[300px] font-mono text-sm"
        placeholder="Paste game state here..."
      />
      
      {importError && (
        <p className="text-destructive text-sm">{importError}</p>
      )}
      
      <div className="text-sm text-muted-foreground">
        <p>Copy this text and send it to your opponent in Slack. To continue a game, paste the game text from Slack and click "Load Game".</p>
      </div>
    </div>
  );
}