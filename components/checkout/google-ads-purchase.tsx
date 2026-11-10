"use client";

import { reportGoogleAdsPurchaseConversion } from "lib/google-ads";
import { useEffect } from "react";

type Props = {
  /** Full order UUID — unique transaction_id for Google Ads */
  transactionId: string;
  /** Order total in EUR */
  value: number;
};

/**
 * Fires Google Ads Purchase conversion once when the success page confirms
 * an accepted order. Deduped by transaction_id so refresh does not double-count.
 */
export function GoogleAdsPurchase({ transactionId, value }: Props) {
  useEffect(() => {
    reportGoogleAdsPurchaseConversion({
      transactionId,
      value,
      currency: "EUR",
    });
  }, [transactionId, value]);

  return null;
}
