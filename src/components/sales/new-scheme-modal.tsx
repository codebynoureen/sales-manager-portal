"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/form-field";

interface ProductOption {
  id: string;
  name: string;
}

const SCHEME_TYPES = [
  { value: "BUY_X_GET_Y", label: "Buy-X-Get-Y Free Goods" },
  { value: "VOLUME_SLAB", label: "Volume Slab Discount" },
  { value: "FIXED_PRICE", label: "Fixed Price Promotion" },
  { value: "COMBO", label: "Bundle / Combo Deal" },
  { value: "CASH_DISCOUNT", label: "Cash Discount" },
  { value: "HAPPY_HOUR", label: "Happy Hour" },
  { value: "NEW_OUTLET", label: "New Outlet Scheme" },
];

const FUNDING_TYPES = [
  { value: "SELF_FUNDED", label: "Self-Funded" },
  { value: "PRINCIPAL_FUNDED", label: "Principal-Funded" },
  { value: "SPLIT", label: "Split" },
];

export function NewSchemeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);

  const [name, setName] = useState("");
  const [type, setType] = useState("BUY_X_GET_Y");
  const [fundingType, setFundingType] = useState("SELF_FUNDED");
  const [productId, setProductId] = useState("");
  const [buyQty, setBuyQty] = useState("");
  const [freeQty, setFreeQty] = useState("");
  const [discountPct, setDiscountPct] = useState("");
  const [fixedPrice, setFixedPrice] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });

  useEffect(() => {
    if (!open) return;
    fetch("/api/products")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setProducts(json.data);
          if (json.data.length && !productId) setProductId(json.data[0].id);
        }
      })
      .catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleLaunch() {
    if (!name.trim()) {
      toast.error("Please enter a scheme name");
      return;
    }
    if (!productId) {
      toast.error("Please select an applicable SKU");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          fundingType,
          startDate,
          endDate,
          skuConditions: [{ productId, minQty: buyQty ? Number(buyQty) : undefined }],
          rewardSkuId: type === "BUY_X_GET_Y" ? productId : undefined,
          rewardQty: freeQty ? Number(freeQty) : undefined,
          discountPct: discountPct ? Number(discountPct) : undefined,
          fixedPricePaisa: fixedPrice ? Math.round(Number(fixedPrice) * 100) : undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        toast.error(json.error ?? "Failed to create scheme");
        return;
      }

      onOpenChange(false);
      toast.success("Scheme created and pushed to eligible bookers");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[780px] rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-text">Create New Scheme</DialogTitle>
        </DialogHeader>

        <div className="mb-5 grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <FormField label="Scheme Name" required>
              <Input placeholder="e.g. Eid Bonanza Offer" value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Scheme Type" required>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              {SCHEME_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Funding Type" required>
            <Select value={fundingType} onChange={(e) => setFundingType(e.target.value)}>
              {FUNDING_TYPES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Applicable SKU" required>
            <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Select product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </FormField>
          <div />
          <FormField label="Buy Quantity (Ctns)">
            <Input type="number" placeholder="e.g. 30" value={buyQty} onChange={(e) => setBuyQty(e.target.value)} />
          </FormField>
          <FormField label="Free Quantity (Ctns)">
            <Input type="number" placeholder="e.g. 4" value={freeQty} onChange={(e) => setFreeQty(e.target.value)} />
          </FormField>
          <FormField label="Discount % (Volume Slab / Cash Discount)">
            <Input type="number" placeholder="e.g. 5" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} />
          </FormField>
          <FormField label="Fixed Price PKR (Fixed Price Promo)">
            <Input type="number" placeholder="e.g. 850" value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} />
          </FormField>
          <FormField label="Start Date">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </FormField>
          <FormField label="End Date">
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </FormField>
        </div>

        <DialogFooter className="gap-2 border-t border-border pt-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleLaunch} disabled={saving}>
            {saving ? "Launching…" : "Launch Scheme"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}