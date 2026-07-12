"use client";

import { useEffect, useState } from "react";
import { useCurrency } from "@/lib/currency-context";

interface PriceDisplayProps {
  amountInPaise: number;
  className?: string;
}

export function PriceDisplay({ amountInPaise, className = "" }: PriceDisplayProps) {
  const { formatPrice } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Initial server-side rendering to guarantee hydration match (using default base currency: INR)
    const amountInRupees = Math.round(amountInPaise / 100);
    return <span className={className}>₹{amountInRupees}</span>;
  }

  return <span className={className}>{formatPrice(amountInPaise)}</span>;
}

export default PriceDisplay;
