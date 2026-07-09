"use client";

import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { BookerLivePosition } from "@/types/sales";

interface ExceptionModalProps {
  booker: BookerLivePosition | null;
  onClose: () => void;
  onMessageBooker: (bookerUserId: string) => void;
  onEscalate: (bookerUserId: string) => void;
}

export function ExceptionModal({ booker, onClose, onMessageBooker, onEscalate }: ExceptionModalProps) {
  return (
    <Dialog open={!!booker} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px] rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-text">
            Exception Alert — {booker?.bookerName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border border-danger/20 bg-danger-subtle px-5 py-4 text-base font-medium text-danger">
          <AlertCircle className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
          {booker?.exceptionLabel}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-text-muted">Area</span>
            <span className="text-base font-medium text-text">{booker?.area}</span>
          </div>
        </div>

        <DialogFooter className="mt-5 gap-2 border-t border-border pt-5">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="bg-[#25D366] text-white hover:bg-[#1FB855]"
            onClick={() => booker && onMessageBooker(booker.bookerUserId)}
          >
            Message Booker
          </Button>
          <Button
            className="bg-warning text-white hover:bg-[#A85A08]"
            onClick={() => booker && onEscalate(booker.bookerUserId)}
          >
            Escalate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}