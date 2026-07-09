"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/form-field";
import type { Weekday } from "@/types/sales";

interface AddShopModalProps {
  day: Weekday | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (shopName: string) => void;
}

export function AddShopModal({ day, open, onOpenChange, onAdd }: AddShopModalProps) {
  const [shopName, setShopName] = useState("");

  function handleAdd() {
    if (!shopName.trim()) return;
    onAdd(shopName.trim());
    setShopName("");
    onOpenChange(false);
    toast.success("Shop added to route");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-text">Add Shop to Route — {day}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <FormField label="Search Shop">
            <Input placeholder="Type shop name…" value={shopName} onChange={(e) => setShopName(e.target.value)} />
          </FormField>
          <FormField label="Visit Frequency">
            <Select defaultValue="Weekly">
              <option>Weekly</option>
              <option>Twice a week</option>
              <option>Bi-weekly</option>
            </Select>
          </FormField>
        </div>

        <DialogFooter className="mt-5 gap-2 border-t border-border pt-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add to Route</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
