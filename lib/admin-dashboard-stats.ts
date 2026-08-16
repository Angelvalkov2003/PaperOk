export type RevenuePeriod = "today" | "week" | "month" | "year" | "custom";

export type PeriodRange = {
  period: RevenuePeriod;
  from: Date;
  to: Date;
  label: string;
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function parseDateInput(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Resolve period from URL search params (BG week = Mon–Sun). */
export function resolveRevenuePeriod(params: {
  period?: string;
  from?: string;
  to?: string;
}): PeriodRange {
  const now = new Date();
  const raw = (params.period || "week").toLowerCase();

  if (raw === "custom") {
    const fromParsed = parseDateInput(params.from);
    const toParsed = parseDateInput(params.to) || fromParsed;
    if (fromParsed && toParsed) {
      const from = startOfDay(fromParsed);
      const to = endOfDay(toParsed);
      if (from <= to) {
        return {
          period: "custom",
          from,
          to,
          label: `${params.from} – ${params.to || params.from}`,
        };
      }
    }
  }

  if (raw === "today") {
    return {
      period: "today",
      from: startOfDay(now),
      to: endOfDay(now),
      label: "Днес",
    };
  }

  if (raw === "month") {
    const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    return {
      period: "month",
      from,
      to: endOfDay(now),
      label: "Този месец",
    };
  }

  if (raw === "year") {
    const from = startOfDay(new Date(now.getFullYear(), 0, 1));
    return {
      period: "year",
      from,
      to: endOfDay(now),
      label: "Тази година",
    };
  }

  // week (default): Monday 00:00 → now end of day
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return {
    period: "week",
    from: startOfDay(monday),
    to: endOfDay(now),
    label: "Тази седмица",
  };
}

export function orderInPeriod(
  createdAt: string,
  range: PeriodRange,
): boolean {
  const t = new Date(createdAt).getTime();
  return t >= range.from.getTime() && t <= range.to.getTime();
}

/** Heuristic for development / test orders. */
export function looksLikeTestOrder(order: {
  customer_email?: string | null;
  customer_name?: string | null;
  comment?: string | null;
}): boolean {
  const email = (order.customer_email || "").toLowerCase();
  const name = (order.customer_name || "").toLowerCase();
  const comment = (order.comment || "").toLowerCase();
  const hay = `${email} ${name} ${comment}`;

  return (
    email.includes("test") ||
    email.includes("example.com") ||
    email.includes("dextrasoft") ||
    email.includes("localhost") ||
    name.includes("test") ||
    name.includes("тест") ||
    comment.includes("test") ||
    comment.includes("тест") ||
    hay.includes("@mailinator") ||
    hay.includes("@yopmail")
  );
}
