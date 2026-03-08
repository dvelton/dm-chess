import { PieceType } from '@/lib/chess';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PromotionDialogProps {
  open: boolean;
  color: 'w' | 'b';
  onSelect: (piece: PieceType) => void;
}

const promotionPieces: { type: PieceType; label: string; white: string; black: string }[] = [
  { type: 'q', label: 'Queen', white: '♕', black: '♛' },
  { type: 'r', label: 'Rook', white: '♖', black: '♜' },
  { type: 'b', label: 'Bishop', white: '♗', black: '♝' },
  { type: 'n', label: 'Knight', white: '♘', black: '♞' },
];

export default function PromotionDialog({ open, color, onSelect }: PromotionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-xs" onPointerDownOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Promote pawn</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2 py-2">
          {promotionPieces.map(p => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              className="flex flex-col items-center gap-1 p-3 rounded-md hover:bg-muted transition-colors border"
              title={p.label}
            >
              <span className="text-4xl select-none">
                {color === 'w' ? p.white : p.black}
              </span>
              <span className="text-xs text-muted-foreground">{p.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
