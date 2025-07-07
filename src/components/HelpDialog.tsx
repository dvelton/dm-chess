import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuestionCircle, Clipboard, ArrowsClockwise } from "@phosphor-icons/react";

export default function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <QuestionCircle size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>How to Play Chess in Slack</DialogTitle>
          <DialogDescription>
            Play chess with your colleagues directly through Slack without any external tools.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Getting Started</h3>
            <p>This app lets you play chess with anyone in your Slack workspace by sharing text-based board representations.</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-lg">How It Works</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Make your move on the visual chess board</li>
              <li>Click the <span className="inline-flex items-center"><Clipboard size={16} className="mx-1" />Copy</span> button to copy the ASCII game representation</li>
              <li>Paste the text in your Slack conversation</li>
              <li>Your opponent copies the text from Slack, clicks <span className="inline-flex items-center"><ArrowsClockwise size={16} className="mx-1" />Load Game</span>, makes their move, and sends it back</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Chess Notation</h3>
            <p>The ASCII board uses these symbols:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>White pieces: <strong>P</strong> (pawn), <strong>R</strong> (rook), <strong>N</strong> (knight), <strong>B</strong> (bishop), <strong>Q</strong> (queen), <strong>K</strong> (king)</li>
              <li>Black pieces: <strong>p</strong>, <strong>r</strong>, <strong>n</strong>, <strong>b</strong>, <strong>q</strong>, <strong>k</strong></li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Tips</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>The game board automatically updates as you make moves</li>
              <li>You can start a new game anytime with the "New Game" button</li>
              <li>If the ASCII representation gets corrupted, you can start a new game</li>
              <li>Click on pieces and then click on destination squares to make moves</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}