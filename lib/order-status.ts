export type OrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled";

export type PaymentStatus =
  | "cash_on_delivery"
  | "awaiting_payment"
  | "paid"
  | "failed";

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "processing",
  "shipped",
  "delivered",
  "canceled",
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "cash_on_delivery",
  "awaiting_payment",
  "paid",
  "failed",
];

export function orderStatusLabel(status: string): string {
  switch (status) {
    case "new":
      return "Нова";
    case "processing":
      return "За изпълнение";
    case "shipped":
      return "Изпратена";
    case "delivered":
      return "Доставена";
    case "canceled":
      return "Отменена";
    // Legacy values (pre-migration display)
    case "pending_payment":
      return "Нова";
    case "confirmed":
      return "За изпълнение";
    case "paid":
      return "За изпълнение";
    case "completed":
      return "Доставена";
    default:
      return status;
  }
}

export function paymentStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case "cash_on_delivery":
      return "Наложен платеж";
    case "awaiting_payment":
      return "Очаква плащане";
    case "paid":
      return "Платено";
    case "failed":
      return "Неуспешно плащане";
    default:
      return "—";
  }
}

export function paymentMethodLabel(method: string): string {
  switch (method) {
    case "cash_on_delivery":
      return "Наложен платеж";
    case "card":
      return "Плащане с карта";
    case "bank_transfer":
      return "Банков превод";
    default:
      return method;
  }
}

export function orderStatusBadgeClass(status: string): string {
  switch (status) {
    case "new":
    case "pending_payment":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "processing":
    case "confirmed":
    case "paid":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "shipped":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "delivered":
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "canceled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
}

export function paymentStatusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case "cash_on_delivery":
      return "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100";
    case "awaiting_payment":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "paid":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
}

/** Map legacy DB status values to the new order status model. */
export function normalizeOrderStatus(status: string): OrderStatus {
  switch (status) {
    case "pending_payment":
    case "new":
      return "new";
    case "confirmed":
    case "paid":
    case "processing":
      return "processing";
    case "shipped":
      return "shipped";
    case "completed":
    case "delivered":
      return "delivered";
    case "canceled":
      return "canceled";
    default:
      return "new";
  }
}
